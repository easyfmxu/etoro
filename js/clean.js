const fs = require('fs').promises;
const path = require('path');

//node js/clean.js fr=hwP5
let frDir //= 'hwP5'
process.argv.forEach((val, index) => {
    if (index >= 2) {
        let vals = val.split("=");
        if (vals.length !== 2) {
            return;
        }
        if (vals[0].includes("fr")) {
            frDir = (vals[1]);
        }
    }
});


async function cleanFiles(directory, enPath) {
    try {
      // Read all files in the directory
      const files = await fs.readdir(directory);
  
      for (const file of files) {
        const filePath = path.join(directory, file);
  
        // Read file content
        let content = await fs.readFile(filePath, 'utf8');
  
        // Remove lines like "--- 004.txt ---"
        const cleanedContent = content.replace(/^---\s\d{3}\.txt\s---$/gm, '').trim();
  
        // Write the cleaned content back to the file
        await fs.writeFile(filePath, cleanedContent, 'utf8');

        const enFile = path.join(enPath, file);
        await fs.writeFile(enFile, '', 'utf8');

        console.log(`Processed: ${file}`);
      }
  
      console.log('All files have been cleaned.');
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
  

// Usage
const directoryPath = `./data/books/${frDir}/ch`; 
const enPath = `./data/books/${frDir}/en`; 
//const regexPattern = '^---\\s\\d{3}\\.txt\\s---$'; // Pattern to match lines like "--- 077.txt ---"

cleanFiles(directoryPath, enPath);