import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  responsibilities: [{
    type: String,
    trim: true
  }],
  requiredSkills: [{
    type: String,
    trim: true,
    required: true
  }],
  preferredSkills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  workMode: {
    type: String,
    enum: ['REMOTE', 'HYBRID', 'ONSITE'],
    required: true,
    default: 'REMOTE',
    index: true
  },
  duration: {
    durationValue: {
      type: Number,
      required: true,
      min: 1,
      default: 3
    },
    durationUnit: {
      type: String,
      enum: ['WEEKS', 'MONTHS'],
      required: true,
      default: 'MONTHS'
    }
  },
  stipend: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    period: {
      type: String,
      enum: ['MONTHLY', 'TOTAL', 'UNPAID'],
      default: 'MONTHLY'
    }
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
    index: true
  },
  openings: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'EXPIRED'],
    default: 'DRAFT',
    index: true
  },
  embeddings: [{
    type: Number
  }]
}, {
  timestamps: true
});

internshipSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

const Internship = mongoose.model('Internship', internshipSchema);
export default Internship;
