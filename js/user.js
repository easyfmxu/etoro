
const fs = require('fs');

/*
//Command: node js/user.js url=XXX
let url = 'https://www.etoro.com/people/juliengrichka/portfolio'; //TBD
process.argv.forEach((val, index) => {
    if (index >= 2) {
        let vals = val.split("=");
        if (vals.length !== 2) {
            return;
        }
        if (vals[0] === "url") {
            url = vals[1];
        }
    }
});
*/

const playwright = require('playwright');

const scrapeUser = async(tick) =>{
    const {url, title} = tick

    const launchOptions = {
        headless: false,

        
    };
    const browser = await playwright.chromium.launch(launchOptions);
    const page = await browser.newPage();
    await page.goto(url);

    await page.waitForTimeout(5000);

    /*
    const text = (await page.textContent("body"))
        .replace(/ +/g, " ")
        .replace(/(\n ?)+/g, "\n")
        .trim();
    console.log(text);
    */

    //main page
    //columns
    const columnsRaw = await page.$$eval('.et-table-head', colEls => {
        /*
        colEls.forEach(colEl=>{
            console.log(colEl.innerText)
        })
        */
        return colEls.map(colEl=> colEl.innerText)
    })
    const columnNames = columnsRaw[0].split('\n')
    //console.log(columnNames)
    
    //rows
    const portfolios = await page.$$eval('.et-table-row', portfolioRows => {
        const rowData = [];
        portfolioRows.forEach(portfolio => {
            const titleEl = portfolio.querySelector('.et-table-first-cell');
            const title = titleEl ? titleEl.innerText : null;

            const cells = []
            const infoCells = portfolio.querySelectorAll('.et-table-cell');
            infoCells.forEach((infoEl, index)=>{
                const info = infoEl ? infoEl.innerText : null;
                cells.push(info);
            })
            const row = {
                title,
                brief: cells
            }
            rowData.push(row)
        });
        return rowData;
    });
    
    portfolios.forEach(p=>{
        p.titles = p.title.split("\n")
        p.columns = {}
        p.brief.forEach((cell, index)=> {
            p.columns[columnNames[index+1]] = cell
        })
        delete p.brief
        delete p.title
    })
    //console.log(portfolios);

    const getSubPage = async ( title ) => {
        await page.getByText(title).first().click();
        await page.waitForTimeout(5000);
    
        const columnsRawSubPage = await page.$$eval('.et-table-head', colEls => {
            return colEls.map(colEl=> colEl.innerText)
        })
        const columnNamesSubPage = columnsRawSubPage[0].split('\n')
        //console.log(columnsRawSubPage, columnNamesSubPage)
        const columnNamesSubPageDefault = ["Action", "Amount", "Leverage", "Open", "Current", 'Up/Down', "SL", 'TP', 'P/L']
    
        const portfolio = await page.$$eval('.et-table-row', all_positions => {
            const rowData = [];
            all_positions.forEach(position => {
                const titleEl = position.querySelector('.et-table-first-cell');
                const title = titleEl ? titleEl.innerText : null;
                
                const cells = []
                const infoCells = position.querySelectorAll('.et-table-cell');
                infoCells.forEach((infoEl, index)=>{
                    const info = infoEl ? infoEl.innerText : null;
                    cells.push(info);
                })
                const row = {
                    title,
                    brief: cells
                }
                rowData.push(row);
            });
            return rowData;
        });
    
        portfolio.forEach(p=>{
            p.titles = p.title.split("\n")
            p.columns = {}
            p.brief.forEach((cell, index)=> {
                p.columns[columnNamesSubPageDefault[index+1]] = cell
            })
            delete p.brief
            delete p.title
        })

        return portfolio
    }

    const portfolioDataDetails = []
    //each portofolio page
    for (let i=0; i<portfolios.length; i++) {
        const pItem = portfolios[i]
        const {titles} = pItem
        const title = titles[0]
        const portfolioData = await getSubPage(title)

        portfolioDataDetails.push(portfolioData)
        //console.log(portfolioData);
        await page.getByText('Back').first().click();
        await page.waitForTimeout(5000);

        //for test
        /*
        if (i>=3) {
            break;
        }
        */
    }

    const res = {
        topLevl: portfolios,
        tradeDetails: portfolioDataDetails
    }
    const json = JSON.stringify(res);

    const name = title.split('\n')[0]

    const outFile = `data/${name}.json`
    //console.log('RESULT write to ', outFile)

    fs.writeFile(outFile, json, err=> {
        if (err) {
            console.error(err);
        } else {
            console.log('User result writtern to', outFile)
        }
    });

    await browser.close();
};

module.exports = {
    scrapeUser
}
