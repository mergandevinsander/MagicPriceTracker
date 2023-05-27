var winston = require('winston');

module.exports = winston.createLogger({
  level: 'info',
  format: winston.format.json(),

  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
