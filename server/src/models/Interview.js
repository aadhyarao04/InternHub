import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
    index: true
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Interview scheduled time is required']
  },
  durationMinutes: {
    type: Number,
    default: 45
  },
  locationOrLink: {
    type: String,
    required: [true, 'Meeting link or location is required']
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED'
  }
}, {
  timestamps: true
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
