.Follow this to setup playwright npm package
https://oxylabs.io/blog/playwright-web-scraping

    mkdir pscrape
    cd pscrape
    npm init -y
    npm install playwright

.Run flow script: 
    bash sh/run.sh 

.Run script of a test. Test will load a page, select some elements, click some element to load another url page
    node js/search.js
    node js/users.js

    //https://www.etoro.com/people/juliengrichka/portfolio

    //https://www.etoro.com/discover/people/results?copyblock=false&tradesmin=500&instrumentid=-5,-4,-6,-2,-1&page=1&period=OneYearAgo&sort=dailygain&pagesize=100&activeweeksmin=50

.RESULT. The search result is stored in data/users.csv and bunch of json files for each user.
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
