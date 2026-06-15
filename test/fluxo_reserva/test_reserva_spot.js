import fs from 'fs'
import path from 'path'
import http from 'http'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import process from 'process'

// Load environmental variables before importing Sequelize models
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Standard paths to search for Brave on Windows
const BRAVE_PATHS = [
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
]

// Standard paths to search for Opera on Windows (preferring Opera GX)
const OPERA_PATHS = [
  'C:\\Users\\Utilizador\\AppData\\Local\\Programs\\Opera GX\\opera.exe',
  'C:\\Users\\Utilizador\\AppData\\Local\\Programs\\Opera\\opera.exe',
  'C:\\Program Files\\Opera GX\\opera.exe',
  'C:\\Program Files\\Opera\\opera.exe',
  'C:\\Program Files (x86)\\Opera GX\\opera.exe',
  'C:\\Program Files (x86)\\Opera\\opera.exe',
]

// Resolves Brave paths using environment variables and standard paths
function findBrave() {
  const localAppData = process.env.LOCALAPPDATA || ''
  const programFiles = process.env.ProgramFiles || ''
  const programFilesX86 = process.env['ProgramFiles(x86)'] || ''

  const dynamicPaths = []
  if (localAppData) {
    dynamicPaths.push(
      path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
    )
  }
  if (programFiles) {
    dynamicPaths.push(
      path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
    )
  }
  if (programFilesX86) {
    dynamicPaths.push(
      path.join(programFilesX86, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
    )
  }

  const allPaths = [...BRAVE_PATHS, ...dynamicPaths]
  const uniquePaths = [...new Set(allPaths)]

  for (const p of uniquePaths) {
    if (fs.existsSync(p)) {
      return p
    }
  }
  return null
}

// Resolves Opera paths using environment variables and standard paths
function findOpera() {
  const localAppData = process.env.LOCALAPPDATA || ''
  const programFiles = process.env.ProgramFiles || ''
  const programFilesX86 = process.env['ProgramFiles(x86)'] || ''

  const dynamicPaths = []
  if (localAppData) {
    dynamicPaths.push(path.join(localAppData, 'Programs', 'Opera GX', 'opera.exe'))
    dynamicPaths.push(path.join(localAppData, 'Programs', 'Opera', 'opera.exe'))
  }
  if (programFiles) {
    dynamicPaths.push(path.join(programFiles, 'Opera GX', 'opera.exe'))
    dynamicPaths.push(path.join(programFiles, 'Opera', 'opera.exe'))
  }
  if (programFilesX86) {
    dynamicPaths.push(path.join(programFilesX86, 'Programs', 'Opera GX', 'opera.exe'))
    dynamicPaths.push(path.join(programFilesX86, 'Programs', 'Opera', 'opera.exe'))
  }

  const allPaths = [...OPERA_PATHS, ...dynamicPaths]
  const uniquePaths = [...new Set(allPaths)]

  for (const p of uniquePaths) {
    if (fs.existsSync(p)) {
      return p
    }
  }
  return null
}

// Checks if a server is active
function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 2000 }, (res) => {
      resolve(true)
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
  })
}

// Ensures selenium-webdriver is installed
async function ensureDependencies() {
  try {
    await import('selenium-webdriver')
  } catch (err) {
    console.log('[*] selenium-webdriver em falta. A instalar...')
    try {
      execSync('npm install --no-save selenium-webdriver', { stdio: 'inherit' })
      console.log('[+] selenium-webdriver instalado com sucesso!')
    } catch (installErr) {
      console.error('[-] Falha ao instalar selenium-webdriver:', installErr)
      process.exit(1)
    }
  }
}

