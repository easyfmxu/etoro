const fs = require('fs').promises;
const path = require('path');

async function copyAndRenameFiles(sourceDir, targetDir) {
  try {
    // Ensure the target directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Read all files in the source directory
    const files = await fs.readdir(sourceDir);

    for (const file of files) {
      // Only process .txt files
      if (file.endsWith('.txt')) {
        // Get the file's base name without extension
        const baseName = path.parse(file).name;

        // Create a new file name padded to 3 digits
        const newFileName = String(baseName).padStart(3, '0') + '.txt';

        // Define the source and target file paths
        const sourceFilePath = path.join(sourceDir, file);
        const targetFilePath = path.join(targetDir, newFileName);

        // Copy and rename the file
        await fs.copyFile(sourceFilePath, targetFilePath);
        console.log(`Copied and renamed: ${file} → ${newFileName}`);
      }
    }

    console.log('All files have been copied and renamed successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Usage
const sourceDirectory = `./data/books/hwP5/original`; 
const targetDirectory = `./data/books/hwP5/original_1`; 

copyAndRenameFiles(sourceDirectory, targetDirectory);