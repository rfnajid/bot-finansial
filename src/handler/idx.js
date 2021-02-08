'use strict';

const config = require('../../config.js');
const generateEmoji = require('../util/reaction.js').generateEmoji;

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

            const data = [idx, lq45,idx30, bumn, jii];

            const nol = '0,000';

            if(idx.Change != nol && lq45.Change != nol && idx30.Change != nol && bumn.Change != nol && jii.Change != nol){
                resolve({
                    success: true,
                    data: data
                });
            }else {
                resolve({
                    success: false
                });
            }
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
        tweet+=element.IndexCode + " : " + element.Current + ' ';
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

    // hashtag
    tweet += '\n\n';
    tweet += '#investasi #saham #ihsg #idx';

    return {
        tweet: tweet
    }
}


exports.scrapIdx = scrapIdx;
exports.adapterIdx = adapterIdx;