async function main() {
  // Load configuration
  dotenv.config({ path: './backend/src/.env' })

  // Load database dynamically to prevent ESM hoisting issues
  const db = (await import('../../backend/src/Models/db.js')).default
  const { sequelize, Artista, Utilizador, Categoria, Spot, Reserva } = db

  const frontendUrl = 'http://localhost:5173'
  const backendUrl = 'http://localhost:3000'

  console.log(`[*] A verificar se o frontend está a correr em ${frontendUrl}...`)
  const isFrontendUp = await checkServer(frontendUrl)
  if (!isFrontendUp) {
    console.error(`[-] Erro: Servidor Frontend não detetado em ${frontendUrl}.`)
    process.exit(1)
  }

  console.log(`[*] A verificar se o backend está a correr em ${backendUrl}...`)
  const isBackendUp = await checkServer(backendUrl)
  if (!isBackendUp) {
    console.error(`[-] Erro: Servidor Backend não detetado em ${backendUrl}.`)
    process.exit(1)
  }

  console.log('[+] Servidores ativos! A iniciar o teste do fluxo de reserva...')
  let failed = false

  await ensureDependencies()
  const { Builder, By, until } = await import('selenium-webdriver')
  const chrome = await import('selenium-webdriver/chrome.js')

  const screenshotsDir = path.join(__dirname, 'screenshots')
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true })
  }

  const bravePath = findBrave()
  const operaPath = findOpera()
  let options = new chrome.Options()
  if (bravePath) {
    console.log(`[+] Encontrado executável do Brave: ${bravePath}`)
    options.setChromeBinaryPath(bravePath)
  } else if (operaPath) {
    console.log(`[+] Encontrado executável do Opera: ${operaPath}`)
    options.setChromeBinaryPath(operaPath)
  } else {
    console.log('[*] Executável do Brave ou Opera não encontrado. A usar o Google Chrome padrão...')
  }
  options.addArguments('--headless')
  options.addArguments('--disable-gpu')
  options.windowSize({ width: 1920, height: 1080 })

  const service = new chrome.ServiceBuilder().addArguments('--disable-build-check')

  let driver
  let tempCategory, tempArtist, tempArtistUser, tempSpot

  const tempPasswordPlain = 'password123'
  const tempPasswordHashed = '$2b$10$IHEcl.nGMkLLhqDfczC6wOJ1G/nRjgGSxx3sxlel30Uhi5ur3C1pK' // bcrypt hash of password123

  // Dynamic future date (5 days in the future) to bypass the 24 hours restriction
  const futureDateObj = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  const futureDateStr = futureDateObj.toISOString().split('T')[0]

  try {
    console.log('[*] A configurar fixtures na Base de Dados...')

    // 1. Create temporary category
    tempCategory = await Categoria.create({
      nome_categoria: `Cat_UI_Book_${Date.now()}`,
    })

    // 2. Create temporary artist
    const validityDate = new Date()
    validityDate.setFullYear(validityDate.getFullYear() + 2)
    tempArtist = await Artista.create({
      numero_licenca: `LIC-UI-BOK-${Date.now()}`,
      validade_licenca: validityDate,
      categoria_id: tempCategory.categoria_id,
    })

    // 3. Create temporary artist user
    tempArtistUser = await Utilizador.create({
      email: `artist_ui_bok_${Date.now()}@example.com`,
      password: tempPasswordHashed,
      tipo: 'artista',
      data_registo: new Date(),
      nome_utilizador: `artist_ui_bok_${Date.now()}`,
      id_artista: tempArtist.id_artista,
    })

    // 4. Create temporary spot in Porto coordinates to match map center
    tempSpot = await Spot.create({
      localizacao: `Spot_UI_Book_${Date.now()}`,
      longitude: -8.655,
      latitude: 41.171,
      abertura: '08:00:00',
      fecho: '22:00:00',
    })

    console.log(`[+] Fixtures configuradas. ID do Spot: ${tempSpot.id_spot}`)

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build()

    console.log(`\n[1] A aceder à página de Login: ${frontendUrl}/login`)
    await driver.get(`${frontendUrl}/login`)

    console.log('[*] A preencher credenciais...')
    await driver.wait(until.elementLocated(By.name('identifier')), 5000)
    await driver.findElement(By.name('identifier')).sendKeys(tempArtistUser.email)
    await driver.findElement(By.name('password')).sendKeys(tempPasswordPlain)

    console.log('[*] A submeter login...')
    await driver.findElement(By.css("button[type='submit']")).click()

    // Wait for redirect to dashboard
    await new Promise((r) => setTimeout(r, 3000))

    console.log(`\n[2] A navegar para a página do Mapa: ${frontendUrl}/spots`)
    await driver.get(`${frontendUrl}/spots`)

    // Wait for the Leaflet map and markers to render
    console.log('[*] A aguardar pela renderização do mapa Leaflet...')
    await driver.wait(until.elementLocated(By.css('img.leaflet-marker-icon')), 10000)
    await new Promise((r) => setTimeout(r, 2000))

    console.log('\n[3] A procurar e selecionar o marcador do Spot correto no mapa...')
    const markers = await driver.wait(
      until.elementsLocated(By.css('img.leaflet-marker-icon')),
      10000,
    )
    console.log(`[+] Encontrados ${markers.length} marcadores no mapa.`)

    let found = false
    for (const m of markers) {
      try {
        await driver.executeScript('arguments[0].click();', m)
        await new Promise((r) => setTimeout(r, 600))

        const bodyText = await driver.findElement(By.css('body')).getText()
        if (bodyText.includes(tempSpot.localizacao)) {
          console.log(`[+] Encontrado e selecionado o marcador correto: "${tempSpot.localizacao}"!`)
          found = true
          break
        }
      } catch (clickErr) {
        // Continue iterating
      }
    }

    if (!found) {
      throw new Error(
        `Não foi possível encontrar o marcador da localização "${tempSpot.localizacao}" no mapa.`,
      )
    }

    // Wait for reservation panel to render
    console.log('[*] A aguardar pela atualização do painel de reserva...')
    await driver.wait(until.elementLocated(By.css('div.reservation-panel')), 5000)

    console.log('\n[4] A preencher o formulário de reserva...')
    const dateInput = await driver.findElement(By.css("div.booking-form input[type='date']"))
    const timeInputs = await driver.findElements(By.css("div.booking-form input[type='time']"))
    const startTimeInput = timeInputs[0]
    const endTimeInput = timeInputs[1]

    // Populate using JS execution to ensure regional format bypass
    await driver.executeScript(
      (el, val) => {
        el.value = val
        el.dispatchEvent(new Event('input'))
        el.dispatchEvent(new Event('change'))
      },
      dateInput,
      futureDateStr,
    )

    await driver.executeScript(
      (el, val) => {
        el.value = val
        el.dispatchEvent(new Event('input'))
        el.dispatchEvent(new Event('change'))
      },
      startTimeInput,
      '14:00',
    )

    await driver.executeScript(
      (el, val) => {
        el.value = val
        el.dispatchEvent(new Event('input'))
        el.dispatchEvent(new Event('change'))
      },
      endTimeInput,
      '15:30',
    )

    await new Promise((r) => setTimeout(r, 1000))

    console.log('[*] A capturar ecrã com o formulário de reserva preenchido...')
    const screenshotFormPath = path.join(screenshotsDir, '1_formulario_preenchido.png')
    fs.writeFileSync(screenshotFormPath, await driver.takeScreenshot(), 'base64')
    console.log(`[+] Screenshot 1 (Formulário Preenchido) guardado em: ${screenshotFormPath}`)

    console.log('\n[5] A submeter o pedido de reserva...')
    const confirmBtn = await driver.findElement(By.css('button.btn-reserve'))
    await confirmBtn.click()

    // Wait for the success feedback alert
    console.log('[*] A aguardar pelo feedback de sucesso...')
    await driver.wait(until.elementLocated(By.css('div.feedback.success')), 5000)
    await new Promise((r) => setTimeout(r, 1000))

    console.log('[*] A capturar ecrã com a reserva criada com sucesso...')
    const screenshotSuccessPath = path.join(screenshotsDir, '2_reserva_sucesso.png')
    fs.writeFileSync(screenshotSuccessPath, await driver.takeScreenshot(), 'base64')
    console.log(`[+] Screenshot 2 (Reserva com Sucesso) guardado em: ${screenshotSuccessPath}`)

    console.log('\n[+] TESTE DO FLUXO DE RESERVA CONCLUÍDO COM SUCESSO!')
  } catch (err) {
    console.error('\n[-] Ocorreu um erro durante o teste de reserva:', err)
    failed = true
  } finally {
    // Cleanup created records from DB
    console.log('\n[*] A limpar fixtures da Base de Dados...')
    // Find created reservation for cleanup
    if (tempSpot && tempArtist) {
      await Reserva.destroy({
        where: {
          id_spot: tempSpot.id_spot,
          id_artista: tempArtist.id_artista,
        },
      }).catch(() => {})
    }
    if (tempSpot) {
      await Spot.destroy({ where: { id_spot: tempSpot.id_spot } }).catch(() => {})
    }
    if (tempArtistUser) {
      await tempArtistUser.destroy().catch(() => {})
    }
    if (tempArtist) {
      await tempArtist.destroy().catch(() => {})
    }
    if (tempCategory) {
      await tempCategory.destroy().catch(() => {})
    }
    console.log('[+] Base de Dados limpa.')

    if (driver) {
      await driver.quit()
      console.log('[*] Browser encerrado.')
    }
    await sequelize.close()
  }

  if (failed) {
    process.exit(1)
  }
}

main()
