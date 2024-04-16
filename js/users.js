const { readCsv  } = require("./utils");
const { scrapeUser } = require("./user");

const TOP_LIMIT = 5

const scrapeUsers = (ticks) => {
    ticks.forEach((tick, index) => {
        if (index<TOP_LIMIT) {   //TBD remove
            scrapeUser(tick)  
        }
    })
}

async function main() {
    const inFile = "./data/users.csv";

    console.log(`Fetching top ${TOP_LIMIT} users.`)
    const ticks = await readCsv(inFile, true);
    scrapeUsers(ticks);
}

main()

