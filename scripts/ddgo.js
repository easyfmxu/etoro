#!/usr/bin/env node
/* eslint-disable no-console */
const fs      = require("fs");
const path    = require("path");
const { chromium } = require("playwright");

const ROOT   = path.resolve(__dirname, "../data/photo-gov");
const HEADLESS = false;          // ⬅️ 调试可设 false
const MAX_RESULTS = 10;         // 每个搜索抓取前 N 个链接
const SEARCH_WAIT = 12000;      // 等待搜索结果加载的最长时间
const randomDelay = (min=1200,max=2800)=>Math.random()*(max-min)+min;
//const ensureDir = p => fs.mkdirSync(path.dirname(p),{recursive:true});
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const GOV_REGEX = /\.(gov\.[a-z.]{2,}|\.gov|\.embassy\.[a-z.]{2,}|usembassy\.gov)$/i;

function wait(ss) {
  return new Promise(resolve => setTimeout(resolve, ss*1000));
}

const failedTasks = [];
const visitedUrls = new Set(); // ✅ 用于去重访问

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

function isOfficial(urlStr) {
  try {
    const h = new URL(urlStr).hostname;
    return (
      h.endsWith(".gov") ||
      h.includes(".gov.") ||
      h.includes(".embassy.") ||
      h.includes("usembassy.gov")
    );
  } catch {
    return false;
  }
}

function extractOfficialLinksFromDuckDuckGo(page, isOfficial) {
  return page.$$eval('a.result__url', as =>
    as.map(a => a.href)
  ).then(hrefs => {
    const decoded = hrefs.map(h => {
      try {
        const u = new URL(h.startsWith("http") ? h : "https:" + h);
        return decodeURIComponent(u.searchParams.get("uddg") || "");
      } catch {
        return null;
      }
    }).filter(Boolean);
    return Array.from(new Set(decoded.filter(isOfficial)));
  });
}

function makeIsOfficialFn({ site, tld }) {
  // ⬇️ 事先拆好合法域名列表
  const allowHosts = [];
  if (site) allowHosts.push(site.toLowerCase());         // 精确域
  if (tld)  allowHosts.push(tld.toLowerCase());          // *.gov.cn 之类
  // fallback：任何 .gov / .embassy
  const fallback = host =>
    host.endsWith(".gov")     ||
    host.includes(".gov.")    ||
    host.includes(".embassy.")||
    host.includes("usembassy.gov");

  return urlStr => {
    try {
      const host = new URL(urlStr).hostname.toLowerCase();
      // 1) site 精确匹配
      if (allowHosts.some(d => host === d || host.endsWith("." + d))) return true;
      // 2) fallback 规则
      return fallback(host);
    } catch { return false; }
  };
}

const queries = [
  { code: "cn", country: "china",  doc: "visa",        tld: "gov.cn"     },
  //{ code: "jp", country: "japan",  doc: "passport",    tld: "go.jp"      },
  { code: "us", country: "usa",    doc: "green card",  tld: "uscis.gov"  },
  { code: "ca", country: "canada", doc: "visa",        tld: "canada.ca"  },
  { code: "gb", country: "uk",     doc: "passport",    tld: "gov.uk"     },
  { code: "au", country: "australia", doc: "passport", tld: "gov.au"     },
  { code: "nz", country: "new zealand", doc: "passport", tld: "govt.nz"  },
  { code: "sg", country: "singapore", doc: "passport", tld: "gov.sg"     },
  { code: "in", country: "india",  doc: "passport",    tld: "gov.in"     },
  { code: "de", country: "germany", doc: "passport",   tld: "bund.de"    },
  { code: "fr", country: "france", doc: "passport",    tld: "gouv.fr"    },
  { code: "mx", country: "mexico", doc: "passport",    tld: "gob.mx"     },
  { code: "br", country: "brazil", doc: "passport",    tld: "gov.br"     },
  { code: "za", country: "south africa", doc: "passport", tld: "gov.za"  },
  {
    code: "de",
    country: "germany",
    doc: "passport",
    site: "auswaertiges-amt.de", // 推荐抓取来源
    tld: null,                   // 不通用
  },
  {
    code: "fr",
    country: "france",
    doc: "passport",
    tld: null, // ← 不适用通用 TLD
    site: "diplomatie.gouv.fr", // ← 推荐抓取来源
  }
];


(async () => {
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    locale: "en-US",
    ignoreHTTPSErrors: true, // ✅ 忽略 HTTPS 证书错误
  });
  const page = await context.newPage();

  let count = 0
  for (const entry of queries) {

    if (count>0) {
      break
    } else {
      count++
    }

    const { code, country, doc, tld, site } = entry;
    const isOfficial = makeIsOfficialFn(entry);
  
    const domain = site || tld || "";
    const q = `${country} ${doc} photo requirements${domain ? " site:" + domain : ""}`;


    const ddgURL = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    console.log(`\n🦆 Searching: ${q}`);
    //await page.goto(ddgURL, { waitUntil: "domcontentloaded" });
    await gotoWithRetry(page, ddgURL);
    await page.waitForTimeout(2000 + Math.random() * 1000);  // DuckDuckGo 加一点延迟避免封锁

    // 🧠 DuckDuckGo 的 HTML 结果页链接：<a class="result__a" href="https://...">
    const links = await page.$$eval(
      'a.result__a[href]',
      as => as.map(a => a.href)
    );

    const realLinks = links
    .map(href => {
      try {
        const url = new URL(href.startsWith("http") ? href : "https:" + href);
        const real = url.searchParams.get("uddg");
        return real ? decodeURIComponent(real) : null;
      } catch {
        return null;
      }
    })
    .filter(u => u && !u.toLowerCase().endsWith(".pdf"));


    const officialLinks = Array.from(
      new Set(realLinks.filter(isOfficial))
    ).slice(0, MAX_RESULTS);
    

    /* ---------- 3. 保存 ---------- */
    const baseSlug = `${code}-${doc}`.replace(/\s+/g,"-");
    const dir = path.join(ROOT, baseSlug);
    ensureDir(dir);

    console.log("AAA1", officialLinks, dir )

    if (officialLinks.length) {
      fs.writeFileSync(path.join(dir, "_links.json"),
                       JSON.stringify(officialLinks, null, 2), "utf8");
      fs.writeFileSync(path.join(dir, "_links_org.json"),
                       JSON.stringify(officialLinks, null, 2), "utf8");    
    }
    
    // 3.2 逐个官方页面抓取
    for (const [i, url] of officialLinks.entries()) {
      try {
        await page.waitForTimeout(randomDelay());
        console.log(`→ Visiting ${url}`);
        //await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
        await gotoWithRetry(page, url);
        
        await wait(10)
        const fileName = String(i + 1).padStart(2, "0") + ".html"; // 01.html, 02.html…
        const outPath  = path.join(dir, fileName);
    
        fs.writeFileSync(outPath, await page.content(), "utf8");
        console.log("   ✔ saved:", fileName);
      } catch (err) {
        console.warn("   ⚠ failed:", err.message);
      }
    }

    //await wait(100)
  }

  //await browser.close();
  console.log("\n🏁 Done.");
})();
