var express = require('express');
var app     = express();
    
/*need to run tests*/
Object.assign=require('object-assign');
app.engine('html', require('ejs').renderFile);
/*need to run tests*/

var path    = require('path');
var log             = require('./libs/log')(module);
var CardSetModel    = require('./libs/mongoose').CardSetModel;
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var serveStatic     = require('serve-static');
var config          = require('./libs/config');

app.use(bodyParser.urlencoded({ limit: '5000mb', extended: false,
    parameterLimit: 100000000 }));
app.use(bodyParser.json({limit: '5000mb'}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.Router());
app.use(serveStatic(path.join(__dirname, "views")));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/pagecount', function (req, res) {
  res.send('{ pageCount: -1 }');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
