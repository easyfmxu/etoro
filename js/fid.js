//const { readCsv, writeCsv } = require("./utils");

const playwright = require('playwright');

const load = async() =>{
    const launchOptions = {
        headless: false,

        
    };
    const browser = await playwright.chromium.launch(launchOptions);
    const page = await browser.newPage();
    await page.goto('https://workplaceservices.fidelity.com/mybenefits/navstation/navigation');

    await page.waitForTimeout(5000);

    /*
    const text = (await page.textContent("body"))
        .replace(/ +/g, " ")
        .replace(/(\n ?)+/g, "\n")
        .trim();
    console.log(text);
    */
    /*
    const portfolios = await page.$$eval('.et-table-row', all_portfolios => {
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
    console.log(portfolios)
    */
    //await browser.close();
};

load()
