require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');

const MongoService = require('./config/db');
const { logger } = require('./utils/logger');
const loggerMiddleware = require('./middlewares/loggerMiddleware');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.set('trust-proxy', true);

// Middlewares
app.use(
  cors({
    origin: process.env.ALLOWED_CLIENTS
      ? process.env.ALLOWED_CLIENTS.split(',')
      : [],
  })
);
app.use(loggerMiddleware);
app.use(helmet());
app.use(compression());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: data:; script-src 'self' https: 'unsafe-inline'; style-src 'self' https: 'unsafe-inline'; img-src 'self' https: data:;"
  );
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});
app.use('/api/files', require('./routes/uploadFileandSendEmailRoutes'));
app.use('/files', require('./routes/downloadandViewRoutes'));

// 404 Handler
app.use((req, res) => {
  logger.warn(`404 - Page not found - ${req.originalUrl}`);
  res.status(404).render('error');
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Something went wrong!';
  logger.error(`❌ Server error: ${err.stack}`);
  res.status(statusCode).json({ error: errorMessage });
});

// Start Server
const startServer = async () => {
  let server;
  try {
    await MongoService.getInstance().init();
    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => {
      logger.info(`🚀 Listenting on port ${PORT}`);
    });

    const shutdown = async () => {
      logger.info('🛑 Gracefully shutting down...');
      if (server) {
        server.close(() => logger.info('✅ HTTP server closed.'));
      }
      await MongoService.getInstance().destroy();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    process.on('uncaughtException', (err) => {
      logger.error(`💥 Uncaught Exception: ${err.stack}`);
      shutdown();
    });

    process.on('unhandledRejection', (reason) => {
      logger.error(`🔥 Unhandled Rejection: ${reason.stack || reason}`);
      shutdown();
    });
  } catch (err) {
    logger.error(`❌ Failed to start server: ${err.stack}`);
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  }
};

startServer();
