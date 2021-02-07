function generateEmoji(profit){
    const emoticonProfit = ["🤑","💸'","💰","😀","🔺","📈 ","🚀"];
    const emoticonLoss = ["😥","😭","🔻","😵","💀","📉","🔥"];

    let random;
    let emoji;
    if(profit){
        random = Math.floor(Math.random()*emoticonProfit.length);
        emoji = emoticonProfit[random];
    }else{
        random = Math.floor(Math.random()*emoticonLoss.length);
        emoji = emoticonLoss[random];
    }

    let result = '';
    for (let i = 0; i < 10; i++) {
        result += emoji
    }

    return result
}

exports.generateEmoji = generateEmoji;