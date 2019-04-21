var express         = require('express');
var app             = express();
var path            = require('path');
var log             = require('./libs/log')(module);
var CardSetModel    = require('./libs/mongoose').CardSetModel;
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var serveStatic     = require('serve-static');
var config          = require('./libs/config');
var priceParser     = require('./libs/priceParser');
var requestPromise  = require('request-promise');
var cheerio         = require('cheerio');

app.use(bodyParser.urlencoded({ limit: '5000mb', extended: false, parameterLimit: 100000000 }));

app.use(bodyParser.json({limit: '5000mb'}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.Router());
app.use(serveStatic(path.join(__dirname, "views")));

app.get('/api', (req, res) => {
    res.send('API is running');
});

app.get('/api/cards', (req, res) => {
    return CardSetModel.find().exec( (err, cardsets) => {
        if (!err) {
            return res.send(cardsets);
        } else {
            console.error('Internal error(%d): %s',res.statusCode, err.message);
            return res.status(500).send({ error: 'Server error' });
        }
    });
});

app.get('/api/parseSale', (req, res) => {
	requestPromise({
	  uri: 'https://mtgsale.ru/home/buylist',
	  method: 'GET',
	  rejectUnauthorized: false
	}).then( (htmlString) => {
		var sets = priceParser.parseSale(htmlString);

		for (var i = 0; i < sets.length; i++) {
			var diff = sets[i];
			addSet(sets[i]);
		}
		res.send({ status: 'OK'});
    });
});

var addSet = (diff) => {
	var diff;

	CardSetModel.findOne({ id: diff.id }, (err, set) => {
        if(!set) {
		    set = new CardSetModel(diff);

	        return set.save( (err) => {
	            if (!err) {
	                log.info("set added");
	            } else {
	                log.error('Internal error: %s',err.message);
	            }
	        });

        } else {
        	var dict = priceParser.toDictionary(diff.cards, 'id');

			for (var j = set.cards.length - 1; j >= 0; j--) {
				var card = set.cards[j];
				var newCard = dict[card.id];
				if (newCard.price != card.price) {
					card.priceHistory = card.priceHistory.concat(newCard.priceHistory);
					card.price = newCard.price;
				}
			};
        }

        return set.save( (err) => {
            if (err) {
                log.error('Internal error: %s',err.message);
            }
        });

    }); 
};

app.use( (req, res, next) => {
  console.log('Not found URL: %s',req.url);
  res.status(404).send({ error: 'Not found' });
  return;
});

app.use( (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(config.get("server:port"));//, config.get("server:ip"));
console.log('Server running on http://%s:%s', config.get("server:ip"), config.get("server:port"));

module.exports = app;
