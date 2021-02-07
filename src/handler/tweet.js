
'use strict';

const config = require('../../config.js');

async function postTweet(params){
    const res = {
        success : false,
        message : 'Invalid Parameters'
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

exports.postTweet = postTweet;