import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard paths to search for Opera on Windows (preferring Opera GX)
const OPERA_PATHS = [
  "C:\\Users\\Utilizador\\AppData\\Local\\Programs\\Opera GX\\opera.exe",
  "C:\\Users\\Utilizador\\AppData\\Local\\Programs\\Opera\\opera.exe",
  "C:\\Program Files\\Opera GX\\opera.exe",
  "C:\\Program Files\\Opera\\opera.exe",
  "C:\\Program Files (x86)\\Opera GX\\opera.exe",
  "C:\\Program Files (x86)\\Opera\\opera.exe",
];

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
  const backendUrl = "http://localhost:3000";
  
  console.log(`[*] Checking if backend server is running at ${backendUrl}...`);
  const isServerRunning = await checkServer(backendUrl);
  if (!isServerRunning) {
    console.error(`[-] Error: Backend server not detected at ${backendUrl}.`);
    console.error("    Please make sure your backend server is running (e.g. npm run dev or equivalent).");
    process.exit(1);
  }
  console.log("[+] Backend is active!");

  // Find Opera GX
  const operaPath = findOpera();
  if (!operaPath) {
    console.error("[-] Error: Could not locate Opera or Opera GX executable automatically.");
    process.exit(1);
  }
  console.log(`[+] Found Opera executable at: ${operaPath}`);

  // Dynamic import of Selenium after ensuring it's installed
  await ensureDependencies();
  const { Builder } = await import('selenium-webdriver');
  const chrome = await import('selenium-webdriver/chrome.js');

  const testResults = [];
  
  // 1. Get Categories to find a valid one
  let categoryId = 1;
  try {
    const res = await fetch(`${backendUrl}/api/categorias`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        categoryId = data[0].categoria_id || 1;
        console.log(`[+] Selected Category ID for testing: ${categoryId}`);
      }
    }
  } catch (e) {
    console.log(`[!] Warning: Failed to fetch categories, defaulting to Category ID 1: ${e.message}`);
  }

  // 2. Register a temporary user for the tests
  let testUserId = null;
  const tempEmail = `test_user_${Date.now()}@example.com`;
  console.log(`[*] Registering temporary test user with email: ${tempEmail}...`);
  try {
    const res = await fetch(`${backendUrl}/api/utilizadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tempEmail,
        password: "password123",
        nome_utilizador: "Test User Data Validade",
        numero_telemovel: 912345678
      })
    });
    const data = await res.json();
    if (res.ok && data.data && data.data.id_utilizador) {
      testUserId = data.data.id_utilizador;
      console.log(`[+] Temporary user registered successfully with ID: ${testUserId}`);
    } else {
      console.error("[-] Failed to register temporary user:", data);
      process.exit(1);
    }
  } catch (e) {
    console.error("[-] Connection failed while registering temporary user:", e.message);
    process.exit(1);
  }

  // Define our API Test Cases
  const cases = [
    {
      name: "Validação 1: Data de Validade em Falta",
      method: "PATCH",
      url: `${backendUrl}/api/utilizadores/${testUserId}/role`,
      body: {
        tipo: "artista",
        numero_licenca: `LIC_${Date.now()}`,
        categoria_id: categoryId
      },
      expectedStatus: 400,
      assertion: (status, body) => {
        return status === 400 && (body.error || body.details || JSON.stringify(body).toLowerCase().includes("obrigat"));
      }
    },
    {
      name: "Validação 2: Formato de Data Inválido",
      method: "PATCH",
      url: `${backendUrl}/api/utilizadores/${testUserId}/role`,
      body: {
        tipo: "artista",
        numero_licenca: `LIC_${Date.now()}`,
        validade_licenca: "data-invalida",
        categoria_id: categoryId
      },
      expectedStatus: 400,
      assertion: (status, body) => {
        const bodyStr = JSON.stringify(body);
        return status === 400 && bodyStr.includes("formato de data inválido");
      }
    },
    {
      name: "Validação 3: Formato de Data Correto (Sucesso)",
      method: "PATCH",
      url: `${backendUrl}/api/utilizadores/${testUserId}/role`,
      body: {
        tipo: "artista",
        numero_licenca: `LIC_${Date.now()}`,
        validade_licenca: "2030-12-31",
        categoria_id: categoryId
      },
      expectedStatus: 200,
      assertion: (status, body) => {
        return status === 200 || status === 201;
      }
    }
  ];

  // 3. Run the Test Cases
  console.log("[*] Running API tests for license date validation...");
  for (const tc of cases) {
    console.log(`\n[*] Running: ${tc.name}`);
    try {
      const res = await fetch(tc.url, {
        method: tc.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tc.body)
      });
      
      const status = res.status;
      const responseBody = await res.json();
      
      const passed = tc.assertion(status, responseBody);
      console.log(passed ? `[+] PASSED (Status: ${status})` : `[-] FAILED (Status: ${status})`);
      
      testResults.push({
        name: tc.name,
        method: tc.method,
        url: tc.url,
        requestBody: tc.body,
        status: status,
        response: responseBody,
        passed: passed
      });
    } catch (e) {
      console.error(`[-] Test failed with network/code error:`, e.message);
      testResults.push({
        name: tc.name,
        method: tc.method,
        url: tc.url,
        requestBody: tc.body,
        status: "Error",
        response: { error: e.message },
        passed: false
      });
    }
  }

  // 4. Cleanup/Restore User Role to "utilizador"
  console.log("\n[*] Cleaning up: Downgrading test user back to 'utilizador'...");
  try {
    await fetch(`${backendUrl}/api/utilizadores/${testUserId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: "utilizador" })
    });
    console.log("[+] Cleanup completed successfully.");
  } catch (e) {
    console.log(`[!] Cleanup warning: ${e.message}`);
  }

  // 5. Generate beautiful HTML report
  const reportHtmlPath = path.join(__dirname, "api_test_report.html");
  const screenshotPath = path.join(__dirname, "api_test_report_screenshot.png");
  
  const passedCount = testResults.filter(r => r.passed).length;
  const failedCount = testResults.length - passedCount;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Testes de API - Licenças</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0f172a;
      --card-bg: #1e293b;
      --border-color: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --success: #22c55e;
      --danger: #ef4444;
      --primary: #8b5cf6;
      --primary-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
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
    }

    .meta {
      font-size: 14px;
      color: #e2e8f0;
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
      background-color: #111827;
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
      background-color: rgba(34, 197, 94, 0.15);
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
      background: #1f2937;
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
      background-color: #030712;
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
      <h1>Relatório de Testes de API</h1>
      <div class="meta">Validação das Datas de Validade das Licenças • Host: ${backendUrl}</div>
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
          
          <div class="code-block-title">Request Body</div>
          <pre>${JSON.stringify(r.requestBody, null, 2)}</pre>
          
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

  // 6. Selenium Screenshot
  console.log("[*] Launching Selenium (Opera GX) in headless mode to capture screenshot...");
  
  let options = new chrome.Options();
  options.setChromeBinaryPath(operaPath);
  options.addArguments('--headless');
  options.addArguments('--disable-gpu');
  options.windowSize({ width: 1000, height: 1350 }); // Higher height to capture all 3 cases nicely

  // Create Service to bypass version mismatch checks between Opera and ChromeDriver
  const service = new chrome.ServiceBuilder()
    .addArguments('--disable-build-check');

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

    // Wait for page load
    console.log("[*] Waiting for report to render...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get the full height of the page dynamically to avoid truncation
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
