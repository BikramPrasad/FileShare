require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');

const MongoService = require('./config/db');
const logger = require('./utils/logger');

const app = express();

// ✅ View engine setup FIRST
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// ✅ Middleware Setup
app.use(
  cors({
    origin: process.env.ALLOWED_CLIENTS
      ? process.env.ALLOWED_CLIENTS.split(',')
      : [],
  })
);
app.use(helmet()); // Optional: helmet.contentSecurityPolicy({ useDefaults: true }) — see below
app.use(compression());
app.use(express.json());

// ✅ Static files (must be before routes)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Optional: Better CSP (optional, remove completely if debugging)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: data:; script-src 'self' https: 'unsafe-inline'; style-src 'self' https: 'unsafe-inline'; img-src 'self' https: data:;"
  );
  next();
});

// ✅ Route for EJS home page
app.get('/', (req, res) => {
  res.render('index');
});

// ✅ Other routes
app.use('/api/files', require('./routes/uploadFileandSendEmailRoutes'));
app.use('/files', require('./routes/downloadandViewRoutes'));

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  logger.error(`❌ ${err.stack}`);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ Server startup
const startServer = async () => {
  let server;
  try {
    await MongoService.getInstance().init();
    const PORT = process.env.PORT || 3000;
    server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      logger.info('🔌 Shutting down gracefully...');
      if (server) server.close(() => logger.info('✅ HTTP server closed.'));
      await MongoService.getInstance().destroy();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('uncaughtException', (err) => {
      logger.error(`💥 uncaughtException :: ${err.stack}`);
      shutdown();
    });
    process.on('unhandledRejection', (reason) => {
      logger.error(`🔥 unhandledRejection :: ${reason.stack || reason}`);
      shutdown();
    });
  } catch (err) {
    logger.error('❌ Error starting the server:', err);
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  }
};

startServer();
