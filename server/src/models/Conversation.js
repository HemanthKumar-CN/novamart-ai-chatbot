const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 8000,
    },
    model: {
      type: String, // which model produced this assistant message
      default: null,
    },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New conversation',
      maxlength: 100,
      trim: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Index for fast user-scoped queries
conversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
