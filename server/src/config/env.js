/**
 * Environment configuration & validation
 *
 * - In PRODUCTION, all required env vars are strictly enforced (hard-fail).
 * - In DEVELOPMENT, missing JWT_SECRET / COOKIE_SECRET are auto-generated as
 *   random 64-char hex strings so the app boots with `docker compose up` even
 *   on a fresh clone with an empty .env. A loud warning is printed once.
 *
 *   MONGO_URI and OPENROUTER_API_KEY are ALWAYS required — we can't guess
 *   those (MONGO_URI has a Docker-internal default in compose; OPENROUTER_API_KEY
 *   must come from the user).
 */
require('dotenv').config();

const crypto = require('crypto');

const isProd = process.env.NODE_ENV === 'production';

const requiredEnv = (key) => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optionalEnv = (key, fallback) => process.env[key] ?? fallback;
const boolEnv = (key, fallback = false) => {
  const v = process.env[key];
  if (v === undefined) return fallback;
  return v === 'true' || v === '1' || v === 'yes';
};

/**
 * In dev only: return the env value if set, else generate a random secret
 * and print a one-time warning.
 */
const devSecret = (key) => {
  const value = process.env[key];
  if (value && value.trim() !== '') return value;
  if (isProd) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const generated = crypto.randomBytes(32).toString('hex');
  // eslint-disable-next-line no-console
  console.warn(
    `\n⚠️  [env] ${key} not set — generated a random dev-only secret.\n` +
      `    Set a real value in your .env for stable sessions across restarts.\n` +
      `    (e.g. ${key}=$(openssl rand -hex 32))\n`
  );
  return generated;
};

const config = {
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  port: parseInt(optionalEnv('PORT', '5050'), 10),
  mongoUri: requiredEnv('MONGO_URI'),
  jwt: {
    secret: devSecret('JWT_SECRET'),
    expiresIn: optionalEnv('JWT_EXPIRES_IN', '7d'),
  },
  cookie: {
    secret: devSecret('COOKIE_SECRET'),
    secure: boolEnv('COOKIE_SECURE', isProd),
  },
  clientOrigin: optionalEnv('CLIENT_ORIGIN', 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  openrouter: {
    apiKey: requiredEnv('OPENROUTER_API_KEY'),
    model: optionalEnv('OPENROUTER_MODEL', 'openai/gpt-oss-120b:free'),
    siteUrl: optionalEnv('OPENROUTER_SITE_URL', 'http://localhost:5173'),
    appName: optionalEnv('OPENROUTER_APP_NAME', 'NovaMart-Support'),
  },
  logLevel: optionalEnv('LOG_LEVEL', undefined),
  isProd,
};

module.exports = config;
