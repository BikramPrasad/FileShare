require("dotenv").config();
const winston = require('winston');
const WinstonContext = require('winston-context');

const isProductionEnvironment = () => process.env.NODE_CONFIG_ENV === 'prod';
const logLevel = isProductionEnvironment() ? 'info' : 'silly';


function createLogger(env) {
  const logPrefix = process.env.LOG_PREFIX;
  const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.label({ label: `${logPrefix}::${env}` }),
      isProductionEnvironment() ? winston.format.json() : winston.format.printf(info => JSON.stringify(info)),
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });
  return logger;
}
const logger = createLogger(process.env.NODE_ENV);
const contextLogger = new WinstonContext(logger, '', {
  requestId: (Math.random() * 1e20).toString(36),
});

module.exports = contextLogger;