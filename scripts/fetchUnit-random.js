const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../data/units");
const BASE = "https://www.unitconverters.net";
const testMode = true;

// 随机等待时间 [min, max] 毫秒
function randomDelay(min = 1000, max = 3000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


const fsp = fs.promises; // 添加这行

async function createDirectory(dirPath) {
  try {
    await fsp.mkdir(dirPath, { recursive: true }); // 使用 Promise 形式的 mkdir
    console.log(`Directory '${dirPath}' created successfully.`);
  } catch (err) {
    console.error(`Error creating directory '${dirPath}':`, err.message);
  }
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function savePage(page, url, outputPath) {
  //await gotoWithRetry(page, url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
  const html = await page.content();
  ensureDir(outputPath);
  fs.writeFileSync(outputPath, html, "utf8");
  console.log("✅ Saved:", outputPath);
  await page.waitForTimeout(randomDelay(1000, 2500)); // 随机等待
}

(async () => {
  const launchOptions = {
      headless: false,        
  };
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();

  // Step 1: save sitemap.php as root index.html
  await savePage(page, `${BASE}/sitemap.php`, path.join(ROOT, "index.html"));

  await page.waitForTimeout(5000);

  let firstLevelLinks = await page.$$eval("a", as =>
    as
      .map(a => a.getAttribute("href"))
      .filter(href => href && href.endsWith("-converter.html"))
  );

  if (testMode) firstLevelLinks = firstLevelLinks.slice(0, 1); // 限制一个分类

  for (const href1 of firstLevelLinks) {
    const absUrl1 = `${BASE}${href1}`;
    const categorySlug = href1.replace("/", "").replace("-converter.html", "");
    const categoryDir = path.join(ROOT, categorySlug);

    // Step 2a: save /[category]-converter.html page
    console.log('11', absUrl1, path.join(ROOT, href1))
    await savePage(page, absUrl1, path.join(ROOT, href1));

    // Step 2b: save /[category]/ index.html
    //const categoryIndexUrl = `${BASE}/${categorySlug}/`;
    //await savePage(page, categoryIndexUrl, path.join(categoryDir, "index.html"));
    //console.log("12", categoryDir)
    //await createDirectory(categoryDir)

    // Step 3: collect /[category]/[from]-to-[to].htm links
    const links2 = await page.$$eval("a", as =>
      as
        .map(a => a.getAttribute("href"))
        .filter(href =>
          href &&
          href.endsWith(".htm") &&
          href.includes("/") &&
          href.split("/").length === 2 &&
          href.includes("-to-")
        )
    );

    const fromToLinks = testMode ? links2.slice(0, 2) : links2;

    console.log("21", fromToLinks)

    for (const href2 of fromToLinks) {
      const absUrl2 = `${BASE}${href2}`;
      const [_, category, filename] = href2.split("/");
      const fromto = filename.replace(".htm", "");
      const targetPath = path.join(ROOT, category, fromto, "index.html");
      //await createDirectory(targetPath)
      console.log('23', absUrl2, targetPath)
      await savePage(page, absUrl2, targetPath);
    }
  }

  //await browser.close();
})();
