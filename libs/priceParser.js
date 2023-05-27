const cheerio = require('cheerio')
const config = require('./config')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

const rarityMap = {
    'Обычная': 'c',
    'Необычная': 'u',
    'Редкая': 'r',
    'Мифическая': 'm',
}

const exceptions = config.get("parserExceptions")


function GetID(id, set) {
    for (let i = exceptions.notExists.length - 1; i >= 0; i--) {
        const ne = exceptions.notExists[i]
        if (ne.set === set) {
            for (let j = 0; j < ne.ids.length; j++) {
                if (id >= ne.ids[j])
                    id++
            }
        }
    }

    for (let i = exceptions.doubles.length - 1; i >= 0; i--) {
        const dbl = exceptions.doubles[i]
        if (dbl.set === set) {
            for (let j = 0; j < dbl.ids.length; j++) {
                if (id >= dbl.ids[j])
                    id--
            }
        }
    }
    return id
}

function parseSale(htmlString) {
    const $ = cheerio.load(htmlString)

    return $('.sub').map(
        function (i, item) {
            const id = $('.titler .seticon', item).attr('class').substring(2, $('.titler .seticon', item).attr('class').indexOf(' '))
            return {
                id: id,
                title: $('.titler .seticon', item).attr('title').replace('&', 'and'),
                cards: $('.ctclass', item).map(function (ii, card) {
                    return {
                        id: GetID(ii + 1, id),
                        setId: id,
                        title: $('.tnamec', card).text().replace('"', '').replace('"', '').replace("&", ''),
                        titleRus: $('.smallfont', card).text(),
                        rarity: rarityMap[$('.redkost', card).text()] || 's',
                        price: ($('.pprice', card).text().replace(/((\d+) ₽)?\s*((\d+) коп\.)?/, '$2.$4') + '0') * 1 || 0,
                        priceHistory: [{
                            date: new Date(),
                            price: ($('.pprice', card).text().replace(/((\d+) ₽)?\s*((\d+) коп\.)?/, '$2.$4') + '0') * 1 || 0
                        }]
                    }
                }).toArray()
            }
        }).toArray()
}

function parse(callBack) {
    fetch(config.get('priceSource'))
        .then(res => res.text())
        .then(htmlString => parseSale(htmlString))
        .then(sets => callBack(sets))
}

module.exports = {
    parseSale:parse
}