.Install npm packages 
    
    npm i
    
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

.JSON online converter 

    https://codebeautify.org/string-to-json-online

.read/write JSON to file

    https://stackoverflow.com/questions/36856232/write-add-data-in-json-file-using-node-js

.Requirement
nodejs needs to be later version
    which node
    /Users/fayezhao/.nvm/versions/node/v21.7.2/bin/node
MacOS 

.scheduling 

    crontab -e 

Example: monday-friday 8am:32
 
    32 8 * * 1-5 export PATH=/home/fzhao/.nvm/versions/node/v16.14.2/bin:$PATH && cd ~/autotrade/NodeApp && node js/er.yfapi.js | tee output

.Doc

    https://playwright.dev/docs/input

.proxy
https://oxylabs.io/products/residential-proxy-pools

.userAgent 
https://www.zenrows.com/blog/playwright-user-agent#customize-ua



26345 日出东方
26364 楚国公主的情人
34689 妖受
86556 洛水情人
170296 撩闲
178272 鱼龙符
188085 泾渭情殇
218447 金牌律师 
// node js/sto-book.js book=book-170296 c=190 聊闲
// node js/sto-book.js book=book-53324 c=280 探虚陵
// node js/sto-book.js book=book-181710 c=145 余情可待
// node js/sto-book.js book=book-195847 c=163 怦然为你
// node js/sto-book.js book=book-202911 c=56 天作不合

h1OL 晨昏
hwP5 秘密
hwP9 漠漠轻乔君休思
hwPA 薄荷花海









