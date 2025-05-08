const fs = require('fs').promises;
const path = require('path');

//node rename-chapters.js fr=book-181710

// Parse input param
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
    console.error("Usage: node shift-chapter-names.js fr=book-34689");
    process.exit(1);
}

const dirPath = `data/books/${frDir}/ch`

async function shiftChapterNumbersDown() {
    try {
        const files = await fs.readdir(dirPath);

        // 找出 Chapter_XXX.txt 文件并排序
        const chapterFiles = files
            .filter(file => /^Chapter_\d+\.txt$/.test(file))
            .sort((a, b) => {
                const aNum = parseInt(a.match(/\d+/)[0]);
                const bNum = parseInt(b.match(/\d+/)[0]);
                return bNum - aNum; // 倒序以避免文件名冲突
            });

        for (const file of chapterFiles) {
            const match = file.match(/Chapter_(\d+)\.txt/);
            if (!match) continue;

            const oldNum = parseInt(match[1]);
            const newNum = oldNum - 1;
            if (newNum < 0) continue; // 跳过负编号

            const newFileName = `Chapter_${String(newNum).padStart(3, '0')}.txt`;

            await fs.rename(
                path.join(dirPath, file),
                path.join(dirPath, newFileName)
            );

            console.log(`Renamed ${file} → ${newFileName}`);
        }

        console.log("Shifted chapter numbers down by 1.");
    } catch (err) {
        console.error("Error:", err.message);
    }
}

shiftChapterNumbersDown();
