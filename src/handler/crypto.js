
const config = require('../../config.js');
const toNominal = require('../util/converter.js').toNominal;
const roundDecimal = require('../util/converter.js').roundDecimal;

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

    // hashtag
    tweet += '\n\n';
    tweet += '#btc';

    return {
        tweet: tweet
    }
}

exports.scrapCrypto = scrapCrypto;
exports.adapterBitcoin = adapterBitcoin;