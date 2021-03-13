
const config = require('../../config.js');
const toNominal = require('../util/converter.js').toNominal;


async function scrapEmas(params){
  const rp = require('request-promise');
  const cheerio = require('cheerio');
  const url = config.emasUrl;

  console.log('url scrapEmas: ', url);

  const res = await new Promise((resolve, reject) => {
    rp(url).then((html)=> {
      const $ = cheerio.load(html);
      const current = $('span.current').first().text();
      let lastPrice = $('p.last-price').first().text();

      lastPrice = lastPrice.replace(/\W/g, '');

      console.log('current : ' + current);
      console.log('lastPrice : '+ lastPrice);

      resolve({
        success: true,
        current: current,
        lastPrice: lastPrice
      });
    }).catch((err)=>{
      console.log('error scrapEmas : ', err);
      reject({
        success: false,
        error: err
      })
    });
  });
  return res;
}

function adapterEmas(params){

  if(!params.success){
    return {
      success : false,
      error : 'scrapEmas Error'
    }
  }

  const emas = parseNominalEmas(params)
  const wajibZakat = emas.current * 85;
  let tweet = '🥇 Harga Emas Hari Ini 🥇';
  tweet += '\n\n';
  tweet += toNominal(emas.current)+' /gr';
  emas.change = emas.current - emas.lastPrice;
  if(emas.change!=0){
    tweet += '\n\n';
    tweet += emas.change > 0 ? 'Naik 🔺' : 'Turun 🔻';
    tweet += ' ' + toNominal(emas.change);
  }

  tweet += '\n\n';
  tweet += 'Wajib zakat (85gr) : ' + toNominal(wajibZakat);

  // hashtag
  tweet += '\n\n';
  tweet += '#emas #antam #dinar'

  return {
    tweet: tweet
  }
}

function parseNominalEmas(emas){

  // current price
  const currentNoWording = emas.current.replace('Harga/gram Rp','');
  const currentNumberFormat = currentNoWording.replace('.', '').replace(',', '.');
  const current = parseFloat(currentNumberFormat);

  // last price
  const lastPriceNoWording = emas.lastPrice.replace('HargaTerakhirRp','').slice(0,-2);
  const lastPrice = parseFloat(lastPriceNoWording);

  // change
  const change = lastPrice - current;

  return {
    current: current,
    lastPrice: lastPrice,
    change: change
  }
}

exports.scrapEmas = scrapEmas;
exports.adapterEmas = adapterEmas;