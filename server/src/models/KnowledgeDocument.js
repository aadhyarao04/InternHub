import mongoose from 'mongoose';

const knowledgeDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['CAREER', 'RESUME', 'INTERVIEW', 'TECH', 'FAQ'],
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  chunks: [{
    text: { type: String, required: true },
    embedding: [{ type: Number }]
  }],
  metadata: {
    tags: [{ type: String }],
    source: { type: String, default: 'InternHub AI Career Knowledge Base' }
  }
}, {
  timestamps: true
});

knowledgeDocumentSchema.index({ title: 'text', content: 'text' });

const KnowledgeDocument = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
export default KnowledgeDocument;
