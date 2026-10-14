import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetRole: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['ENTRY', 'INTERMEDIATE', 'ADVANCED'],
    default: 'ENTRY'
  },
  questions: [{
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    category: { type: String, default: 'General' }
  }],
  answers: [{
    questionId: { type: String, required: true },
    answerText: { type: String, required: true },
    feedback: {
      score: { type: Number, min: 0, max: 100 },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      modelAnswer: { type: String }
    }
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  overallFeedback: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;
