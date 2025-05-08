const fs = require('fs').promises;
const path = require('path');

//node js/split.js fr=hwP5
let frDir
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

async function splitTextFileByKeyword(inputFile, keywordRegex, outputDir) {
    try {
      // Ensure the output directory exists
      await fs.mkdir(outputDir, { recursive: true });
  
      // Read the content of the input file
      const content = await fs.readFile(inputFile, 'utf8');
  
      // Split the content based on the keyword regex
      const parts = content.split(new RegExp(`(${keywordRegex})`, 'g'));
  
      let chapterContent = '';
      let chapterIndex = 0;
  
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.match(new RegExp(keywordRegex))) {
          // Save the current chapter content to a file (if not the first chapter)
          if (chapterContent.trim()) {
            const fileName = `Chapter_${String(chapterIndex).padStart(3, '0')}.txt`;
            const filePath = path.join(outputDir, fileName);
            await fs.writeFile(filePath, chapterContent.trim(), 'utf8');
            console.log(`Saved: ${fileName}`);
          }
  
          // Start a new chapter
          chapterIndex++;
          chapterContent = part + '\n';
        } else {
          // Append content to the current chapter
          chapterContent += part;
        }
      }
  
      // Save the last chapter
      if (chapterContent.trim()) {
        const fileName = `Chapter_${String(chapterIndex).padStart(3, '0')}.txt`;
        const filePath = path.join(outputDir, fileName);
        await fs.writeFile(filePath, chapterContent.trim(), 'utf8');
        console.log(`Saved: ${fileName}`);
      }
  
      console.log('Splitting completed.');
    } catch (err) {
      console.error('Error:', err.message);
    }
  }

// Usage
  // Usage
const inputFile = `./data/books/${frDir}/All.txt`;
const outputDirectory =  `./data/books/${frDir}/ch`;

const keywordPattern = '第[一二三四五六七八九十百千]+章'; // Regex pattern for matching "第二章", "第三章", etc.
//const keywordPattern = 'chapter [0123456789]+'; 

splitTextFileByKeyword(inputFile, keywordPattern, outputDirectory);