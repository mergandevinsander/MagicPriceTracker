var mongoose    = require('mongoose');
var log         = require('./log')(module);
var config      = require('./config');

mongoose.connect(config.get('mongoose:uri'));

var db = mongoose.connection;

db.on('error', function (err) {
    log.error('connection error:', err.message);
});

db.once('open', function callback () {
    log.info("Connected to DB!");
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
    priceHistory: [PriceHistory]
});

var CardSet = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    cards: [Card]
});


var CardSetModel = mongoose.model('CardSet', CardSet);

module.exports.CardSetModel = CardSetModel;