import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard paths to search for Brave on Windows
const BRAVE_PATHS = [
  "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
];

// Standard paths to search for Opera on Windows (preferring Opera GX)
const OPERA_PATHS = [
  "C:\\Users\\Utilizador\\AppData\\Local\\Programs\\Opera GX\\opera.exe",
  "C:\\Users\\Utilizador\\AppData\\Local\\Programs\\Opera\\opera.exe",
  "C:\\Program Files\\Opera GX\\opera.exe",
  "C:\\Program Files\\Opera\\opera.exe",
  "C:\\Program Files (x86)\\Opera GX\\opera.exe",
  "C:\\Program Files (x86)\\Opera\\opera.exe",
];

// Resolves Brave paths using environment variables and standard paths
function findBrave() {
  const localAppData = process.env.LOCALAPPDATA || "";
  const programFiles = process.env.ProgramFiles || "";
  const programFilesX86 = process.env["ProgramFiles(x86)"] || "";
  
  const dynamicPaths = [];
  if (localAppData) {
    dynamicPaths.push(path.join(localAppData, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"));
  }
  if (programFiles) {
    dynamicPaths.push(path.join(programFiles, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"));
  }
  if (programFilesX86) {
    dynamicPaths.push(path.join(programFilesX86, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"));
  }
  
  const allPaths = [...BRAVE_PATHS, ...dynamicPaths];
  const uniquePaths = [...new Set(allPaths)];
  
  for (const p of uniquePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// Resolves Opera paths using environment variables and standard paths
function findOpera() {
  const localAppData = process.env.LOCALAPPDATA || "";
  const programFiles = process.env.ProgramFiles || "";
  const programFilesX86 = process.env["ProgramFiles(x86)"] || "";
  
  const dynamicPaths = [];
  if (localAppData) {
    dynamicPaths.push(path.join(localAppData, "Programs", "Opera GX", "opera.exe"));
    dynamicPaths.push(path.join(localAppData, "Programs", "Opera", "opera.exe"));
  }
  if (programFiles) {
    dynamicPaths.push(path.join(programFiles, "Opera GX", "opera.exe"));
    dynamicPaths.push(path.join(programFiles, "Opera", "opera.exe"));
  }
  if (programFilesX86) {
    dynamicPaths.push(path.join(programFilesX86, "Opera GX", "opera.exe"));
    dynamicPaths.push(path.join(programFilesX86, "Opera", "opera.exe"));
  }
  
  const allPaths = [...OPERA_PATHS, ...dynamicPaths];
  const uniquePaths = [...new Set(allPaths)];
  
  for (const p of uniquePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// Checks if a server is active
function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 2000 }, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Ensures selenium-webdriver is installed
async function ensureDependencies() {
  try {
    await import('selenium-webdriver');
  } catch (err) {
    console.log('[*] selenium-webdriver em falta. A instalar...');
    try {
      execSync('npm install --no-save selenium-webdriver', { stdio: 'inherit' });
      console.log('[+] selenium-webdriver instalado com sucesso!');
    } catch (installErr) {
      console.error('[-] Falha ao instalar selenium-webdriver:', installErr);
      process.exit(1);
    }
  }
}

async function main() {
  const frontendUrl = "http://localhost:5173";
  const backendUrl = "http://localhost:3000";

  console.log(`[*] A verificar se o frontend está a correr em ${frontendUrl}...`);
  const isFrontendUp = await checkServer(frontendUrl);
  if (!isFrontendUp) {
    console.error(`[-] Erro: Servidor Frontend não detetado em ${frontendUrl}.`);
    console.error("    Por favor inicia o frontend (ex: npm run dev) antes de correr o teste.");
    process.exit(1);
  }

  console.log(`[*] A verificar se o backend está a correr em ${backendUrl}...`);
  const isBackendUp = await checkServer(backendUrl);
  if (!isBackendUp) {
    console.error(`[-] Erro: Servidor Backend não detetado em ${backendUrl}.`);
    console.error("    Por favor inicia o backend antes de correr o teste.");
    process.exit(1);
  }

  console.log("[+] Servidores ativos! A iniciar o teste...");
  let failed = false;

  await ensureDependencies();
  const { Builder, By, until } = await import('selenium-webdriver');
  const chrome = await import('selenium-webdriver/chrome.js');

  const screenshotsDir = path.join(__dirname, "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const bravePath = findBrave();
  const operaPath = findOpera();
  let options = new chrome.Options();
  if (bravePath) {
    console.log(`[+] Encontrado executável do Brave: ${bravePath}`);
    options.setChromeBinaryPath(bravePath);
  } else if (operaPath) {
    console.log(`[+] Encontrado executável do Opera: ${operaPath}`);
    options.setChromeBinaryPath(operaPath);
  } else {
    console.log("[*] Executável do Brave ou Opera não encontrado. A usar o Google Chrome padrão...");
  }
  options.addArguments('--headless');
  options.addArguments('--disable-gpu');
  options.windowSize({ width: 1280, height: 900 });

  const service = new chrome.ServiceBuilder().addArguments('--disable-build-check');

  let driver;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    const timestamp = Date.now();
    const tempUsername = `artista_auto_${timestamp}`;
    const tempEmail = `artista_auto_${timestamp}@example.com`;
    const tempPassword = `Password123`;
    const tempPhone = `9` + String(Math.floor(10000000 + Math.random() * 90000000));

    console.log(`\n[1] A aceder à página de Registo: ${frontendUrl}/register`);
    await driver.get(`${frontendUrl}/register`);

    console.log("[*] A preencher formulário de registo...");
    await driver.wait(until.elementLocated(By.name("nome_utilizador")), 5000);
    await driver.findElement(By.name("nome_utilizador")).sendKeys(tempUsername);
    await driver.findElement(By.name("email")).sendKeys(tempEmail);
    await driver.findElement(By.name("numero_telemovel")).sendKeys(tempPhone);
    await driver.findElement(By.name("password")).sendKeys(tempPassword);

    console.log("[*] A submeter o registo...");
    await driver.findElement(By.css("button[type='submit']")).click();

    // Esperar pela mensagem de sucesso ou redirecionamento
    await new Promise(r => setTimeout(r, 2500));
    const regScreenshotPath = path.join(screenshotsDir, "1_registro_sucesso.png");
    fs.writeFileSync(regScreenshotPath, await driver.takeScreenshot(), 'base64');
    console.log(`[+] Screenshot 1 (Registo) guardado em: ${regScreenshotPath}`);

    console.log(`\n[2] A aceder à página de Login: ${frontendUrl}/login`);
    await driver.get(`${frontendUrl}/login`);

    console.log("[*] A preencher credenciais do utilizador comum...");
    await driver.wait(until.elementLocated(By.name("identifier")), 5000);
    await driver.findElement(By.name("identifier")).sendKeys(tempEmail);
    await driver.findElement(By.name("password")).sendKeys(tempPassword);

    console.log("[*] A submeter login...");
    await driver.findElement(By.css("button[type='submit']")).click();

    // Esperar redirecionar para a Dashboard
    await new Promise(r => setTimeout(r, 3000));
    const loginUserScreenshotPath = path.join(screenshotsDir, "2_login_utilizador_comum.png");
    fs.writeFileSync(loginUserScreenshotPath, await driver.takeScreenshot(), 'base64');
    console.log(`[+] Screenshot 2 (Dashboard Utilizador Comum) guardado em: ${loginUserScreenshotPath}`);

    console.log(`\n[3] A navegar para a página de Perfil: ${frontendUrl}/profile`);
    await driver.get(`${frontendUrl}/profile`);

    await driver.wait(until.elementLocated(By.name("licenca")), 5000);
    await driver.findElement(By.name("licenca")).sendKeys(`LIC-${timestamp}`);
    const dateInput = await driver.findElement(By.name("validade"));
    await driver.executeScript((el) => {
      el.value = '2031-12-31';
      el.dispatchEvent(new Event('input'));
      el.dispatchEvent(new Event('change'));
    }, dateInput);

    console.log("[*] A selecionar categoria...");
    const selectElement = await driver.findElement(By.css("select"));
    await selectElement.click();
    const optionsList = await selectElement.findElements(By.css("option"));
    for (const opt of optionsList) {
      const isDisabled = await opt.getAttribute("disabled");
      const val = await opt.getAttribute("value");
      if (!isDisabled && val) {
        await opt.click();
        console.log(`[+] Categoria selecionada ID: ${val}`);
        break;
      }
    }

    // Tirar o print com o formulário de promoção preenchido ANTES de submeter
    await new Promise(r => setTimeout(r, 1000));
    const promoteScreenshotPath = path.join(screenshotsDir, "3_promocao_formulario_preenchido.png");
    fs.writeFileSync(promoteScreenshotPath, await driver.takeScreenshot(), 'base64');
    console.log(`[+] Screenshot 3 (Formulário Preenchido) guardado em: ${promoteScreenshotPath}`);

    console.log("[*] A submeter promoção...");
    const promoteButton = await driver.findElement(By.xpath("//button[contains(., 'Tornar-me Artista')]"));
    await promoteButton.click();

    // Esperar o feedback do backend e mudança de estado
    await new Promise(r => setTimeout(r, 3000));
    const successScreenshotPath = path.join(screenshotsDir, "4_promovido_com_sucesso.png");
    fs.writeFileSync(successScreenshotPath, await driver.takeScreenshot(), 'base64');
    console.log(`[+] Screenshot 4 (Sucesso da Promoção) guardado em: ${successScreenshotPath}`);

    console.log("\n[4] A terminar sessão...");
    const logoutBtn = await driver.findElement(By.xpath("//button[contains(., 'Terminar Sessão')]"));
    await logoutBtn.click();

    await new Promise(r => setTimeout(r, 2000));

    console.log("[5] A efetuar login novamente como Artista...");
    await driver.get(`${frontendUrl}/login`);
    await driver.wait(until.elementLocated(By.name("identifier")), 5000);
    await driver.findElement(By.name("identifier")).sendKeys(tempEmail);
    await driver.findElement(By.name("password")).sendKeys(tempPassword);
    await driver.findElement(By.css("button[type='submit']")).click();

    // Esperar redirecionamento da Dashboard
    await new Promise(r => setTimeout(r, 3000));
    const loginArtistScreenshotPath = path.join(screenshotsDir, "5_login_artista_sucesso.png");
    fs.writeFileSync(loginArtistScreenshotPath, await driver.takeScreenshot(), 'base64');
    console.log(`[+] Screenshot 5 (Dashboard Artista) guardado em: ${loginArtistScreenshotPath}`);

    console.log("\n[+] TESTE CONCLUÍDO COM SUCESSO!");
    console.log(`Podes ver os prints gerados na pasta:\n  ${screenshotsDir}`);

  } catch (err) {
    console.error("\n[-] Ocorreu um erro durante a execução do teste:", err);
    failed = true;
  } finally {
    if (driver) {
      await driver.quit();
      console.log("[*] Browser encerrado.");
    }
  }

  if (failed) {
    process.exit(1);
  }
}

main();
