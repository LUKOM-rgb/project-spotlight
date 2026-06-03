import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard paths to search for Opera on Windows
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

// Checks if the local Vite dev server is running
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
      console.error('Please run: npm install -D selenium-webdriver');
      process.exit(1);
    }
  }
}

async function main() {
  const targetUrl = "http://localhost:5173";
  
  console.log(`[*] Checking if server is running at ${targetUrl}...`);
  const isServerRunning = await checkServer(targetUrl);
  if (!isServerRunning) {
    console.warn(`[!] Warning: Local server not detected at ${targetUrl}.`);
    console.warn("    Please make sure your Vite server is running (e.g. npm run dev).");
    console.warn("    Continuing anyway, but the Lighthouse audit might fail.");
  } else {
    console.log("[+] Server is active!");
  }

  // Find Opera
  const operaPath = findOpera();
  if (!operaPath) {
    console.error("[-] Error: Could not locate Opera or Opera GX executable automatically.");
    console.error("    Please modify the OPERA_PATHS array in this script to point to your Opera binary.");
    process.exit(1);
  }
  console.log(`[+] Found Opera executable at: ${operaPath}`);

  // Dynamic import of Selenium after ensuring it's installed
  await ensureDependencies();
  const { Builder } = await import('selenium-webdriver');
  const chrome = await import('selenium-webdriver/chrome.js');

  const htmlReportPath = path.join(__dirname, "lighthouse_report.html");
  const screenshotPath = path.join(__dirname, "lighthouse_report_screenshot.png");

  // 1. Run Lighthouse Audit via npx command using Opera
  console.log("[*] Running Lighthouse audit via npx (using Opera)...");
  
  const env = { ...process.env, CHROME_PATH: operaPath };
  const cmd = `npx lighthouse ${targetUrl} --output html --output-path "${htmlReportPath}" --chrome-flags="--headless" --skip-audits full-page-screenshot`;
  
  console.log(`[*] Executing command: ${cmd}`);
  try {
    execSync(cmd, { env, stdio: 'inherit' });
    console.log("[+] Lighthouse report generated successfully!");
  } catch (err) {
    console.error("[-] Lighthouse execution failed:", err.message);
    console.error("    Ensure you have Node.js installed and access to npx.");
    process.exit(1);
  }

  if (!fs.existsSync(htmlReportPath)) {
    console.error("[-] Error: Lighthouse HTML report file was not found.");
    process.exit(1);
  }

  // 2. Load report in Selenium and take screenshot
  console.log("[*] Launching Selenium (Opera) in headless mode to capture screenshot...");
  
  let options = new chrome.Options();
  options.setChromeBinaryPath(operaPath);
  options.addArguments('--headless');
  options.addArguments('--disable-gpu');
  options.windowSize({ width: 1280, height: 1200 });

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

    const fileUrl = pathToFileURL(htmlReportPath).toString();
    console.log(`[*] Loading report URL: ${fileUrl}`);
    await driver.get(fileUrl);

    // Wait for animations and layout to settle
    console.log("[*] Waiting for report to render...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

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
    console.log(`[*] Adjusting browser window size to: 1280x${scrollHeight}`);
    await driver.manage().window().setSize({ width: 1280, height: scrollHeight });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capture screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    console.log(`[+] Screenshot successfully saved to: ${screenshotPath}`);

  } catch (err) {
    console.error("[-] Selenium execution failed:", err);
    console.error("    If you get a driver mismatch error, try installing/updating chrome driver.");
  } finally {
    if (driver) {
      await driver.quit();
      console.log("[*] Browser closed.");
    }
  }
}

main();
