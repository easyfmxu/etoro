const fs = require('fs').promises;
const path = require('path');

//node js/clean-sto.js fr=book-34689
// Parse command-line arguments
let frDir;
process.argv.forEach((val, index) => {
    if (index >= 2) {
        let vals = val.split("=");
        if (vals.length === 2 && vals[0] === "fr") {
            frDir = vals[1];
        }
    }
});

if (!frDir) {
    console.error("Error: Missing 'fr' parameter. Usage: node clean.js fr=hwP5");
    process.exit(1);
}

async function cleanFiles(directory) {
    try {
        const files = await fs.readdir(directory);

        for (const file of files) {
            const filePath = path.join(directory, file);
            let content = await fs.readFile(filePath, 'utf8');

            const lines = content.split('\n');
            let cleanedLines = [];
            let skipSection = false;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                // Detect start of a multi-line unwanted section (e.g., "2010-6-7 10:20 回复")
                if (/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{2} 回复/.test(line)) {
                    skipSection = true;
                    continue; // Skip this line
                }

                // If skipping, continue until reaching a line ending in "楼"
                if (skipSection) {
                    if (/^\d+楼$/.test(line.trim())) {
                        skipSection = false; // Stop skipping after this line
                        continue; // Skip the "X楼" line as well
                    }
                    continue; // Skip all lines in the section
                }

                // Remove single lines like "--- 004.txt ---"
                if (/^---\s\d{3}\.txt\s---$/.test(line)) {
                    continue;
                }

                // Remove lines containing all four characters: 思, 兔, 閱, 讀
                if (line.includes("思") && line.includes("兔") && line.includes("閱") && line.includes("讀")) {
                    continue;
                }

                cleanedLines.push(line);
            }

            const cleanedContent = cleanedLines.join('\n').trim();
            await fs.writeFile(filePath, cleanedContent, 'utf8');
            console.log(`Processed: ${file}`);
        }

        console.log('Cleaning completed.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

// Usage
const directoryPath = `./data/books/${frDir}/ch`;

cleanFiles(directoryPath);
