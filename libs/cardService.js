const CardSetModel = require('./mongoose').CardSetModel
const CardSetList = require('./mongoose').CardSetList
const log = require('./log')

function toDictionary(array, idColumn) {
    const dict = {}
    for (let v of array)
        dict[v][idColumn] = v
    return dict
}

const logIfError = (err, callBack) => {
    if (err) log.error(`Internal error: ${err.message}`)
    if (callBack) callBack()
}

module.exports = {
    getSets: callBack => CardSetList.find().exec((err, cardSets) => logIfError(err, () => callBack(cardSets))),

    getSet: (setId, callBack) => CardSetModel.findOne({id: setId}).exec((err, cardSet) => logIfError(err, () => callBack(cardSet))),

    setInLib: (setId, cardId, inLib, callBack) =>
        CardSetModel.findOne({id: setId}).exec((err, set) => {
            const card = set.cards.filter(card => card.id === cardId).pop()
            if (card) card.inLib = inLib
            set.save(err => logIfError(err, () => callBack()))
        }),

    addAndLogSets: (diffs, callBack) => {
        for (const diff of diffs) {
            module.exports.addAndLogSet(diff)
        }
        callBack()
    },

    addAndLogSet: (diff) => {
        CardSetList.findOne({id: diff.id}, (err, set) => {
            if (set) return
            set = new CardSetList({id: diff.id, title: diff.title})
            return set.save(err => logIfError(err))
        })

        CardSetModel.findOne({id: diff.id}, (err, set) => {
            if (!set) {
                set = new CardSetModel(diff)
                return set.save(err => logIfError(err))
            }

            const dict = toDictionary(diff.cards, 'id')

            for (let card of set.cards) {
                const newCard = dict[card.id]
                if (newCard.price === card.price)
                    continue
                card.priceHistory = card.priceHistory.concat(newCard.priceHistory)
                card.price = newCard.price
            }

            return set.save(err => logIfError(err))
        })
    },
}