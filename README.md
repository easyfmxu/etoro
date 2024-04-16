.Run npm commands to install playwright npm package under the git dir. Follow this doc  https://oxylabs.io/blog/playwright-web-scraping

    npm init -y
    npm install playwright

.Install other required npm packges 
    npm i fs 
    npm i fast-csv

.The node modules should be similar to below

@fast-csv		fs			lodash.escaperegexp	lodash.isboolean	lodash.isfunction	lodash.isundefined	playwright
fast-csv		fsevents		lodash.groupby		lodash.isequal		lodash.isnil		lodash.uniq		playwright-core

.Run flow script to crawl everything

    bash sh/run.sh 

.Individual test. Run script of a test. Test will load a page, select some elements, click some element to load another url page

    node js/search.js
    node js/users.js

    //https://www.etoro.com/discover/people/results?copyblock=false&tradesmin=500&instrumentid=-5,-4,-6,-2,-1&page=1&period=OneYearAgo&sort=dailygain&pagesize=100&activeweeksmin=50
    //https://www.etoro.com/people/juliengrichka/portfolio

.Run Results are stored in data/ folder. It can be time folder under data/ folder to each crawl. 
The search result is stored in data/users.csv and bunch of json files for each user.
    data/users.csv
    [username].json

.Requirement
nodejs needs to be later version
    which node
    /Users/fayezhao/.nvm/versions/node/v21.7.2/bin/node
MacOS 

.Doc
https://playwright.dev/docs/input


.proxy
https://oxylabs.io/products/residential-proxy-pools

.userAgent 
https://www.zenrows.com/blog/playwright-user-agent#customize-ua

.read/write JSON 
https://stackoverflow.com/questions/36856232/write-add-data-in-json-file-using-node-js
