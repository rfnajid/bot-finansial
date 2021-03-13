
const config = require('../../config.js');
const toNominal = require('../util/converter.js').toNominal;
const parseFloatFormatCurrencyId = require('../util/converter').parseFloatFormatCurrencyId;
const roundDecimal = require('../util/converter').roundDecimal;

async function scrapForex(params){
  const rp = require('request-promise');
  const cheerio = require('cheerio');
  const url = config.forexUrl;

  console.log('url scrapForex: ', url);

  const res = await new Promise((resolve, reject) => {
    rp(url).then((html)=> {
      const $ = cheerio.load(html);
      const table = $('tbody').eq(1).first();

      const data = [];

      table.children().each((i, element) => {
        const item = {};
        item.currency = element.children[1].children[0].data.trim();
        item.value = element.children[3].children[0].data;
        item.buy = element.children[5].children[0].data;
        item.sell = element.children[7].children[0].data;

        data.push(item);
      });

      console.log('data', data);


      resolve({
        success: true,
        data: data
      });
    }).catch((err)=>{
      console.log('error scrapForex : ', err);
      reject({
        success: false,
        error: err
      })
    });
  });
  return res;
}

function adapterForex(params){

  if(!params.success){
    return {
      success : false,
      error : 'scrapForex Error'
    }
  }

  const selectedCurrency = ['AUD', 'CNY', 'JPY', 'KRW', 'MYR', 'USD'];

  const selectedData = params.data.filter(item => {
    return selectedCurrency.includes(item.currency);
  });

  let tweet = '💵 Harga Forex Hari Ini 💵';
  tweet += '\n\n';


  selectedData.forEach(item => {
    forex =  parseNominalForex(item);
    tweet += '#' + forex.currency + ' = ' + forex.price;
    tweet += '\n';
  });

  // hashtag
  tweet += '\n';
  tweet += '#dollar #yen #won #rupiah #ringgit'

  return {
    tweet: tweet
  }
}

function parseNominalForex(data){

  const value = parseFloatFormatCurrencyId(data.value);
  const buy = parseFloatFormatCurrencyId(data.buy);
  const price = roundDecimal(buy/value);

  return {
    currency: data.currency,
    price: toNominal(price)
  }
}

exports.scrapForex = scrapForex;
exports.adapterForex = adapterForex;