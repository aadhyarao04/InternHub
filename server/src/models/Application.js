import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  coverLetter: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'],
    default: 'APPLIED',
    index: true
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'],
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  }],
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Enforce unique application per student and internship
applicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
