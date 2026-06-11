import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import process from 'process';

// Load environmental variables before importing Sequelize models
import dotenv from 'dotenv';
dotenv.config({ path: './backend/src/.env' });



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

// Checks if the backend server is running on localhost:3000
function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 2500 }, (res) => {
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
    console.log('[*] selenium-webdriver is not installed. Installing it now...');
    try {
      execSync('npm install --no-save selenium-webdriver', { stdio: 'inherit' });
      console.log('[+] selenium-webdriver installed successfully!');
    } catch (installErr) {
      console.error('[-] Failed to install selenium-webdriver automatically:', installErr);
      process.exit(1);
    }
  }
}

async function main() {
  const db = (await import('../../backend/src/Models/db.js')).default;
  const { sequelize, Utilizador } = db;

  const backendUrl = "http://localhost:3000";
  
  console.log(`[*] Checking if backend server is running at ${backendUrl}...`);
  const isServerRunning = await checkServer(backendUrl);
  if (!isServerRunning) {
    console.error(`[-] Error: Backend server not detected at ${backendUrl}.`);
    process.exit(1);
  }
  console.log("[+] Backend is active!");

  // Find Brave first, fallback to Opera
  const bravePath = findBrave();
  const operaPath = findOpera();
  const browserPath = bravePath || operaPath;
  if (!browserPath) {
    console.error("[-] Error: Could not locate Brave, Opera or Opera GX executable automatically.");
    process.exit(1);
  }
  console.log(`[+] Found browser executable at: ${browserPath}`);

  // Dynamic import of Selenium after ensuring it's installed
  await ensureDependencies();
  const { Builder } = await import('selenium-webdriver');
  const chrome = await import('selenium-webdriver/chrome.js');

  const testResults = [];

  // Temporary accounts variables
  let tempAdminUser, createdUserId;
  let userToken, adminToken;

  const tempPasswordPlain = "password123";
  const tempPasswordHashed = "$2b$10$IHEcl.nGMkLLhqDfczC6wOJ1G/nRjgGSxx3sxlel30Uhi5ur3C1pK"; // bcrypt hash of password123

  try {
    console.log("[*] Setting up admin account in the database...");

    // Create a temporary admin account
    tempAdminUser = await Utilizador.create({
      email: `admin_crud_${Date.now()}@example.com`,
      password: tempPasswordHashed,
      tipo: 'admin',
      data_registo: new Date(),
      nome_utilizador: `admin_crud_${Date.now()}`
    });

    console.log("[+] Admin account created.");

    // Login as admin to get admin token
    console.log("[*] Fetching admin token...");
    let loginRes = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: tempAdminUser.email, password: tempPasswordPlain })
    });
    let loginData = await loginRes.json();
    adminToken = loginData.token;

    const timestamp = Date.now();
    const tempEmail = `crud_user_${timestamp}@example.com`;
    const tempUsername = `crud_user_${timestamp}`;
    const tempPhone = "9" + String(Math.floor(10000000 + Math.random() * 90000000));

    // Define CRUD Test Cases
    const testCases = [
      {
        name: "Caso 1: Criar Conta (CREATE)",
        method: "POST",
        url: () => `${backendUrl}/api/utilizadores`,
        headers: () => ({ 'Content-Type': 'application/json' }),
        body: {
          email: tempEmail,
          password: tempPasswordPlain,
          nome_utilizador: tempUsername,
          numero_telemovel: tempPhone
        },
        expectedStatus: 201,
        assertion: (status, body) => {
          if (status === 201 && body.data && body.data.id_utilizador) {
            createdUserId = body.data.id_utilizador;
            return true;
          }
          return false;
        }
      },
      {
        name: "Login intermédio com a conta criada",
        isMeta: true,
        action: async () => {
          console.log("[*] Performing login for user token...");
          const res = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: tempEmail, password: tempPasswordPlain })
          });
          const data = await res.json();
          userToken = data.token;
        }
      },
      {
        name: "Caso 2: Ler dados do próprio Perfil (READ - /me)",
        method: "GET",
        url: () => `${backendUrl}/api/utilizadores/me`,
        headers: () => ({ 'Authorization': `Bearer ${userToken}` }),
        body: null,
        expectedStatus: 200,
        assertion: (status, body) => {
          return status === 200 && body.data && body.data.email === tempEmail;
        }
      },
      {
        name: "Caso 3: Atualizar dados da Conta (UPDATE)",
        method: "PATCH",
        url: () => `${backendUrl}/api/utilizadores/me`,
        headers: () => ({ 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }),
        body: {
          nome_utilizador: `crud_user_upd_${timestamp}`,
          numero_telemovel: "919999999"
        },
        expectedStatus: 200,
        assertion: (status, body) => {
          return status === 200 && body.data && body.data.nome_utilizador === `crud_user_upd_${timestamp}`;
        }
      },
      {
        name: "Caso 4: Admin lê dados da conta por ID (READ - /:id)",
        method: "GET",
        url: () => `${backendUrl}/api/utilizadores/${createdUserId}`,
        headers: () => ({ 'Authorization': `Bearer ${adminToken}` }),
        body: null,
        expectedStatus: 200,
        assertion: (status, body) => {
          return status === 200 && body.data && body.data.id_utilizador === createdUserId;
        }
      },
      {
        name: "Caso 5: Admin elimina a Conta (DELETE)",
        method: "DELETE",
        url: () => `${backendUrl}/api/utilizadores/${createdUserId}`,
        headers: () => ({ 'Authorization': `Bearer ${adminToken}` }),
        body: null,
        expectedStatus: 200,
        assertion: (status, body) => {
          return status === 200 && body.message && body.message.toLowerCase().includes("removida com sucesso");
        }
      },
      {
        name: "Caso 6: Confirmar que a conta foi apagada do sistema",
        method: "GET",
        url: () => `${backendUrl}/api/utilizadores/${createdUserId}`,
        headers: () => ({ 'Authorization': `Bearer ${adminToken}` }),
        body: null,
        expectedStatus: 404,
        assertion: (status, body) => {
          return status === 404 && JSON.stringify(body).toLowerCase().includes("não foi encontrado");
        }
      }
    ];

    console.log("[*] Running API CRUD tests...");
    for (const tc of testCases) {
      if (tc.isMeta) {
        await tc.action();
        continue;
      }
      
      console.log(`\n[*] Running: ${tc.name}`);
      const targetUrl = typeof tc.url === 'function' ? tc.url() : tc.url;
      const targetHeaders = typeof tc.headers === 'function' ? tc.headers() : (tc.headers || {});
      try {
        const fetchOptions = {
          method: tc.method,
          headers: targetHeaders
        };
        if (tc.body) {
          fetchOptions.body = JSON.stringify(tc.body);
        }
        
        const res = await fetch(targetUrl, fetchOptions);
        const status = res.status;
        const responseBody = await res.json();
        
        const passed = tc.assertion(status, responseBody);
        console.log(passed ? `[+] PASSED (Status: ${status})` : `[-] FAILED (Status: ${status})`);
        
        testResults.push({
          name: tc.name,
          method: tc.method,
          url: targetUrl,
          requestBody: tc.body,
          status: status,
          response: responseBody,
          passed: passed
        });
      } catch (e) {
        console.error(`[-] Test failed with error:`, e.message);
        testResults.push({
          name: tc.name,
          method: tc.method,
          url: targetUrl,
          requestBody: tc.body,
          status: "Error",
          response: { error: e.message },
          passed: false
        });
      }
    }

    // Cleanup admin account
    console.log("\n[*] Cleaning up admin fixtures...");
    await tempAdminUser.destroy().catch(() => {});
    // Cleanup the user if it failed to delete during CRUD
    if (createdUserId) {
      await Utilizador.destroy({ where: { id_utilizador: createdUserId } }).catch(() => {});
    }
    console.log("[+] Database clean.");

  } catch (err) {
    console.error("[-] Error during test setup/teardown:", err);
  } finally {
    // Close the database connection
    await sequelize.close();
  }

  // Generate beautiful HTML report
  const reportHtmlPath = path.join(__dirname, "api_test_report.html");
  const screenshotPath = path.join(__dirname, "api_test_report_screenshot.png");
  
  const passedCount = testResults.filter(r => r.passed).length;
  const failedCount = testResults.length - passedCount;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Testes de API - CRUD de Contas</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0b1329;
      --card-bg: #1a2542;
      --border-color: #2b395e;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --success: #10b981;
      --danger: #ef4444;
      --primary: #06b6d4;
      --primary-gradient: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
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
      color: #cffafe;
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
      background-color: #111a36;
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
      background: #252f4c;
      padding: 2px 6px;
      border-radius: 4px;
      color: #e2e8f0;
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
      background-color: #0b1124;
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
      <h1>Relatório de Testes de API - CRUD de Contas</h1>
      <div class="meta">Verificação das Operações de CRUD do Utilizador • Host: ${backendUrl}</div>
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
      ${testResults.map((r, i) => `
        <div class="test-card ${r.passed ? 'passed' : 'failed'}">
          <div class="test-header">
            <div class="test-title">${r.name}</div>
            <div class="badge ${r.passed ? 'passed' : 'failed'}">${r.passed ? 'Passou' : 'Falhou'}</div>
          </div>
          <div class="test-details">
            <span>${r.method}</span> ${r.url} &bull; HTTP Status: <strong>${r.status}</strong>
          </div>
          
          ${r.requestBody ? `
            <div class="code-block-title">Request Body</div>
            <pre>${JSON.stringify(r.requestBody, null, 2)}</pre>
          ` : ''}
          
          <div class="code-block-title">Response JSON</div>
          <pre>${JSON.stringify(r.response, null, 2)}</pre>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(reportHtmlPath, htmlContent, 'utf-8');
  console.log(`[+] HTML test report generated at: ${reportHtmlPath}`);

  // Headless Browser Screenshot
  console.log("[*] Launching Selenium in headless mode to capture screenshot...");
  
  let options = new chrome.Options();
  options.setChromeBinaryPath(browserPath);
  options.addArguments('--headless');
  options.addArguments('--disable-gpu');
  options.windowSize({ width: 1000, height: 1400 });

  const service = new chrome.ServiceBuilder().addArguments('--disable-build-check');

  let driver;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    const fileUrl = pathToFileURL(reportHtmlPath).toString();
    console.log(`[*] Loading report URL: ${fileUrl}`);
    await driver.get(fileUrl);

    console.log("[*] Waiting for report to render...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get page height dynamically
    const scrollHeight = await driver.executeScript(() => {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      );
    });
    console.log(`[*] Adjusting browser window size to: 1000x${scrollHeight}`);
    await driver.manage().window().setSize({ width: 1000, height: scrollHeight });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capture screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    console.log(`[+] Screenshot successfully saved to: ${screenshotPath}`);

  } catch (err) {
    console.error("[-] Selenium execution failed:", err);
  } finally {
    if (driver) {
      await driver.quit();
      console.log("[*] Browser closed.");
    }
  }
}

main();
