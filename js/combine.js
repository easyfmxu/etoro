const fs = require('fs').promises;
const path = require('path');

//node js/combine.js fr=hwP5
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

async function combineTextFilesAsync(inputDir, outputFile) {
    try {
      const files = (await fs.readdir(inputDir)).filter(file => file.endsWith('.txt'));
  
      let combinedContent = '';
  
      for (const file of files) {
        const filePath = path.join(inputDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        combinedContent += `\n\n--- ${file} ---\n\n`; // Add a separator with the file name
        combinedContent += content;
      }
  
      // Write the combined content to the output file
      await fs.writeFile(outputFile, combinedContent, 'utf8');
      console.log(`All text files have been combined into: ${outputFile}`);
    } catch (err) {
      console.error('Error combining text files:', err.message);
    }
  }
  
  // Usage
  const inputDirectory = `./data/books/${frDir}/original`; 
  const outputFile = `./data/books/${frDir}/All.txt`;
  
  combineTextFilesAsync(inputDirectory, outputFile);