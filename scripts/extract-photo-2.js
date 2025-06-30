#!/usr/bin/env node
//  extract-specs.js

const fs      = require("fs");
const path    = require("path");
const cheerio = require("cheerio");

/* -------- paths -------- */
const INPUT_DIR      = path.resolve(__dirname, "../data/photo");
const OUTPUT_DIR     = path.resolve(__dirname, "../data/photo-json");
const ORIGINAL_DIR   = path.resolve(__dirname, "../data/photo-json-original");
const EXTRA_SPEC_DIR   = path.resolve(__dirname, "../data/photo-spec-extra");

/* -------- helpers -------- */
const ensureDir = dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const mmFromText = txt => {
  const mm = txt.match(/([\d.]+)\s*mm/i);
  if (mm) return parseFloat(mm[1]);
  const cm = txt.match(/([\d.]+)\s*cm/i);
  if (cm) return parseFloat(cm[1]) * 10;
  return null;
};

/**
 * Convert an imgSpec object such as
 *   { height: "48mm", head_height: "3.4cm", crown_top: "4mm" }
 * into
 *   { heightMm: 48, headHeightMm: 34, crownTopMm: 4 }
 *
 * - Non-numeric values are preserved under `${key}Raw`
 *   e.g.  { background: "lightgrey" }  ->  { backgroundRaw: "lightgrey" }
 */
function convertSpec(imgSpec) {
  const out = {};

  //const camel = s => s.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
  const camel = s => s
  const removePercent = s => parseFloat(s.replace("%", ""));

  for (const [key, rawVal] of Object.entries(imgSpec)) {
    const txt = String(rawVal).trim();

    const pctMatch = txt.match(/^([\d.]+)\s*%$/);
    if (pctMatch) {
      out[`${camel(key)}Percent`] = removePercent(txt);
      continue;
    }

    // Try to capture "<number><optional-space><unit>"
    const m = txt.match(/^([\d.]+)\s*([a-z]*)$/i);
    if (!m) {
      // no numeric part → keep original under *Raw*
      out[`${camel(key)}Raw`] = txt;
      continue;
    }

    let num = parseFloat(m[1]);
    let unit = m[2].toLowerCase() || "mm";         // default to mm if unit omitted

    // convert everything to millimetres
    switch (unit) {
      case "mm":
        break;
      case "cm":
        num *= 10;
        unit = "mm";
        break;
      case "in":
      case "inch":
      case "inches":
        num *= 25.4;
        unit = "mm";
        break;
      default:
        // unknown unit – keep raw
        out[`${camel(key)}Raw`] = txt;
        continue;
    }

    // build new key, e.g. heightMm, headHeightMm
    const newKey = `${camel(key)}${unit[0].toUpperCase()}${unit.slice(1)}`;
    out[newKey] = +num.toFixed(2);                 // keep numeric, 2-dp precision
  }

  return out;
}

/*
<div class="details--photo-size__landmarks">
  <div class="details--photo-size__landmarks--height">
      48mm
  </div> <div class="details--photo-size__landmarks--width">
      38mm
  </div> <div class="details--photo-size__landmarks--head-height">
      34mm
  </div> <div class="details--photo-size__landmarks--crown-top">
      4mm
  </div>
</div>
*/
function extractImgSpec($) {
  const imgSpec = {};

  $(".details--photo-size__landmarks > div").each((_, div) => {
    const cls = ($(div).attr("class") || "");                  // full class string
    const valTxt = $(div).text().trim();                       // e.g. "48mm"

    const parts = cls.split("--");                             // e.g. ['details', 'photo-size', 'landmarks', 'height']
    const lastPart = parts[parts.length - 1];                  // e.g. 'height'
    //const key = lastPart.replace(/-/g, "_");                   // optional: normalize to underscore if needed
    const key = lastPart

    imgSpec[key] = valTxt;                                     // keep raw text, e.g. "48mm"
  });

  return imgSpec;
}

/* -------- extractor -------- */
function extractOne($) {

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

    const $ = cheerio.load(html);

    const { spec, raw } = extractOne($);

    const imgSpec = extractImgSpec($);
    raw.spec = imgSpec;

    const numberSpec = convertSpec(imgSpec)
    raw.numberSpec = numberSpec

    /* write outputs */  //output/*.json
    fs.writeFileSync(
      path.join(OUTPUT_DIR,   `${slug}.json`),
      JSON.stringify(spec, null, 2),
      "utf-8"
    );
    //original/*.json
    fs.writeFileSync(
      path.join(ORIGINAL_DIR, `${slug}.json`),
      JSON.stringify(raw,  null, 2),
      "utf-8"
    );

    if (imgSpec && Object.keys(imgSpec).length === 0) {
      fs.writeFileSync(
        path.join(EXTRA_SPEC_DIR, `${slug}.json`),
        JSON.stringify(raw, null, 2),
        "utf-8"
      );
      console.log(`⚠️  ${slug}: no landmark specs → saved to EXTRA_SPEC_DIR`);
    }

    console.log(`✅ Generated ${slug}.json (normalised + original)`);
  }
}

main();
