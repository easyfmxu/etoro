const { scrapeChapter } = require("./sto-chapter");
const fs = require('fs').promises;

//Command: 
// node js/sto-book.js book=book-34689 c=56 #妖受
// node js/sto-book.js book=book-86556 c=108 #洛水情人
// node js/sto-book.js book=book-218447 c=597 金牌律师
// node js/sto-book.js book=book-178272 c=285 fr=128 鱼龙符
// node js/sto-book.js book=book-188085 c=312  泾渭情殇
// node js/sto-book.js book=book-170296 c=190 聊闲
// node js/sto-book.js book=book-53324 c=280 探虚陵
// node js/sto-book.js book=book-181710 c=145 余情可待
// node js/sto-book.js book=book-195847 c=163 怦然为你
// node js/sto-book.js book=book-202911 c=56 天作不合
// node js/sto-book.js book=book-226766 c=96 山南水北
// node js/sto-book.js book=book-127807 c=396 探虚陵现代
// node js/sto-book.js book=book-186097 c=406  放肆
// 83023 这块冰山不太冷
// node js/sto-book.js book=book-34751 c=37   我记得你
// node js/sto-book.js book=book-195913 c=112  摘星

const BASE_URL = 'https://www.sto.cx'
const START_INDEX = 1

let book
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
        
        //10 seconds and 2 minutes 
        const randomMs = Math.floor(Math.random() * (60000 - 10000 + 1)) + 10000;
        //await sleep(5000);
        console.log(`Sleep ${randomMs/1000}s`)
        await sleep(randomMs);
    }
}
main()

