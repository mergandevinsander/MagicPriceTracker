var express = require('express');
var app     = express();

var path            = require('path');
var config          = require('./libs/config');
var log             = require('./libs/log')(module);
var CardSetModel    = require('./libs/mongoose').CardSetModel;
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var serveStatic     = require('serve-static');

app.use(bodyParser.urlencoded({ limit: '5000mb', extended: false,
    parameterLimit: 100000000 }));
app.use(bodyParser.json({limit: '5000mb'}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.Router());
app.use(serveStatic(path.join(__dirname, "views")));

app.get('/api', function (req, res) {
    res.send('API is running');
});

app.get('/api/cards', function(req, res) {
    return CardSetModel.find().limit(3).exec(function (err, cardsets) {
        if (!err) {
            return res.send(cardsets);
        } else {
            console.error('Internal error(%d): %s',res.statusCode, err.message);
            return res.status(500).send({ error: 'Server error' });
        }
    });
});

app.post('/api/cards', function(req, res) {
	//Some peace of shit - I dont know why it so hard to parse json
	var diff;
	for (var cid in req.body) {
		diff= JSON.parse(cid);
	}

	CardSetModel.findOne({ id: diff.id }, function (err, set) {
        if(!set) {
		    set = new CardSetModel({
		        id: diff.id,
		        title: diff.t
		    });
            
        	for (var cid in diff.c) {

				var card = diff.c[cid];
				set.cards.push({
					id: card.id,
				    price: card.p,
				    rarity: card.r,
				    setId: card.sid,
				    title: card.t,
				    titleRus: card.tr,
				    priceHistory: [{
				    	date: new Date(),
				    	price: card.p
				    }]
				});
			};


	        return set.save(function (err) {
	            if (!err) {
	                log.info("set added");
	            } else {
	                log.error('Internal error(%d): %s',res.statusCode,err.message);
	            }
	        });

        } else {

			for (var j = set.cards.length - 1; j >= 0; j--) {
				var card = set.cards[j];
				if (diff.c[card.id].p != card.price) {
					card.priceHistory.push({ date: new Date(), price: diff.c[card.id].p });
					card.price = diff.c[card.id].p;
				}
			};

        }

        return set.save(function (err) {
            if (err) {
                log.error('Internal error(%d): %s',res.statusCode,err.message);
            }
        });

    }); 
	
	return res.send({ status: 'OK' });
});

app.use(function(req, res, next){
    console.log('Not found URL: %s',req.url);
    res.status(404).send({ error: 'Not found' });
    return;
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(config.get("server:port"), config.get("server:ip"));
console.log('Server running on http://%s:%s', config.get("server:ip"), config.get("server:port"));

module.exports = app;
