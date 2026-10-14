import mongoose from 'mongoose';

const aiMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIConversation',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  toolCalls: [{
    toolName: String,
    args: mongoose.Schema.Types.Mixed
  }],
  toolResults: [{
    toolName: String,
    result: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

aiMessageSchema.index({ conversationId: 1, createdAt: 1 });

const AIMessage = mongoose.model('AIMessage', aiMessageSchema);
export default AIMessage;
