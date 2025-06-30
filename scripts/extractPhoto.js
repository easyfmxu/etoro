#!/usr/bin/env node
/* eslint-disable no-console */
const fs      = require("fs");
const path    = require("path");
const crypto  = require("crypto");
const axios   = require("axios").default;
const cheerio = require("cheerio");
const sharp   = require("sharp");

const ROOT = path.resolve(__dirname, "../data/photo-gov");
const MIN_SIZE  = 15 * 1024; // 15 KB
const MIN_DIM   = 100;       // 像素
const RATIO_MIN = 0.70;      // 3:4 ≈ 0.75
const RATIO_MAX = 0.85;

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function md5(str) {
  return crypto.createHash("md5").update(str).digest("hex").slice(0, 10);
}

async function isValidPhoto(buf) {
  try {
    const meta = await sharp(buf).metadata();
    if (!meta.width || !meta.height) return false;
    if (meta.width  < MIN_DIM || meta.height < MIN_DIM) return false;
    const ratio = meta.width / meta.height;
    if (ratio < RATIO_MIN || ratio > RATIO_MAX) return false;
    return true;
  } catch {
    return false;
  }
}

async function downloadAndSave(url, saveDir, idx) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 15000 });
    const buf = Buffer.from(res.data);
    if (buf.length < MIN_SIZE) return null;          // 太小基本无用
    if (!(await isValidPhoto(buf))) return null;     // 非 3:4 或尺寸过小

    const ext  = path.extname(new URL(url).pathname) || ".jpg";
    const name = `${String(idx).padStart(3, "0")}_${md5(url)}${ext}`;
    const out  = path.join(saveDir, name);
    fs.writeFileSync(out, buf);
    return name;
  } catch (err) {
    console.warn(`   ⚠ skip ${url}: ${err.message.split("\n")[0]}`);
    return null;
  }
}

async function processFolder(folder) {
  const htmlFiles = fs.readdirSync(folder).filter(f => /^\d+\.html$/.test(f));
  if (!htmlFiles.length) return;

  const imgDir = path.join(folder, "img");
  ensureDir(imgDir);

  const map = {};  // html -> [img filenames]

  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(folder, htmlFile);
    const html = fs.readFileSync(htmlPath, "utf8");
    const $ = cheerio.load(html, { decodeEntities: false });

    const pageUrl = require(path.join(folder, "_links.json"))[Number(htmlFile) - 1];
    const base    = new URL(pageUrl);

    const srcs = $("img[src]")
      .map((_, el) => $(el).attr("src"))
      .get()
      .map(src => {
        if (/^data:/i.test(src)) return null;
        try { return new URL(src, base).href; } catch { return null; }
      })
      .filter(Boolean);

    const saved = [];
    for (const [i, src] of srcs.entries()) {
      const file = await downloadAndSave(src, imgDir, saved.length + 1);
      if (file) saved.push(file);
    }

    if (saved.length) {
      map[htmlFile] = saved;
      console.log(`✔ ${htmlFile} → ${saved.length} imgs`);
    }
  }

  if (Object.keys(map).length) {
    fs.writeFileSync(path.join(folder, "_img.json"), JSON.stringify(map, null, 2));
    console.log(`🗂  Saved _img.json for ${path.basename(folder)}`);
  }
}

async function main() {
  const subDirs = fs.readdirSync(ROOT).filter(d => fs.statSync(path.join(ROOT, d)).isDirectory());
  for (const dir of subDirs) {
    console.log(`\n📂 Processing ${dir} …`);
    await processFolder(path.join(ROOT, dir));
  }
}
main();
