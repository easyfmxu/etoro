const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../data/units");
const BASE = "https://www.unitconverters.net";
const testMode = true;

function randomDelay(min = 1000, max = 3000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const fsp = fs.promises;
const failedTasks = [];

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

async function gotoWithRetry(page, url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const timeout = randomDelay(5000, 10000);
      console.log(`→ Visiting ${url} (timeout: ${timeout}ms)...`);
      await page.goto(url, { waitUntil: "networkidle", timeout });
      return;
    } catch (error) {
      if (attempt < retries - 1) {
        console.log(`⚠️ Retry ${attempt + 1} for ${url}`);
        await page.waitForTimeout(randomDelay(1000, 2000));
      } else {
        console.error(`❌ Failed to load ${url}`);
        throw error;
      }
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

// === 新增：错误容忍包装 ===
async function safeGoto(page, url) {
  try {
    await gotoWithRetry(page, url);
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

  const sitemapUrl = `${BASE}/sitemap.php`;
  const sitemapPath = path.join(ROOT, "index.html");

  console.log("🧭 Step 1: Visiting sitemap...");
  if (await safeGoto(page, sitemapUrl)) {
    await safeSave(page, sitemapPath);
  }

  let firstLevelLinks = await page.$$eval("a", as =>
    as
      .map(a => a.getAttribute("href"))
      .filter(href => href && 
        href.includes("temperature") && 
        href.endsWith("-converter.html"))
  );

  //if (testMode) firstLevelLinks = firstLevelLinks.slice(0, 2);

  for (const href1 of firstLevelLinks) {
    const absUrl1 = `${BASE}${href1}`;
    const categorySlug = href1.replace("/", "").replace("-converter.html", "");
    const categoryDir = path.join(ROOT, categorySlug);

    console.log(`\n📂 Step 2: Visiting ${categorySlug} → ${absUrl1}`);
    if (!(await safeGoto(page, absUrl1))) continue;
    await safeSave(page, path.join(ROOT, href1));
    //await createDirectory(categoryDir);

    console.log("🔍 Extracting second-level links...");
    await page.waitForSelector('a[href*="-to-"]', { timeout: 5000 }).catch(() => {
      console.log("⚠️ No conversion links appeared in 5s");
    });

    const links2 = await page.$$eval("a", as =>
      as
        .map(a => a.getAttribute("href"))
        .filter(href =>
          href &&
          href.endsWith(".htm") &&
          href.includes("/") &&
          href.includes("-to-")
        )
    );

    const fromToLinks = testMode ? links2.slice(0, 2) : links2;
    console.log(`🔗 Found ${fromToLinks.length} conversion links`);

    for (const href2 of fromToLinks) {
      const absUrl2 = `${BASE}${href2}`;
      const [_, category, filename] = href2.split("/");
      const fromto = filename.replace(".htm", "");
      const targetPath = path.join(ROOT, category, fromto, "index.html");

      console.log(`→ Visiting detail page: ${absUrl2}`);
      if (!(await safeGoto(page, absUrl2))) continue;
      await safeSave(page, targetPath);
    }
  }

  if (failedTasks.length > 0) {
    fs.writeFileSync("errors.json", JSON.stringify(failedTasks, null, 2));
    console.log(`❗️ ${failedTasks.length} errors saved to errors.json`);
  }

  // await browser.close();
})();
