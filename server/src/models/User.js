import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  gpa: { type: String }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  technologies: [{ type: String, trim: true }],
  link: { type: String },
  githubUrl: { type: String },
  startDate: { type: Date },
  endDate: { type: Date }
}, { _id: true });

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: Date },
  credentialUrl: { type: String },
  credentialId: { type: String }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false
  },
  role: {
    type: String,
    enum: ['STUDENT', 'COMPANY', 'ADMIN'],
    default: 'STUDENT',
    index: true
  },
  profile: {
    avatarUrl: { type: String, default: '' },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    skills: [{ type: String, trim: true }],
    education: [educationSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    careerPreferences: {
      targetRoles: [{ type: String, trim: true }],
      preferredLocations: [{ type: String, trim: true }],
      workModes: [{
        type: String,
        enum: ['REMOTE', 'HYBRID', 'ONSITE']
      }],
      preferredDomains: [{ type: String, trim: true }],
      minimumStipend: { type: Number, default: 0 }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
