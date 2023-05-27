const mongoose = require('mongoose')
const config = require('./config')
const log = require('./log')

mongoose.connect(config.get("database:connectionString"), {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection

db.on('error', err => log.error('connection error:' + err.message))

db.once('open', () => log.info("Connected to DB!"))

const Schema = mongoose.Schema

const PriceHistory = new Schema({
    price: {type: Number, required: true},
    date: {type: Date}
})

const Card = new Schema({
    id: {type: Number, required: true},
    price: {type: Number, required: true},
    rarity: {type: String, enum: ['c', 'u', 'r', 'm', 's']},
    setId: {type: String, required: true},
    title: {type: String, required: true},
    titleRus: {type: String},
    priceHistory: [PriceHistory],
    inLib: {type: Boolean}
})

const CardSet = new Schema({
    id: {type: String, required: true},
    title: {type: String, required: true},
    cards: [Card]
})

const MtgSet = new Schema({
    id: {type: String, required: true},
    title: {type: String, required: true}
})

const CardSetModel = mongoose.model('CardSet', CardSet)
const CardSetList = mongoose.model('MtgSet', MtgSet)

module.exports.CardSetModel = CardSetModel
module.exports.CardSetList = CardSetList