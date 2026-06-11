import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import process from 'process';

// Load environmental variables before importing Sequelize models
import dotenv from 'dotenv';

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
    dynamicPaths.push(path.join(programFilesX86, "Programs", "Opera GX", "opera.exe"));
    dynamicPaths.push(path.join(programFilesX86, "Programs", "Opera", "opera.exe"));
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
  // Load configuration
  dotenv.config({ path: './backend/src/.env' });

  // Load database dynamically to prevent ESM hoisting issues
  const db = (await import('../../backend/src/Models/db.js')).default;
  const { sequelize, Artista, Utilizador, Categoria } = db;

  const frontendUrl = "http://localhost:5173";
  const backendUrl = "http://localhost:3000";

  console.log(`[*] A verificar se o frontend está a correr em ${frontendUrl}...`);
  const isFrontendUp = await checkServer(frontendUrl);
  if (!isFrontendUp) {
    console.error(`[-] Erro: Servidor Frontend não detetado em ${frontendUrl}.`);
    process.exit(1);
  }

  console.log(`[*] A verificar se o backend está a correr em ${backendUrl}...`);
  const isBackendUp = await checkServer(backendUrl);
  if (!isBackendUp) {
    console.error(`[-] Erro: Servidor Backend não detetado em ${backendUrl}.`);
    process.exit(1);
  }

  console.log("[+] Servidores ativos! A iniciar o teste de perfil...");
  let failed = false;

  await ensureDependencies();
  const { Builder, By, until, Key } = await import('selenium-webdriver');
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
  let tempCategory, tempArtist, tempArtistUser;

  const timestamp = Date.now();
  const initialUsername = `perf_ini_${timestamp}`;
  const updatedUsername = `perf_upd_${timestamp}`;
  const initialEmail = `perf_test_${timestamp}@example.com`;
  const initialPhone = "911222333";
  const updatedPhone = "919999999";
  const tempPasswordPlain = "password123";
  const tempPasswordHashed = "$2b$10$IHEcl.nGMkLLhqDfczC6wOJ1G/nRjgGSxx3sxlel30Uhi5ur3C1pK"; // bcrypt hash of password123

  try {
    console.log("[*] A configurar fixtures na Base de Dados...");

    // 1. Create temporary category
    tempCategory = await Categoria.create({
      nome_categoria: `Cat_UI_Profile_${timestamp}`
    });

    // 2. Create temporary artist
    const validityDate = new Date();
    validityDate.setFullYear(validityDate.getFullYear() + 2);
    tempArtist = await Artista.create({
      numero_licenca: `LIC-UI-PROF-${timestamp}`,
      validade_licenca: validityDate,
      categoria_id: tempCategory.categoria_id
    });

    // 3. Create temporary artist user
    tempArtistUser = await Utilizador.create({
      email: initialEmail,
      password: tempPasswordHashed,
      tipo: 'artista',
      data_registo: new Date(),
      nome_utilizador: initialUsername,
      numero_telemovel: initialPhone,
      id_artista: tempArtist.id_artista
    });

    console.log(`[+] Fixtures configuradas. Email: ${tempArtistUser.email}`);

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    console.log(`\n[1] A aceder à página de Login: ${frontendUrl}/login`);
    await driver.get(`${frontendUrl}/login`);

    console.log("[*] A preencher credenciais...");
    await driver.wait(until.elementLocated(By.name("identifier")), 5000);
    await driver.findElement(By.name("identifier")).sendKeys(tempArtistUser.email);
    await driver.findElement(By.name("password")).sendKeys(tempPasswordPlain);

    console.log("[*] A submeter login...");
    await driver.findElement(By.css("button[type='submit']")).click();

    // Wait for redirect to dashboard
    await new Promise(r => setTimeout(r, 3000));

    console.log(`\n[2] A navegar para a página de Perfil: ${frontendUrl}/profile`);
    await driver.get(`${frontendUrl}/profile`);

    // Wait for profile fields to load
    console.log("[*] A verificar dados atuais do perfil (Consulta)...");
    await driver.wait(until.elementLocated(By.name("nome")), 10000);
    await new Promise(r => setTimeout(r, 1500));

    // Assert that fields show initial data
    const nomeVal = await driver.findElement(By.name("nome")).getAttribute("value");
    const emailVal = await driver.findElement(By.name("email")).getAttribute("value");
    const telVal = await driver.findElement(By.name("telemovel")).getAttribute("value");

    console.log(`    Nome apresentado: "${nomeVal}" (esperado: "${initialUsername}")`);
    console.log(`    Email apresentado: "${emailVal}" (esperado: "${initialEmail}")`);
    console.log(`    Telemóvel apresentado: "${telVal}" (esperado: "${initialPhone}")`);

    if (nomeVal !== initialUsername || emailVal !== initialEmail || telVal !== initialPhone) {
      throw new Error("Os dados iniciais do formulário de perfil não coincidem com as fixtures da BD!");
    }
    console.log("[+] Consulta de perfil validada com sucesso!");

    console.log("[*] A capturar ecrã com os dados atuais do perfil...");
    const screenshotConsultPath = path.join(screenshotsDir, "1_consulta_perfil.png");
    fs.writeFileSync(screenshotConsultPath, await driver.takeScreenshot(), 'base64');
    console.log(`[+] Screenshot 1 (Consulta de Perfil) guardado em: ${screenshotConsultPath}`);

    console.log("\n[3] A editar os dados do Perfil...");
    
    // Clear and enter new Username
    const nameInput = await driver.findElement(By.name("nome"));
    await nameInput.sendKeys(Key.CONTROL, "a");
    await nameInput.sendKeys(Key.BACK_SPACE);
    await nameInput.sendKeys(updatedUsername);

    // Clear and enter new Phone
    const telInput = await driver.findElement(By.name("telemovel"));
    await telInput.sendKeys(Key.CONTROL, "a");
    await telInput.sendKeys(Key.BACK_SPACE);
    await telInput.sendKeys(updatedPhone);

    console.log("[*] A submeter as alterações...");
    const submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Guardar Alterações')]"));
    await submitBtn.click();

    // Wait for success alert message
    console.log("[*] A aguardar pela mensagem de sucesso...");
    await new Promise(r => setTimeout(r, 2000));

    console.log("[*] A capturar ecrã do perfil atualizado...");
    const screenshotEditPath = path.join(screenshotsDir, "2_perfil_editado.png");
    fs.writeFileSync(screenshotEditPath, await driver.takeScreenshot(), 'base64');
    console.log(`[+] Screenshot 2 (Perfil Editado) guardado em: ${screenshotEditPath}`);

    console.log("\n[4] A recarregar a página para verificar a persistência...");
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.name("nome")), 5000);
    await new Promise(r => setTimeout(r, 1500));

    // Assert that fields show updated values
    const nomeValUpd = await driver.findElement(By.name("nome")).getAttribute("value");
    const telValUpd = await driver.findElement(By.name("telemovel")).getAttribute("value");

    console.log(`    Nome após reload: "${nomeValUpd}" (esperado: "${updatedUsername}")`);
    console.log(`    Telemóvel após reload: "${telValUpd}" (esperado: "${updatedPhone}")`);

    if (nomeValUpd !== updatedUsername || telValUpd !== updatedPhone) {
      throw new Error("As alterações do perfil não persistiram no ecrã após o recarregamento!");
    }

    console.log("\n[+] TESTE DE CONSULTA E EDIÇÃO DE PERFIL CONCLUÍDO COM SUCESSO!");

  } catch (err) {
    console.error("\n[-] Ocorreu um erro durante o teste de perfil:", err);
    failed = true;
  } finally {
    // Cleanup created records from DB
    console.log("\n[*] A limpar fixtures da Base de Dados...");
    if (tempArtistUser) {
      await tempArtistUser.destroy().catch(() => {});
    }
    if (tempArtist) {
      await tempArtist.destroy().catch(() => {});
    }
    if (tempCategory) {
      await tempCategory.destroy().catch(() => {});
    }
    console.log("[+] Base de Dados limpa.");

    if (driver) {
      await driver.quit();
      console.log("[*] Browser encerrado.");
    }
    await sequelize.close();
  }

  if (failed) {
    process.exit(1);
  }
}

main();
