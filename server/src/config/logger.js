const pino = require('pino');

/**
 * Structured JSON logger using Pino.
 * - In dev: pretty-printed, colorized
 * - In prod: raw JSON, ship to log aggregator (Datadog, CloudWatch, etc.)
 */
const isProd = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  base: { service: 'novamart-server', env: process.env.NODE_ENV || 'development' },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,hostname,service,env',
            singleLine: false,
          },
        },
      }),
});

module.exports = logger;
