var express = require('express');
//var path  = require('path');
//var log             = require('./libs/log')(module);
var log = console;

//var CardSetModel    = require('./libs/mongoose').CardSetModel;

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var app = express();

Object.assign=require('object-assign');

app.engine('html', require('ejs').renderFile);

//var bodyParser = require('body-parser');
//var methodOverride = require('method-override');
//var serveStatic = require('serve-static');
//var config          = require('./libs/config');

/*app.use(bodyParser.urlencoded({ limit: '5000mb', extended: false,
    parameterLimit: 100000000 }));
app.use(bodyParser.json({limit: '5000mb'}));
app.use(methodOverride('X-HTTP-Method-Override'));*/
//app.use(express.Router());
//app.use(serveStatic(path.join(__dirname, "views"))); 

/*app.get('/api', function (req, res) {
    res.send('API is running');
});

app.get('/api/cards', function(req, res) {
    return CardSetModel.find(function (err, cardsets) {
        if (!err) {
            return res.send(cardsets);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.send({ error: 'Server error' });
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
    res.status(404);
    log.debug('Not found URL: %s',req.url);
    res.send({ error: 'Not found' });
    return;
});*/

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  res.render('index.html');
});

app.use(function(err, req, res, next){
    res.status(err.status || 500);
    //log.error('Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: err.message });
    return;
});

app.listen(server_port, server_ip_address);

//log.debug('Server have started');