function toNominal(number){
    number = new Number(number);
    return "Rp "+ number.toLocaleString("id-ID");
}

function roundDecimal(number){
    return Math.round(number*100)/100;
}

function parseIntFormatCurrencyId(string){
    return parseInt(string.split(',')[0].replace('.',''));
}

function parseFloatFormatCurrencyId(string){
    return parseFloat(string.replace('.','').replace(',','.'));
}

exports.toNominal = toNominal;
exports.roundDecimal = roundDecimal;
exports.parseIntFormatCurrencyId = parseIntFormatCurrencyId;
exports.parseFloatFormatCurrencyId = parseFloatFormatCurrencyId;