const nconf = require('nconf')

nconf.file({file: './config.json'})

let mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL

if (!mongoURL && process.env.DATABASE_SERVICE_NAME) {
    const mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword = process.env[mongoServiceName + '_PASSWORD']
    mongoUser = process.env[mongoServiceName + '_USER']

    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURL = 'mongodb://'
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@'
        }
        mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase

    }
} else if (!mongoURL) {
    mongoURL = nconf.get("database:connectionString")
}

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || nconf.get("server:port"),
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || nconf.get("server:ip")

nconf.set('database:connectionString', mongoURL)
nconf.set('server:port', port)
nconf.set('server:ip', ip)

module.exports = nconf