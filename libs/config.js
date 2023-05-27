const nconf = require('nconf')

nconf.argv().env().file({file: './config.json'})

let mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL
let dbName
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
        mongoURL += mongoHost + ':' + mongoPort
        dbName = mongoDatabase

    }
} else if (!mongoURL) {
    mongoURL = nconf.get("database:connectionString")
}

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || nconf.get("server:port"),
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || nconf.get("server:ip")

dbName = dbName || process.env.DB_NAME || nconf.get("database:dbName")

nconf.set('database:connectionString', mongoURL)
nconf.set("database:dbName", dbName)
nconf.set('server:port', port)
nconf.set('server:ip', ip)

module.exports = nconf