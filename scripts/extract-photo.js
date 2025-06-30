#!/usr/bin/env node
//  extract-specs.js

const fs      = require("fs");
const path    = require("path");
const cheerio = require("cheerio");

/* -------- paths -------- */
const INPUT_DIR      = path.resolve(__dirname, "../data/photo");
const OUTPUT_DIR     = path.resolve(__dirname, "../data/photo-json");
const ORIGINAL_DIR   = path.resolve(__dirname, "../data/photo-json-original");

/* -------- helpers -------- */
const ensureDir = dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const mmFromText = txt => {
  const mm = txt.match(/([\d.]+)\s*mm/i);
  if (mm) return parseFloat(mm[1]);
  const cm = txt.match(/([\d.]+)\s*cm/i);
  if (cm) return parseFloat(cm[1]) * 10;
  return null;
};

/* -------- extractor -------- */
function extractOne(html) {
  const $ = cheerio.load(html);

  const spec = {};          // normalised
  const raw  = {};          // label -> value

  $("#document-requirements li").each((_, li) => {
    const labelRaw = $(li).find("[class$='list__item--name']").text().trim();
    const value    = $(li).find("[class$='list__item--value']").text().trim();
    const label    = labelRaw.toLowerCase();

    if (!label) return;
    raw[labelRaw] = value;  // keep original wording

    /* normalised mapping */
    if (label.startsWith("width")) {
      spec.widthMm = mmFromText(value);
    } else if (label.startsWith("height")) {
      spec.heightMm = mmFromText(value);
    } else if (label.startsWith("head height")) {
      const rg = value.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
      if (rg) spec.headHeightCmRange = [parseFloat(rg[1]), parseFloat(rg[2])];
    } else if (label.startsWith("distance from top")) {
      const rg = value.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
      if (rg) spec.topSpaceCmRange = [parseFloat(rg[1]), parseFloat(rg[2])];
    } else if (label.startsWith("background")) {
      const bg = value.match(/(white|light grey|grey|gray|blue)/i);
      if (bg) spec.background = bg[1].toLowerCase().replace(" ", "");
    } else {
      // fallback – also store in normalised object under snake-case
      spec[label.replace(/\s+/g, "_")] = value;
    }
  });

  return { spec, raw };
}

/* -------- orchestrate -------- */
function main() {
  [OUTPUT_DIR, ORIGINAL_DIR].forEach(ensureDir);

  const files = fs.readdirSync(INPUT_DIR)
                  .filter(f => f.endsWith(".html") && f.includes("-"));

  console.log(`🧮 Processing ${files.length} html files…`);

  for (const file of files) {
    const slug         = path.basename(file, ".html");          // "vn-passport-photo"
    const htmlPath     = path.join(INPUT_DIR, file);
    const html         = fs.readFileSync(htmlPath, "utf-8");

    const { spec, raw } = extractOne(html);

    /* write outputs */
    // output/*.json *-original.json
    fs.writeFileSync(
      path.join(OUTPUT_DIR,   `${slug}.json`),
      JSON.stringify(spec, null, 2),
      "utf-8"
    );
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${slug}-orignal.json`),
      JSON.stringify(raw,  null, 2),
      "utf-8"
    );

    console.log(`✅ Generated ${slug}.json (normalised + original)`);
  }
}

main();
