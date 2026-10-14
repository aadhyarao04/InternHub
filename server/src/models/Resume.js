import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  parsedContent: {
    rawText: { type: String, default: '' },
    summary: { type: String, default: '' },
    skills: [{ type: String }],
    education: [{ type: String }],
    experience: [{ type: String }],
    projects: [{ type: String }],
    certifications: [{ type: String }],
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    atsScore: { type: Number, default: 0 }
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

resumeSchema.index({ userId: 1, isPrimary: 1 });

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
