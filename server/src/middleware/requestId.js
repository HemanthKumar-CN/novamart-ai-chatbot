const crypto = require('crypto');

/**
 * Request ID middleware — assigns a unique ID to every request, either from
 * the incoming `x-request-id` header (for distributed tracing) or a new one.
 * The ID is exposed on `req.id` and echoed back in the response header.
 */
const requestId = (req, res, next) => {
  const incoming = req.get('x-request-id');
  const id = incoming && /^[a-zA-Z0-9_-]{1,128}$/.test(incoming) ? incoming : crypto.randomUUID();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
};

module.exports = requestId;
