
const fs = require('fs');

const playwright = require('playwright');

function toThreeDigitString(number) {
    return String(number).padStart(3, '0');
  }

async function gotoWithRetry(page, url, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            return; // If successful, exit the function
        } catch (error) {
            if (attempt < retries - 1) {
                console.log(`Retrying ${url}, attempt ${attempt + 1}...`);
            } else {
                console.log(`Failed to load ${url} after ${retries} attempts.`);
                throw error; // Re-throw error if all retries fail
            }
        }
    }
}
const scrapeChapter = async(book, bookUrl, chapterIndex) =>{

    const launchOptions = {
        headless: false,        
    };
    const chapterUrl = `${bookUrl}-${chapterIndex}.html`
    const browser = await playwright.chromium.launch(launchOptions);
    const page = await browser.newPage();
    console.log(chapterUrl)

    //await page.goto(chapterUrl);
    gotoWithRetry(page, chapterUrl)

    await page.waitForTimeout(5000);

    let content
    try {
    content = await page.$eval('#BookContent', bookContentEl => {
        console.log(bookContentEl.innerText);
        return bookContentEl.innerText.trim();
    });
    } catch (e) {
        console.error('eval Error', e)
        return
    }
    const outFile = `data/books/${book}/original/${toThreeDigitString(chapterIndex)}.txt`
    console.log('RESULT written to ', outFile)

    fs.writeFile(outFile, content, err=> {
        if (err) {
            console.error(err);
        } else {
            console.log('Chapter result writtern to', outFile)
        }
    });

    await browser.close();
};

module.exports = {
    scrapeChapter
}

