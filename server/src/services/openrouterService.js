const axios = require('axios');
const config = require('../config/env');
const SYSTEM_PROMPT = require('../utils/systemPrompt');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Fallback chain — primary first, then backups if the model rate-limits/fails.
 * These are all free-tier models on OpenRouter.
 */
const MODEL_CHAIN = [
  'openai/gpt-oss-120b:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nex-agi/nex-n2-pro:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
];

/**
 * Build the messages array — system prompt + recent history + new user msg.
 * Keeps the last N messages to stay under token limits.
 */
const buildMessages = (history, userMessage, windowSize = 10) => {
  const recent = (history || [])
    .slice(-windowSize)
    .map((m) => ({ role: m.role, content: m.content }));

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recent,
    { role: 'user', content: userMessage },
  ];
};

/**
 * Single call to one model. Returns { ok, content, model, error }.
 */
const callModel = async (model, messages) => {
  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${config.openrouter.apiKey}`,
          'HTTP-Referer': config.openrouter.siteUrl,
          'X-Title': config.openrouter.appName,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content) {
      return { ok: false, error: 'Empty response from model', model };
    }
    return { ok: true, content: content.trim(), model };
  } catch (err) {
    const status = err.response?.status;
    const message =
      err.response?.data?.error?.message || err.message || 'Unknown error';
    return { ok: false, error: message, status, model };
  }
};

/**
 * Try the configured primary model first, then walk the fallback chain
 * on 429 / 5xx / network errors. Sleeps briefly between attempts.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const generateReply = async (history, userMessage) => {
  const messages = buildMessages(history, userMessage);

  // Build the order to try: configured model first, then the rest of the chain
  // (skipping duplicates).
  const chain = [
    config.openrouter.model,
    ...MODEL_CHAIN.filter((m) => m !== config.openrouter.model),
  ];

  const tried = new Set();
  const errors = [];

  for (const model of chain) {
    if (tried.has(model)) continue;
    tried.add(model);

    // eslint-disable-next-line no-await-in-loop
    const result = await callModel(model, messages);

    if (result.ok) {
      if (model !== config.openrouter.model) {
        console.warn(`⚠️  Used fallback model: ${model} (primary was: ${config.openrouter.model})`);
      }
      return { reply: result.content, model: result.model };
    }

    errors.push({ model, status: result.status, error: result.error });
    console.warn(`❌ Model ${model} failed: ${result.error}`);

    const isRateLimit = result.status === 429;
    const isServerError = result.status >= 500;
    const isNetwork = !result.status;

    if (isRateLimit || isServerError || isNetwork) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(isRateLimit ? 1500 : 800);
      continue;
    }
    // Non-retryable error (4xx other than 429): stop here
    break;
  }

  const last = errors[errors.length - 1];
  const err = new Error(
    last?.status === 429
      ? 'All AI models are currently busy. Please try again in a minute.'
      : `AI request failed: ${last?.error || 'unknown error'}`
  );
  err.statusCode = last?.status === 429 ? 503 : 502;
  throw err;
};

module.exports = { generateReply, MODEL_CHAIN };
