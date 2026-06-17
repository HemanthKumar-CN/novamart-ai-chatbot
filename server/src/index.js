const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const config = require('./config/env');
const logger = require('./config/logger');
const connectDB = require('./config/db');
const requestId = require('./middleware/requestId');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy (so rate limiter & req.ip work behind Render/Vercel/Cloudflare)
app.set('trust proxy', 1);

// Request ID — first so every log line can include it
app.use(requestId);

// Security headers with a strict CSP
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        // Vite dev needs inline + eval; production is more strict
        scriptSrc: config.isProd
          ? ["'self'"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://openrouter.ai', ...config.clientOrigin],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: config.isProd ? [] : null,
      },
    },
  })
);

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookie.secret));

// CORS — allow configured client origins
app.use(
  cors({
    origin: (origin, cb) => {
      // allow same-origin / curl / mobile apps (no origin header)
      if (!origin) return cb(null, true);
      if (config.clientOrigin.includes('*') || config.clientOrigin.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// HTTP access logs → Pino
const httpLogger = morgan(
  (tokens, req, res) =>
    JSON.stringify({
      level: 'http',
      reqId: req.id,
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      bytes: Number(tokens.res(req, res, 'content-length')) || 0,
      ms: Number(tokens['response-time'](req, res)),
      ua: tokens['user-agent'](req, res),
    }),
  {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  }
);
app.use(httpLogger);

// Health check — also pings MongoDB
app.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const ok = dbState === 1;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    service: 'novamart-server',
    env: config.nodeEnv,
    db: states[dbState] || 'unknown',
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});

// API routes (mounted at /api/*)
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Root info
app.get('/', (req, res) => {
  res.json({
    name: 'NovaMart Customer Support API',
    version: '1.0.0',
    docs: '/api/auth, /api/chat',
    health: '/health',
  });
});

// 404 + error handler (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  logger.info(
    { port: config.port, env: config.nodeEnv },
    `🚀 NovaMart API running on port ${config.port}`
  );
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info({ signal }, 'Shutdown signal received');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception — exiting');
  process.exit(1);
});

module.exports = app;
