var cheerio = require('cheerio');

var rarityMap = {
    'Обычная': 'c',
    'Необычная' : 'u',
    'Редкая' : 'r',
    'Мифическая' : 'm',
};

var execptions = {
    notexists : [
        { set:'at', ids: [18, 80] },
        /* basic land with out arts */
        { set: 'ddp', ids: [35,36,39,40,71,72] },
        { set: 'ust', ids: [3,12,41,49,54,67,82,98,103,113,145,147,165] }
    ],
    doubles: [
        { set: 'chk', ids: [160] }
    ],
    emptyset: [ 'etp', '4ea', 're', 'scgp']
};

function GetID(id, set) {
    for (var i = execptions.notexists.length - 1; i >= 0; i--) {
        var ne = execptions.notexists[i];
        if (ne.set == set) {
            for (var j = 0; j < ne.ids.length;j++) {
                if (id >= ne.ids[j])
                    id++;
            };
        }
    };
    for (var i = execptions.doubles.length - 1; i >= 0; i--) {
        var dbl = execptions.doubles[i];
        if (dbl.set == set) {
            for (var j = 0; j < dbl.ids.length; j++) {
                if (id >= dbl.ids[j])
                    id--;
            };
        }
    };
    return id;
};

function toDictionary(array, idColumn) {
    var dict = {};
    for (var i = array.length - 1; i >= 0; i--) {
        dict[array[i][idColumn]] = array[i];
    };
    return dict;
};


function parseSale(htmlString) {
    var $ = cheerio.load(htmlString);

    return $('.sub').map(
        function(i, item){ 
            var id = $('.titler .seticon', item).attr('class').substring(2,$('.titler .seticon', item).attr('class').indexOf(' '));
            return {    
                id: id, 
                title: $('.titler .seticon', item).attr('title').replace('&','and'), 
                cards: $('.ctclass',item).map(function(ii,card) { 
                    return {
                        id: GetID(ii + 1, id),
                        setId: id,
                        title: $('.tnamec',card).text().replace('"','').replace('"','').replace("&",''), 
                        titleRus: $('.smallfont',card).text(), 
                        rarity: rarityMap[$('.redkost',card).text()] || 's', 
                        price: ($('.pprice',card).text().replace(/((\d+) ₽)?\s*((\d+) коп\.)?/, '$2.$4') + '0') * 1 || 0,
                        priceHistory: [{
                            date: new Date(),
                            price: ($('.pprice',card).text().replace(/((\d+) ₽)?\s*((\d+) коп\.)?/, '$2.$4') + '0') * 1 || 0
                        }]
                    }; 
                }).toArray()
            }; 
        }).toArray();
}

module.exports.toDictionary = toDictionary;
module.exports.parseSale = parseSale;