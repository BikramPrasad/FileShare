require('dotenv').config();
const winston = require('winston');
const WinstonContext = require('winston-context');

const logLevel = process.env.LOG_LEVEL || 'debug';

function createBaseLogger(env) {
  const logPrefix = process.env.LOG_PREFIX || 'AppLog';

  return winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.label({ label: `${logPrefix}::${env}` }),
      winston.format.metadata({
        fillExcept: ['message', 'level', 'timestamp', 'label'],
      }),
      winston.format.json()
    ),
    transports: [new winston.transports.Console()],
  });
}

const baseLogger = createBaseLogger(process.env.NODE_ENV);

function createContextLogger(req) {
  const requestId = (Math.random() * 1e20).toString(36);
  const context = {
    requestId,
    ip: req.ip || req.connection?.remoteAddress,
  };

  return new WinstonContext(baseLogger, '', context);
}

module.exports = { createContextLogger, logger: baseLogger };
