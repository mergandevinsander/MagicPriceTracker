var mongoose    = require('mongoose');
var config      = require('./config');

mongoose.connect(config.get("database:connectionString"));

var db = mongoose.connection;

db.on('error', function (err) {
    console.error('connection error:', err.message);
});

db.once('open', function callback () {
    console.info("Connected to DB!");
});

var Schema = mongoose.Schema;

var PriceHistory  = new Schema({
    price: { type: Number, required: true },
    date: {type: Date } 
});

var Card  = new Schema({
    id: { type: Number, required: true },
    price: { type: Number, required: true },
    rarity: {type: String, enum: ['c', 'u', 'r', 'm', 's'] },
    setId: { type: String, required: true },
    title: { type: String, required: true },
    titleRus: { type: String },
    priceHistory: [PriceHistory],
    inLib: { type: Boolean }
});

var CardSet = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    cards: [Card]
});

var MtgSet = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true }
});

var CardSetModel = mongoose.model('CardSet', CardSet);
var CardSetList = mongoose.model('MtgSet', MtgSet);

module.exports.CardSetModel = CardSetModel;
module.exports.CardSetList = CardSetList;