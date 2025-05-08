const fs = require('fs').promises;
const path = require('path');

//node js/split-sto.js fr=book-34689
// Parse command-line arguments
let frDir;
process.argv.forEach((val, index) => {
    if (index >= 2) {
        const vals = val.split("=");
        if (vals.length === 2 && vals[0] === "fr") {
            frDir = vals[1];
        }
    }
});

if (!frDir) {
    console.error("Error: Missing 'fr' parameter. Usage: node split.js fr=hwP5");
    process.exit(1);
}

async function splitTextFileByKeyword(inputFile, keywordRegex, outputDir) {
    try {
        await fs.mkdir(outputDir, { recursive: true });

        let content = await fs.readFile(inputFile, 'utf8');

        // Remove lines like "--- 001.txt ---"
        content = content.replace(/^---\s*\d+\.txt\s*---\s*$/gm, '');

        // Split based on the provided regex pattern
        const parts = content.split(new RegExp(`(${keywordRegex})`, 'g'));

        let chapterContent = '';
        let chapterIndex = 1;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            if (part.match(new RegExp(keywordRegex))) {
                if (chapterContent.trim()) {
                    const fileName = `Chapter_${String(chapterIndex).padStart(3, '0')}.txt`;
                    await fs.writeFile(path.join(outputDir, fileName), chapterContent.trim(), 'utf8');
                    console.log(`Saved: ${fileName}`);
                }

                chapterIndex++;
                chapterContent = part + '\n';
            } else {
                chapterContent += part;
            }
        }

        if (chapterContent.trim()) {
            const fileName = `Chapter_${String(chapterIndex).padStart(3, '0')}.txt`;
            await fs.writeFile(path.join(outputDir, fileName), chapterContent.trim(), 'utf8');
            console.log(`Saved: ${fileName}`);
        }

        console.log('Splitting completed.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

// File paths
const inputFile = `./data/books/${frDir}/All.txt`;
const outputDirectory = `./data/books/${frDir}/ch`;

// Regex pattern for new chapter format (e.g., "2、002 [Chapter Name]")
//const keywordPattern = '\\d+、\\d{3}\\s+.*';
const keywordPattern = '第\\d+章';
splitTextFileByKeyword(inputFile, keywordPattern, outputDirectory);
