import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Career Discussion'
  }
}, {
  timestamps: true
});

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;
