var nconf = require('nconf');

nconf.argv()
    .env()
    .file({ file: './config.json' });

var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;// || 'mongodb://sa:rxwdMFtSwzdodwNW@cluster0-shard-00-00-zblou.mongodb.net:27017,cluster0-shard-00-01-zblou.mongodb.net:27017,cluster0-shard-00-02-zblou.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

nconf.set('database:connectionString', mongoURL);
nconf.set('server:ip', ip);
nconf.set('server:port', port);

console.log(ip);
console.log(port);
console.log(mongoURL);

module.exports = nconf;