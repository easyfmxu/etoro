const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../data/photo");
const BASE = "https://photogov.net";
const testMode = false;

function randomDelay(min = 1000, max = 3000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const fsp = fs.promises;
const failedTasks = [];
const visitedUrls = new Set(); // ✅ 用于去重访问

async function createDirectory(dirPath) {
  try {
    await fsp.mkdir(dirPath, { recursive: true });
    console.log(`📁 Directory created: ${dirPath}`);
  } catch (err) {
    console.error(`❌ Error creating directory '${dirPath}':`, err.message);
  }
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function gotoWithRetry(page, url, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`→ Visiting ${url} (attempt ${attempt + 1})...`);
      await page.goto(url, {
        waitUntil: "networkidle", // try full load first
        timeout: 15000,
      });
      return true; // success
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt + 1} failed: ${err.message}`);

      // Final attempt fallback: just get page with lighter wait strategy
      if (attempt === maxRetries) {
        try {
          console.log(`🟡 Fallback: Visiting ${url} with domcontentloaded...`);
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 10000,
          });
          return true;
        } catch (fallbackErr) {
          console.error(`❌ Fallback also failed for ${url}: ${fallbackErr.message}`);
          return false;
        }
      }

      // Wait before retrying
      await page.waitForTimeout(1000 + Math.random() * 2000);
    }
  }
}

async function savePageContent(page, outputPath) {
  const html = await page.content();
  ensureDir(outputPath);
  fs.writeFileSync(outputPath, html, "utf8");
  console.log("✅ Saved:", outputPath);
  await page.waitForTimeout(randomDelay(1000, 2500));
}

async function safeGoto(page, url) {
  if (visitedUrls.has(url)) {
    console.log(`⚠️ Skipping already visited ${url}`);
    return false;
  }
  try {
    await gotoWithRetry(page, url);
    visitedUrls.add(url);
    return true;
  } catch (err) {
    failedTasks.push({ type: "goto", url });
    return false;
  }
}

async function safeSave(page, outputPath) {
  try {
    await savePageContent(page, outputPath);
    return true;
  } catch (err) {
    failedTasks.push({ type: "save", path: outputPath });
    return false;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const sitemapUrl = `${BASE}/documents/`;
  const sitemapPath = path.join(ROOT, "index.html");

  console.log("🧭 Step 1: Visiting sitemap...");
  if (await safeGoto(page, sitemapUrl)) {
    await safeSave(page, sitemapPath);
  }

  //<a href="/documents/au-passport-photo/" class="">Australia Passport 35x45 mm (3.5x4.5 cm)

  let firstLevelLinks = await page.$$eval("a", as =>
    as
      .map(a => a.getAttribute("href"))
      .filter(href => href && href.includes("/documents/"))
  );

  if (testMode) firstLevelLinks = firstLevelLinks.slice(0, 2);

  for (const href1 of firstLevelLinks) {
    const absUrl1 = `${BASE}${href1}`;
    if (!(await safeGoto(page, absUrl1))) continue;

    await safeSave(page, path.join(ROOT, href1));
  }

  if (failedTasks.length > 0) {
    fs.writeFileSync("errors.json", JSON.stringify(failedTasks, null, 2));
    console.log(`❗️ ${failedTasks.length} errors saved to errors.json`);
  }

  await browser.close();
})();
