const { readCsv  } = require("./utils");
const { scrapeUser } = require("./user");

const scrapeUsers = (ticks) => {
    ticks.forEach((tick, index) => {
        if (index<2) {   //TBD remove
            scrapeUser(tick)  
        }
    })
}

async function main() {
    const inFile = "./data/users.csv";
    const ticks = await readCsv(inFile, true);
    scrapeUsers(ticks);
}

main()

