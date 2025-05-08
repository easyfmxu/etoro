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

            // Remove unwanted lines
            const cleanedContent = content
                .split('\n')
                .filter(line =>
                    !/^---\s\d{3}\.txt\s---$/.test(line) && // Remove "--- 004.txt ---"
                    !(line.includes("思") && line.includes("兔") && line.includes("閱") && line.includes("讀")) // Remove lines containing all four chars
                )
                .join('\n')
                .trim();

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
