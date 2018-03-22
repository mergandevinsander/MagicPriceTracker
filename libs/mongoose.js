var mongoose    = require('mongoose');
//var log         = require('./log')(module);
//var config      = require('./config');

var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}

/*mongodb_connection_string = 'mongodb://127.0.0.1:27017/' + dbName;

if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + dbName;
}*/


var connect = function () {
    mongoose.connect(url);
};
connect();

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
    priceHistory: [PriceHistory]
});

var CardSet = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    cards: [Card]
});


var CardSetModel = mongoose.model('CardSet', CardSet);

module.exports.CardSetModel = CardSetModel;