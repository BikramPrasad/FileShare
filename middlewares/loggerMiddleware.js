// middlewares/loggerMiddleware.js
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

module.exports = (req, res, next) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  // Attach context-aware logger to req
  req.requestId = requestId;
  req.logger = logger.child({
    requestId,
    ip:
      req.ip ||
      req.connection?.remoteAddress ||
      req.headers['x-forwarder-for'] ||
      req.host,
  });

  req.logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    req.logger.info('Completed request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration} ms`,
    });
  });

  next();
};
