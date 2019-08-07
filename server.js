var express         = require('express')
var app             = express()
var path            = require('path')
var log             = require('./libs/log')(module)
var CardSetModel    = require('./libs/mongoose').CardSetModel
var CardSetList     = require('./libs/mongoose').CardSetList
var bodyParser      = require('body-parser')
var methodOverride  = require('method-override')
var serveStatic     = require('serve-static')
var config          = require('./libs/config')
var priceParser     = require('./libs/priceParser')
var requestPromise  = require('request-promise')
var cheerio         = require('cheerio')
var cardService     = require('./lib/cardService')

app.use(bodyParser.urlencoded({ limit: '5000mb', extended: false, parameterLimit: 100000000 }))

app.use(bodyParser.json({limit: '5000mb'}))
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(express.Router())
app.use(serveStatic(path.join(__dirname, "views")))

app.get('/api', (req, res) => {
    res.send('API is running')
})

app.get('/api/sets', (req, res) => {
  var sets = cardService.getSets()
  if (sets) res.send(sets)
  res.status(500).send({ error: 'Server error' })
})

app.get('/api/set/:id', (req, res) => {
  var sets = cardService.getSet(req.params.id)
  if (sets) res.send(sets)
  res.status(500).send({ error: 'Server error' })
})

app.get('/api/set/:setId/card/:cardId/setInLib/:inLib', (req, res) => {
  cardService.setInLib(req.params.setId, req.params.cardId, req.params.inLib)
  res.send({ status: 'OK'})
})

app.get('/api/parseSale', (req, res) => {
	requestPromise({
	  uri: 'https://mtgsale.ru/home/buylist',
	  method: 'GET',
	  rejectUnauthorized: false
	}).then( (htmlString) => {
		var sets = priceParser.parseSale(htmlString)

		for (var i = 0; i < sets.length; i++) {
			cardService.addAndLogSet(sets[i])
		}
    
		res.send({ status: 'OK'})
  })
})

app.use( (req, res, next) => {
  log.log('Not found URL: %s',req.url)
  res.status(404).send({ error: 'Not found' })
})

app.use( (err, req, res, next) => {
  log.error(err.stack)
  res.status(500).send('Something bad happened!')
})

app.listen(config.get("server:port"))//, config.get("server:ip"))
log.log('Server running on http://%s:%s', config.get("server:ip"), config.get("server:port"))

module.exports = app
