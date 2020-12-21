'use strict';

const config = require('./config.js');

function hello(params){
  const name = config.name || 'world';
  return {
    message: "hello... " + name
  }
}

async function postTweet(params){
  const res = {
    success : false,
    message : "Invalid Parameters"
  }
  if (!params.tweet){
    return res;
  }

  const tweet = params.tweet;
  const Twit = require('twit');

  const twit = new Twit(config.twit);

  res = await twit.post('statuses/update', { status: tweet }, tweeted);

  return res;
}

function tweeted(err,data,res){
  console.log('you has been tweeted');

  console.log('----DATA----');
  console.log(data);

  return data;
}

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
  let tweet = "🥇 Harga Emas Hari Ini 🥇";
  tweet += "\n\n";
  tweet += toNominal(emas.current)+" /gram";
  if(emas.change!=0){
    tweet += "\n\n";
    tweet += emas.change > 0 ? "Naik 🔺" : "Turun 🔻";
    tweet += " " + toNominal(emas.change);
  }

  tweet += "\n\n";
  tweet += "Wajib zakat (85gr) : " + toNominal(wajibZakat);

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

async function scrapCrypto(params){
  const rp = require('request-promise');
  const url = config.cryptoUrl;

  console.log('url scrapCrypto: ', url);

  const res = await new Promise((resolve, reject) => {
    rp(url).then((json)=> {

      json = JSON.parse(json);

      const btc = {};

      btc.price = new Number(json.tickers.btc_idr.last);
      btc.h24 = new Number(json.prices_24h.btcidr);
      btc.d7 = new Number(json.prices_7d.btcidr);

      resolve({
        success: true,
        btc: btc
      });

    }).catch((err)=>{
      console.log('error scrapCrypto : ', err);
      reject({
        success: false,
        error: err
      })
    });
  });
  return res;
}

function adapterBitcoin(params){
  if(!params.success){
    return {
      success : false,
      error : 'scrapCrypto Error'
    }
  }

  const harga = toNominal(params.btc.price);
  const percentage24h = roundDecimal((params.btc.price - params.btc.h24) / params.btc.h24 * 100);
  const percentage7d = roundDecimal((params.btc.price - params.btc.d7) / params.btc.d7 * 100);

  let tweet = "#Bitcoin hari ini...";
  tweet += "\n\n";
  tweet += harga + '\n';
  tweet += "24h : ";
  tweet += percentage24h > 0 ? '📈 ':'📉';
  tweet += ' ' + percentage24h + '%\n';
  tweet += "7d : ";
  tweet += percentage7d > 0 ? '📈 ':'📉';
  tweet += ' ' + percentage7d + '%\n';
  tweet += '\n\n';

  let emoji = '';
  if(percentage24h >= 20 || percentage7d >= 20){
    emoji = generateEmoji(true);
  } else if(percentage24h <= -20 || percentage7d <= -20){
    emoji = generateEmoji(false);
  }

  tweet+=emoji;

  return {
    tweet: tweet
  }
}

async function scrapIdx(params){
  const rp = require('request-promise');
  const url = config.idxUrl;

  console.log('url scrapIdx: ', url);

  const res = await new Promise((resolve, reject) => {
    rp(url).then((json)=> {

        // it literally needs double parsing
        json = JSON.parse(json);
        json = JSON.parse(json);

        const idx = json[0];
        const lq45 = json[1];
        const idx30 = json[2];
        const bumn = json[9];
        const jii = json[12];

        idx.IndexCode = 'IDX';
        bumn.IndexCode = 'BUMN20';
        jii.IndexCode = 'JII (Syariah)';

        const data = [idx, lq45,idx30, bumn, jii];;

        resolve({
          success: true,
          data: data
        });

      }).catch((err)=>{
        console.log('error scrap idx : ', err);
        reject({
          success: false,
          error: err
        })
      });
  });
  return res;
}

function adapterIdx(params){

  if(!params.success){
    return {
      success : false,
      error : 'scrapIdx Error'
    }
  }

  let tweet = 'IHSG Hari Ini...';
  tweet += '\n\n';

  // flag if all index' are all green or all red
  let allGreen = true;
  let allRed = true;

  params.data.forEach(element => {
    tweet+=element.IndexCode + " : " + element.Closing + ' ';
    element.Percent = element.Percent.slice(0,-1);
    element.Percent = element.Percent.replace(',','.');
    element.Percent = new Number(element.Percent);
    if(element.Percent > 0){
      tweet += "Naik 🔺";
      allRed = false;
    }else{
      tweet += "Turun 🔻";
      allGreen = false;
    }
    tweet += ' ' + element.Percent + '%\n';
  });

  if(allGreen){
    tweet += '\n';
    tweet += generateEmoji(true);
  }else if(allRed){
    tweet += '\n';
    tweet += generateEmoji(false);
  }

  return {
    tweet: tweet
  }
}

function toNominal(number){
  number = new Number(number);
  return "Rp "+ number.toLocaleString("id-ID");
}

function roundDecimal(number){
  return Math.round(number*100)/100;
}

function generateEmoji(profit){
  const emoticonProfit = ["🤑","💸'","💰","😀","🔺","📈 ","🚀"];
  const emoticonLoss = ["😥","😭","🔻","😵","💀","📉","🔥"];

  let random;
  let emoji;
  if(profit){
    random = Math.floor(Math.random()*emoticonProfit.length-1);
    emoji = emoticonProfit[random];
  }else{
    random = Math.floor(Math.random()*emoticonLoss.length-1);
    emoji = emoticonLoss[random];
  }

  let result = '';
  for (let i = 0; i < 10; i++) {
    result += emoji
  }

  return result
}

exports.hello = hello;
exports.postTweet = postTweet;
exports.scrapEmas = scrapEmas;
exports.adapterEmas = adapterEmas;
exports.scrapCrypto = scrapCrypto;
exports.adapterBitcoin = adapterBitcoin;
exports.scrapIdx = scrapIdx;
exports.adapterIdx = adapterIdx;