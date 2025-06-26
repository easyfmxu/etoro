const fs = require("fs");
const path = require("path");

/* -------- paths -------- */
//const INPUT_DIR  = path.resolve(__dirname, "../data/photo-json-only");
const INPUT_DIR  = path.resolve(__dirname, "../data/photo-json-original");
const OUTPUT_DIR = path.resolve(__dirname, "../data");
//const outputFile = path.join(OUTPUT_DIR, "spec.json");
const outputFile = path.join(OUTPUT_DIR, "spec-original.json");

const result = {};

const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith(".json"));

for (const file of files) {
  const [lang, ...rest] = path.basename(file, ".json").split("-");
  const key = rest.join("-"); // e.g. "us-passport-photo"
  const fullPath = path.join(INPUT_DIR, file);

  try {
    const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    if (!result[lang]) result[lang] = [];
    result[lang].push({ key, ...data });
  } catch (err) {
    console.error(`❌ Failed to parse ${file}:`, err.message);
  }
}

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf-8");
console.log(`✅ Combined ${files.length} files into spec.json`);
