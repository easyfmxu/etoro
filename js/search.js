const { readCsv, writeCsv } = require("./utils");

const playwright = require('playwright');

const search = async() =>{
    const launchOptions = {
        headless: false,

        
    };
    const browser = await playwright.chromium.launch(launchOptions);
    const page = await browser.newPage();
    await page.goto('https://www.etoro.com/discover/people/results?copyblock=false&tradesmin=500&instrumentid=-5,-4,-6,-2,-1&page=1&period=OneYearAgo&sort=dailygain&pagesize=20&activeweeksmin=50');

    await page.waitForTimeout(5000);

    /*
    const text = (await page.textContent("body"))
        .replace(/ +/g, " ")
        .replace(/(\n ?)+/g, "\n")
        .trim();
    console.log(text);
    */
   
    const TOTAL = 2
    let count = 0
    let prevElem;
    let portfolios 
    while (count<TOTAL) {
        portfolios = await page.$$eval('.et-table-row', all_portfolios => {
            const COLUMNS = ['Return', 'Risk Score', 'Copiers', 'Copiers Change', 'Weekly DD']
            const data = [];
            all_portfolios.forEach(portfolio => {
                const titleEl = portfolio.querySelector('.et-table-first-cell');
                const title = titleEl ? titleEl.innerText : null;
    
                const urlEl = portfolio.querySelector('a.et-table-user-info');
                const url = urlEl ? urlEl.href : null;

                const row = {
                    title,
                    url: url.replace("stats", "portfolio")     //https://www.etoro.com/people/kokotek123/stats -> portfolio,
                }

                const infoCells = portfolio.querySelectorAll('.et-table-cell');
                infoCells.forEach((infoEl, index)=>{
                    const info = infoEl ? infoEl.innerText : null;
                    row[COLUMNS[index]] = info
                })

                data.push(row)
            });
            return data;
        });
        console.log(portfolios.length)

        const selector0 = 'div.et-table-row:nth-last-child(20)';
        const selector = 'div.et-table-row:last-child';
        const elem = await page.locator(selector).evaluateHandle((dom) => dom);
        const bSame = await page.evaluate((arg) => {
            return arg[0] === arg[1];
        }, [elem, prevElem]);

        //console.log('AAA', bSame)
        if (bSame) {
            break;
        }
        prevElem = elem;

        await page.locator(selector).scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        await page.locator(selector0).scrollIntoViewIfNeeded();
        //await page.mouse.wheel(0,-100);
        await page.waitForTimeout(1000);

        await page.locator(selector).scrollIntoViewIfNeeded();
        //await page.mouse.wheel(0,1000);
        await page.waitForTimeout(1000);

        count++
    }
    
    //save portfolios in file
    //console.log(portfolios)

    const outFile = 'data/users.csv'
    writeCsv(portfolios, outFile, true);

    await browser.close();
};

search()
