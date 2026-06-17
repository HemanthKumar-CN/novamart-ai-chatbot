const express = require('express');
const protect = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/errorHandler');
const { sendMessageSchema, objectIdParamSchema } = require('../validators/schemas');
const {
  sendMessage,
  listConversations,
  getConversation,
  deleteConversation,
} = require('../controllers/chatController');

const router = express.Router();

// All chat routes are protected
router.use(protect);
router.use(chatLimiter);

router.post('/send', validate({ body: sendMessageSchema }), sendMessage);
router.get('/conversations', listConversations);
router.get('/conversations/:id', validate({ params: objectIdParamSchema }), getConversation);
router.delete(
  '/conversations/:id',
  validate({ params: objectIdParamSchema }),
  deleteConversation
);

module.exports = router;
