.Follow this to setup playwright npm package
https://oxylabs.io/blog/playwright-web-scraping

    mkdir pscrape
    cd pscrape
    npm init -y
    npm install playwright

.Run flow script: 
    bash sh/run.sh 

.Run script of a test. Test will load a page, select some elements, click some element to load another url page
    node amz-test.js
    node etorus-test.js

    //https://www.etoro.com/people/juliengrichka/portfolio
    node test/etorus.js 

    //https://www.etoro.com/discover/people/results?copyblock=false&tradesmin=500&instrumentid=-5,-4,-6,-2,-1&page=1&period=OneYearAgo&sort=dailygain&pagesize=100&activeweeksmin=50
    node test/etorus-scroll.js	

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

.RESULT [
  {
    titles: [ 'GOLD', 'Gold' ],
    columns: {
      Direction: 'Short',
      Invested: '10.18%',
      'P/L(%)': '0.96%',
      Value: '10.46%',
      Sell: 'S\n2372.83',
      Buy: 'B\n2373.28'
    }
  },
  {
    titles: [ 'SILVER', 'Silver' ],
    columns: {
      Direction: 'Short',
      Invested: '7.53%',
      'P/L(%)': '-27.49%',
      Value: '5.55%',
      Sell: 'S\n28.41',
      Buy: 'B\n28.46'
    }
  },
  {
    titles: [ 'NATGAS', 'Natural Gas' ],
    columns: {
      Direction: 'long',
      Invested: '6.50%',
      'P/L(%)': '-5.91%',
      Value: '6.22%',
      Sell: 'S\n1.931',
      Buy: 'B\n1.943'
    }
  },
  {
    titles: [ 'BCH', 'Bitcoin Cash' ],
    columns: {
      Direction: 'long',
      Invested: '3.88%',
      'P/L(%)': '-10.55%',
      Value: '3.53%',
      Sell: 'S\n605.79',
      Buy: 'B\n619.91'
    }
  },
  {
    titles: [ 'BTC', 'Bitcoin' ],
    columns: {
      Direction: 'Short',
      Invested: '3.23%',
      'P/L(%)': '-5.82%',
      Value: '3.10%',
      Sell: 'S\n69524.24',
      Buy: 'B\n70956.91'
    }
  },
  {
    titles: [ 'GBPUSD', 'GBP/USD' ],
    columns: {
      Direction: 'long',
      Invested: '2.98%',
      'P/L(%)': '-5.16%',
      Value: '2.87%',
      Sell: 'S\n1.25542',
      Buy: 'B\n1.25564'
    }
  },
  {
    titles: [ 'XLM', 'Stellar' ],
    columns: {
      Direction: 'long',
      Invested: '2.70%',
      'P/L(%)': '-3.20%',
      Value: '2.66%',
      Sell: 'S\n0.12871',
      Buy: 'B\n0.13165'
    }
  },
  {
    titles: [ 'FET', 'Fetch.ai' ],
    columns: {
      Direction: 'long',
      Invested: '2.05%',
      'P/L(%)': '-1.02%',
      Value: '2.07%',
      Sell: 'S\n2.52422',
      Buy: 'B\n2.57956'
    }
  },
  {
    titles: [ 'CELO', 'Celo' ],
    columns: {
      Direction: 'long',
      Invested: '2.05%',
      'P/L(%)': '-2.67%',
      Value: '2.03%',
      Sell: 'S\n1.0251',
      Buy: 'B\n1.0516'
    }
  },
  {
    titles: [ 'QNT', 'Quant' ],
    columns: {
      Direction: 'long',
      Invested: '2.05%',
      'P/L(%)': '-2.88%',
      Value: '2.03%',
      Sell: 'S\n113.7867',
      Buy: 'B\n117.4181'
    }
  },
  {
    titles: [ 'ADA', 'Cardano' ],
    columns: {
      Direction: 'long',
      Invested: '1.74%',
      'P/L(%)': '88.70%',
      Value: '3.34%',
      Sell: 'S\n0.58006',
      Buy: 'B\n0.59234'
    }
  },
  {
    titles: [ 'XRP', 'XRP' ],
    columns: {
      Direction: 'long',
      Invested: '1.72%',
      'P/L(%)': '-8.84%',
      Value: '1.60%',
      Sell: 'S\n0.60170',
      Buy: 'B\n0.61508'
    }
  },
  {
    titles: [ 'DOGE', 'Dogecoin' ],
    columns: {
      Direction: 'long',
      Invested: '1.31%',
      'P/L(%)': '-5.30%',
      Value: '1.26%',
      Sell: 'S\n0.19352',
      Buy: 'B\n0.19752'
    }
  },
  {
    titles: [ 'GER40', 'GER40 Index' ],
    columns: {
      Direction: 'Short',
      Invested: '1.01%',
      'P/L(%)': '6.80%',
      Value: '1.10%',
      Sell: 'S\n18040.80',
      Buy: 'B\n18045.00'
    }
  },
  {
    titles: [ 'NZDUSD', 'NZD/USD' ],
    columns: {
      Direction: 'long',
      Invested: '0.97%',
      'P/L(%)': '9.61%',
      Value: '1.08%',
      Sell: 'S\n0.60032',
      Buy: 'B\n0.60057'
    }
  },
  {
    titles: [ 'UK100', 'UK100 Index' ],
    columns: {
      Direction: 'Short',
      Invested: '0.86%',
      'P/L(%)': '-4.64%',
      Value: '0.83%',
      Sell: 'S\n7942.77',
      Buy: 'B\n7948.27'
    }
  },
  {
    titles: [ 'DJ30', 'DJ30 Index' ],
    columns: {
      Direction: 'Short',
      Invested: '0.86%',
      'P/L(%)': '7.62%',
      Value: '0.94%',
      Sell: 'S\n38493.25',
      Buy: 'B\n38499.25'
    }
  },
  {
    titles: [ 'NSDQ100', 'NASDAQ100 Index' ],
    columns: {
      Direction: 'long',
      Invested: '0.86%',
      'P/L(%)': '4.92%',
      Value: '0.91%',
      Sell: 'S\n18309.90',
      Buy: 'B\n18312.30'
    }
  },
  {
    titles: [ 'DOT', 'Polkadot' ],
    columns: {
      Direction: 'long',
      Invested: '0.73%',
      'P/L(%)': '1.25%',
      Value: '0.75%',
      Sell: 'S\n8.2671',
      Buy: 'B\n8.4653'
    }
  },
  {
    titles: [ 'AUDJPY', 'AUD/JPY' ],
    columns: {
      Direction: 'long',
      Invested: '0.57%',
      'P/L(%)': '17.22%',
      Value: '0.68%',
      Sell: 'S\n100.204',
      Buy: 'B\n100.224'
    }
  },
  {
    titles: [ 'HBAR', 'Hedera Hashgraph' ],
    columns: {
      Direction: 'long',
      Invested: '0.56%',
      'P/L(%)': '-3.06%',
      Value: '0.56%',
      Sell: 'S\n0.09862',
      Buy: 'B\n0.10076'
    }
  },
  {
    titles: [ 'MIOTA', 'IOTA' ],
    columns: {
      Direction: 'long',
      Invested: '0.56%',
      'P/L(%)': '0.88%',
      Value: '0.58%',
      Sell: 'S\n0.29994',
      Buy: 'B\n0.30701'
    }
  }
] [
  [
    { titles: [Array], columns: [Object] },
    { titles: [Array], columns: [Object] },
    { titles: [Array], columns: [Object] },
    { titles: [Array], columns: [Object] }
  ],
  [
    { titles: [Array], columns: [Object] },
    { titles: [Array], columns: [Object] }
  ],
  [
    { titles: [Array], columns: [Object] },
    { titles: [Array], columns: [Object] }
  ],
  [
    { titles: [Array], columns: [Object] },
    { titles: [Array], columns: [Object] },
    { titles: [Array], columns: [Object] },
    { titles: [Array], columns: [Object] },
    { titles: [Array], columns: [Object] },
    { titles: [Array], columns: [Object] }
  ]
]

