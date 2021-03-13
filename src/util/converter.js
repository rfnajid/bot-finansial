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

exports.toNominal = toNominal;
exports.roundDecimal = roundDecimal;
exports.parseIntFormatCurrencyId = parseIntFormatCurrencyId;