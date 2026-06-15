import fs from 'fs'
import path from 'path'
import http from 'http'
import { execSync } from 'child_process'
import { fileURLToPath, pathToFileURL } from 'url'
import process from 'process'

// Load environmental variables before importing Sequelize models
import dotenv from 'dotenv'
dotenv.config({ path: './backend/src/.env' })

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
    dynamicPaths.push(path.join(programFilesX86, 'Opera GX', 'opera.exe'))
    dynamicPaths.push(path.join(programFilesX86, 'Opera', 'opera.exe'))
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

// Checks if the backend server is running on localhost:3000
function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 2500 }, (res) => {
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
    console.log('[*] selenium-webdriver is not installed. Installing it now...')
    try {
      execSync('npm install --no-save selenium-webdriver', { stdio: 'inherit' })
      console.log('[+] selenium-webdriver installed successfully!')
    } catch (installErr) {
      console.error('[-] Failed to install selenium-webdriver automatically:', installErr)
      process.exit(1)
    }
  }
}

async function main() {
  dotenv.config({ path: './backend/src/.env' })
  const db = (await import('../../backend/src/Models/db.js')).default
  const { sequelize, Artista, Utilizador, Categoria, Spot, Reserva } = db

  const backendUrl = 'http://localhost:3000'

  console.log(`[*] Checking if backend server is running at ${backendUrl}...`)
  const isServerRunning = await checkServer(backendUrl)
  if (!isServerRunning) {
    console.error(`[-] Error: Backend server not detected at ${backendUrl}.`)
    process.exit(1)
  }
  console.log('[+] Backend is active!')

  // Find Brave first, fallback to Opera
  const bravePath = findBrave()
  const operaPath = findOpera()
  const browserPath = bravePath || operaPath
  if (!browserPath) {
    console.error('[-] Error: Could not locate Brave, Opera or Opera GX executable automatically.')
    process.exit(1)
  }
  console.log(`[+] Found browser executable at: ${browserPath}`)

  // Dynamic import of Selenium after ensuring it's installed
  await ensureDependencies()
  const { Builder } = await import('selenium-webdriver')
  const chrome = await import('selenium-webdriver/chrome.js')

  const testResults = []

  // Variables for holding temporary records
  let tempCategory, tempArtist, tempArtistUser, tempSpot
  let artistToken
  let firstReservaId, secondReservaId

  const tempPasswordPlain = 'password123'
  const tempPasswordHashed = '$2b$10$IHEcl.nGMkLLhqDfczC6wOJ1G/nRjgGSxx3sxlel30Uhi5ur3C1pK' // bcrypt hash of password123

  // Dynamic Date calculation to bypass the 24 hours limitation
  const todayStr = new Date().toISOString().split('T')[0]
  const futureDateObj = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  const futureDateStr = futureDateObj.toISOString().split('T')[0]

  try {
    console.log('[*] Setting up database fixtures for reservation tests...')

    // 1. Create temporary category
    tempCategory = await Categoria.create({
      nome_categoria: `Cat_Res_Test_${Date.now()}`,
    })

    // 2. Create temporary artist
    const validityDate = new Date()
    validityDate.setFullYear(validityDate.getFullYear() + 2)
    tempArtist = await Artista.create({
      numero_licenca: `LIC-RES-${Date.now()}`,
      validade_licenca: validityDate,
      categoria_id: tempCategory.categoria_id,
    })

    // 3. Create temporary artist user
    tempArtistUser = await Utilizador.create({
      email: `artist_res_${Date.now()}@example.com`,
      password: tempPasswordHashed,
      tipo: 'artista',
      data_registo: new Date(),
      nome_utilizador: `artist_res_${Date.now()}`,
      id_artista: tempArtist.id_artista,
    })

    // 4. Create temporary spot
    tempSpot = await Spot.create({
      localizacao: `Spot_Res_Test_${Date.now()}`,
      longitude: -9.1393,
      latitude: 38.7223,
      abertura: '08:00:00',
      fecho: '22:00:00',
    })

    console.log('[+] Database fixtures created successfully.')

    // Login as artist to get token
    console.log('[*] Fetching artist token via API...')
    let loginRes = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: tempArtistUser.email, password: tempPasswordPlain }),
    })
    let loginData = await loginRes.json()
    artistToken = loginData.token

    // Run the API Test Cases
    const testCases = [
      {
        name: 'Caso 1: Criar uma reserva válida (Sucesso)',
        method: 'POST',
        url: () => `${backendUrl}/api/reservas/${tempSpot.id_spot}/`,
        headers: () => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        }),
        body: () => ({
          data_evento: futureDateStr,
          hora_inicio: '14:00',
          hora_fim: '15:30',
        }),
        expectedStatus: 201,
        assertion: (status, body) => {
          if (status === 201 && body.data && body.data.id_reserva) {
            firstReservaId = body.data.id_reserva
            return true
          }
          return false
        },
      },
      {
        name: 'Caso 2: Tentar criar uma reserva com início após fim (Erro)',
        method: 'POST',
        url: () => `${backendUrl}/api/reservas/${tempSpot.id_spot}/`,
        headers: () => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        }),
        body: () => ({
          data_evento: futureDateStr,
          hora_inicio: '16:00',
          hora_fim: '15:00',
        }),
        expectedStatus: 400,
        assertion: (status, body) => {
          return status === 400 && JSON.stringify(body).toLowerCase().includes('antes de hora_fim')
        },
      },
      {
        name: 'Caso 3: Tentar criar uma reserva com duração inferior a 30 minutos (Erro)',
        method: 'POST',
        url: () => `${backendUrl}/api/reservas/${tempSpot.id_spot}/`,
        headers: () => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        }),
        body: () => ({
          data_evento: futureDateStr,
          hora_inicio: '14:00',
          hora_fim: '14:20',
        }),
        expectedStatus: 400,
        assertion: (status, body) => {
          return status === 400 && JSON.stringify(body).toLowerCase().includes('reserva inválida')
        },
      },
      {
        name: 'Caso 4: Tentar criar uma reserva com duração superior a 2 horas (Erro)',
        method: 'POST',
        url: () => `${backendUrl}/api/reservas/${tempSpot.id_spot}/`,
        headers: () => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        }),
        body: () => ({
          data_evento: futureDateStr,
          hora_inicio: '14:00',
          hora_fim: '17:00',
        }),
        expectedStatus: 400,
        assertion: (status, body) => {
          return status === 400 && JSON.stringify(body).toLowerCase().includes('reserva inválida')
        },
      },
      {
        name: 'Caso 5: Tentar criar uma reserva com menos de 24h de antecedência (Erro)',
        method: 'POST',
        url: () => `${backendUrl}/api/reservas/${tempSpot.id_spot}/`,
        headers: () => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        }),
        body: () => ({
          data_evento: todayStr,
          hora_inicio: '14:00',
          hora_fim: '15:30',
        }),
        expectedStatus: 409,
        assertion: (status, body) => {
          return status === 409 && JSON.stringify(body).toLowerCase().includes('menos de 24 horas')
        },
      },
      {
        name: 'Caso 6: Tentar criar uma reserva sobreposta no mesmo dia/hora/spot (Erro)',
        method: 'POST',
        url: () => `${backendUrl}/api/reservas/${tempSpot.id_spot}/`,
        headers: () => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        }),
        body: () => ({
          data_evento: futureDateStr,
          hora_inicio: '15:00',
          hora_fim: '16:00', // Overlaps with 14:00-15:30
        }),
        expectedStatus: 409,
        assertion: (status, body) => {
          return status === 409 && JSON.stringify(body).toLowerCase().includes('já está reservado')
        },
      },
      {
        name: 'Criação intermédia de uma segunda reserva não sobreposta',
        isMeta: true,
        action: async () => {
          console.log('[*] Creating second reservation...')
          const res = await fetch(`${backendUrl}/api/reservas/${tempSpot.id_spot}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${artistToken}`,
            },
            body: JSON.stringify({
              data_evento: futureDateStr,
              hora_inicio: '16:00',
              hora_fim: '17:30',
            }),
          })
          const data = await res.json()
          if (res.status === 201) {
            secondReservaId = data.data.id_reserva
            console.log(`[+] Second reservation created with ID: ${secondReservaId}`)
          } else {
            console.error('[-] Failed to create second reservation:', data)
          }
        },
      },
      {
        name: 'Caso 7: Atualizar reserva para horário sobreposto (Erro)',
        method: 'PATCH',
        url: () => `${backendUrl}/api/reservas/${secondReservaId}`,
        headers: () => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        }),
        body: () => ({
          hora_inicio: '15:00',
          hora_fim: '16:00', // Overlaps with first reservation (14:00-15:30)
        }),
        expectedStatus: 409,
        assertion: (status, body) => {
          return (
            status === 409 &&
            JSON.stringify(body).toLowerCase().includes('já existe uma reserva neste horário')
          )
        },
      },
    ]

    console.log('[*] Running API conflict tests...')
    for (const tc of testCases) {
      if (tc.isMeta) {
        await tc.action()
        continue
      }

      console.log(`\n[*] Running: ${tc.name}`)
      const targetUrl = typeof tc.url === 'function' ? tc.url() : tc.url
      const targetHeaders = typeof tc.headers === 'function' ? tc.headers() : tc.headers || {}
      const targetBody = typeof tc.body === 'function' ? tc.body() : tc.body

      try {
        const fetchOptions = {
          method: tc.method,
          headers: targetHeaders,
        }
        if (targetBody) {
          fetchOptions.body = JSON.stringify(targetBody)
        }

        const res = await fetch(targetUrl, fetchOptions)
        const status = res.status
        const responseBody = await res.json()

        const passed = tc.assertion(status, responseBody)
        console.log(passed ? `[+] PASSED (Status: ${status})` : `[-] FAILED (Status: ${status})`)

        testResults.push({
          name: tc.name,
          method: tc.method,
          url: targetUrl,
          requestBody: targetBody,
          status: status,
          response: responseBody,
          passed: passed,
        })
      } catch (e) {
        console.error(`[-] Test failed with error:`, e.message)
        testResults.push({
          name: tc.name,
          method: tc.method,
          url: targetUrl,
          requestBody: targetBody,
          status: 'Error',
          response: { error: e.message },
          passed: false,
        })
      }
    }

    // Cleanup created test records
    console.log('\n[*] Tearing down database fixtures...')
    if (firstReservaId) {
      await Reserva.destroy({ where: { id_reserva: firstReservaId } }).catch(() => {})
    }
    if (secondReservaId) {
      await Reserva.destroy({ where: { id_reserva: secondReservaId } }).catch(() => {})
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
    console.log('[+] Database clean.')
  } catch (err) {
    console.error('[-] Error during test execution setup/teardown:', err)
  } finally {
    // Close the database connection
    await sequelize.close()
  }

  // Generate beautiful HTML report
  const reportHtmlPath = path.join(__dirname, 'api_test_report.html')
  const screenshotPath = path.join(__dirname, 'api_test_report_screenshot.png')

  const passedCount = testResults.filter((r) => r.passed).length
  const failedCount = testResults.length - passedCount

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Testes de API - Conflitos de Reservas</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0d0e15;
      --card-bg: #161a29;
      --border-color: #272d47;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --success: #10b981;
      --danger: #ef4444;
      --primary: #8b5cf6;
      --primary-gradient: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .container {
      width: 100%;
      max-width: 900px;
    }

    header {
      background: var(--primary-gradient);
      padding: 30px;
      border-radius: 16px 16px 0 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 6px;
      color: #ffffff;
    }

    .meta {
      font-size: 14px;
      color: #ddd6fe;
      font-weight: 300;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    }

    .summary-card {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 15px;
      text-align: center;
      transition: transform 0.2s;
    }

    .summary-card:hover {
      transform: translateY(-2px);
    }

    .summary-card h3 {
      font-size: 13px;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .summary-card p {
      font-size: 28px;
      font-weight: 700;
    }

    .summary-card.passed p {
      color: var(--success);
    }

    .summary-card.failed p {
      color: var(--danger);
    }

    .results-container {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 0 0 16px 16px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .test-card {
      background-color: #0f121d;
      border-left: 5px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: 20px;
      padding: 20px;
      position: relative;
      transition: all 0.3s ease;
    }

    .test-card.passed {
      border-left-color: var(--success);
    }

    .test-card.failed {
      border-left-color: var(--danger);
    }

    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .test-title {
      font-size: 16px;
      font-weight: 600;
    }

    .badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .badge.passed {
      background-color: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .badge.failed {
      background-color: rgba(239, 68, 68, 0.15);
      color: var(--danger);
    }

    .test-details {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 10px;
    }

    .test-details span {
      background: #20273a;
      padding: 2px 6px;
      border-radius: 4px;
      color: #cbd5e1;
      font-family: monospace;
      margin-right: 5px;
    }

    .code-block-title {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 10px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    pre {
      background-color: #06080e;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      padding: 12px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      overflow-x: auto;
      color: #e2e8f0;
      max-height: 150px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Relatório de Testes de API - Conflitos de Reservas</h1>
      <div class="meta">Validação de Reservas Sobrepostas e Restrições Horárias • Host: ${backendUrl}</div>
    </header>

    <div class="summary-cards">
      <div class="summary-card">
        <h3>Total Testes</h3>
        <p>${testResults.length}</p>
      </div>
      <div class="summary-card passed">
        <h3>Passaram</h3>
        <p>${passedCount}</p>
      </div>
      <div class="summary-card failed">
        <h3>Falharam</h3>
        <p>${failedCount}</p>
      </div>
    </div>

    <div class="results-container">
      ${testResults
        .map(
          (r, i) => `
        <div class="test-card ${r.passed ? 'passed' : 'failed'}">
          <div class="test-header">
            <div class="test-title">${r.name}</div>
            <div class="badge ${r.passed ? 'passed' : 'failed'}">${r.passed ? 'Passou' : 'Falhou'}</div>
          </div>
          <div class="test-details">
            <span>${r.method}</span> ${r.url} &bull; HTTP Status: <strong>${r.status}</strong>
          </div>

          ${
            r.requestBody
              ? `
            <div class="code-block-title">Request Body</div>
            <pre>${JSON.stringify(r.requestBody, null, 2)}</pre>
          `
              : ''
          }

          <div class="code-block-title">Response JSON</div>
          <pre>${JSON.stringify(r.response, null, 2)}</pre>
        </div>
      `,
        )
        .join('')}
    </div>
  </div>
</body>
</html>
  `

  fs.writeFileSync(reportHtmlPath, htmlContent, 'utf-8')
  console.log(`[+] HTML test report generated at: ${reportHtmlPath}`)

  // Headless Browser Screenshot
  console.log('[*] Launching Selenium in headless mode to capture screenshot...')

  let options = new chrome.Options()
  options.setChromeBinaryPath(browserPath)
  options.addArguments('--headless')
  options.addArguments('--disable-gpu')
  options.addArguments('--allow-file-access-from-files')
  options.addArguments('--remote-allow-origins=*')
  options.windowSize({ width: 1920, height: 1600 })

  const service = new chrome.ServiceBuilder().addArguments('--disable-build-check')

  let driver
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build()

    const fileUrl = pathToFileURL(reportHtmlPath).toString()
    console.log(`[*] Loading report URL: ${fileUrl}`)
    await driver.get(fileUrl)

    console.log('[*] Waiting for report to render...')
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Get page height dynamically
    const scrollHeight = await driver.executeScript(() => {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight,
      )
    })
    console.log(`[*] Adjusting browser window size to: 1920x${scrollHeight}`)
    await driver.manage().window().setSize({ width: 1920, height: scrollHeight })
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Capture screenshot
    const screenshot = await driver.takeScreenshot()
    fs.writeFileSync(screenshotPath, screenshot, 'base64')
    console.log(`[+] Screenshot successfully saved to: ${screenshotPath}`)
  } catch (err) {
    console.error('[-] Selenium execution failed:', err)
  } finally {
    if (driver) {
      await driver.quit()
      console.log('[*] Browser closed.')
    }
  }
}

main()
