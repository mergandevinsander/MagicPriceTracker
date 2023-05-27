const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const serveStatic = require('serve-static');

const config = require('./libs/config');
const priceParser = require('./libs/priceParser');
const cardService = require('./libs/cardService');
const log = require('./libs/log');

app.use(bodyParser.urlencoded({limit: '5000mb', extended: false, parameterLimit: 100000000}))

app.use(bodyParser.json({limit: '5000mb'}))
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(express.Router())
app.use(serveStatic(path.join(__dirname, "views")))

app.get('/api', (req, res) => res.send('API is running'))

app.get('/api/sets', (req, res) => cardService.getSets(sets => res.send(sets)))

app.get('/api/set/:id', (req, res) => cardService.getSet(req.params.id, set => res.send(set)))

app.get('/api/set/:setId/card/:id/setInLib/:inLib', (req, res) =>
    cardService.setInLib(req.params.setId, req.params.id, req.params.inLib, () => res.send({status: 'OK'})))

app.get('/api/parseSale', (req, res) =>
    priceParser.parseSale(sets => cardService.addAndLogSets(sets, () => res.send({status: 'OK'}))))

app.use((req, res, next) => {
    log.alert(`Not found URL: ${req.url}`)
    res.status(404).send({error: 'Not found'})
})

const errorHandler = (err, req, res, next) => {
    log.error(err.stack)
    res.status(500).send(err)
}

app.use(errorHandler)

app.listen(config.get("server:port"))
log.info(`Server running on http://${config.get("server:ip")}:${config.get("server:port")}`)

module.exports = app
