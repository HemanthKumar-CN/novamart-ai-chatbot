const Conversation = require('../models/Conversation');
const { generateReply } = require('../services/openrouterService');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

/**
 * Generate a short title from the first user message.
 */
const autoTitle = (text) => {
  const cleaned = (text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'New conversation';
  return cleaned.length > 50 ? `${cleaned.slice(0, 47)}...` : cleaned;
};

/**
 * POST /chat/send
 * Body: { conversationId?: string, message: string }
 * Returns: { conversationId, reply, model, messages }
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, message } = req.body;

  let conversation;
  if (conversationId) {
    conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id,
    });
    if (!conversation) {
      throw new AppError('Conversation not found.', 404);
    }
  } else {
    conversation = await Conversation.create({
      user: req.user._id,
      title: autoTitle(message),
      messages: [],
    });
  }

  // Push the user message
  conversation.messages.push({ role: 'user', content: message.trim() });

  // Generate AI reply (uses fallback chain internally)
  const { reply, model } = await generateReply(conversation.messages, message.trim());

  // Push assistant reply
  conversation.messages.push({ role: 'assistant', content: reply, model });

  // Keep the conversation bounded (last 60 messages)
  if (conversation.messages.length > 60) {
    conversation.messages = conversation.messages.slice(-60);
  }

  await conversation.save();

  logger.info(
    { userId: req.user._id, conversationId: conversation._id, model },
    'Message handled'
  );

  res.json({
    conversationId: conversation._id,
    title: conversation.title,
    reply,
    model,
    messages: conversation.messages,
  });
});

/**
 * GET /chat/conversations — list (most recent first)
 */
exports.listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .select('title updatedAt createdAt')
    .lean();
  res.json({ conversations });
});

/**
 * GET /chat/conversations/:id
 */
exports.getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }
  res.json({ conversation });
});

/**
 * DELETE /chat/conversations/:id
 */
exports.deleteConversation = asyncHandler(async (req, res) => {
  const result = await Conversation.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!result) {
    throw new AppError('Conversation not found.', 404);
  }
  logger.info({ userId: req.user._id, conversationId: req.params.id }, 'Conversation deleted');
  res.json({ message: 'Conversation deleted' });
});
