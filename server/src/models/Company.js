import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  logoUrl: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  companySize: {
    type: String,
    enum: ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'],
    default: 'STARTUP'
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
    index: true
  }
}, {
  timestamps: true
});

const Company = mongoose.model('Company', companySchema);
export default Company;
