const { scrapeChapter } = require("./52chapter");
const fs = require('fs').promises;

//Command: node js/52book.js book=hwP5 c=195 #秘密
// node js/52book.js book=hwPA c=103 fr=2 #薄荷花海
// node js/52book.js book=hzcI c=826 fr=2 #放肆
// node js/52book.js book=15810 c=159 fr=2 #桃李不言
const BASE_URL = 'https://www.52shuku.vip/gl'
const START_INDEX = 2

let book //= 'hwP5'
let count
let fr = START_INDEX
process.argv.forEach((val, index) => {
    if (index >= 2) {
        let vals = val.split("=");
        if (vals.length !== 2) {
            return;
        }
        if (vals[0] === "fr") {
            fr = Number(vals[1]);
        }
        if (vals[0] === "c") {
            count = Number(vals[1]);
        }
        if (vals[0] === "book") {
            book = vals[1];
        }
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createDirectory(path) {
    try {
      await fs.mkdir(path, { recursive: true }); // 'recursive: true' ensures all parent directories are created if they don't exist
      console.log(`Directory '${path}' created successfully.`);
    } catch (err) {
      console.error(`Error creating directory '${path}':`, err.message);
    }
}


async function main() {
    createDirectory(`data/books/${book}/original`)
    createDirectory(`data/books/${book}/ch`)
    createDirectory(`data/books/${book}/en`)
    createDirectory(`data/books/${book}/rewrite`)

    console.log(`book ${book}. pages ${count}`)
    if (!book || !count) {
        return `missing book or pages argument`
    }
    for (let i=fr; i<=count; i++) {
        const bookUrl = `${BASE_URL}/${book}`
        await scrapeChapter(book, bookUrl, i);
        const randomMs = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
        await sleep(randomMs);
    }
}
main()

