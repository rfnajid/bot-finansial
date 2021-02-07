function toNominal(number){
    number = new Number(number);
    return "Rp "+ number.toLocaleString("id-ID");
}

function roundDecimal(number){
    return Math.round(number*100)/100;
}


exports.toNominal = toNominal;
exports.roundDecimal = roundDecimal;