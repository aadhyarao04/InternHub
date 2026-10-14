import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetWeeks: { type: Number, default: 2 },
  resources: [{ type: String }],
  completed: { type: Boolean, default: false }
}, { _id: true });

const careerPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetRole: {
    type: String,
    required: true
  },
  currentSkills: [{
    type: String
  }],
  targetSkills: [{
    type: String
  }],
  timelineWeeks: {
    type: Number,
    default: 12
  },
  milestones: [milestoneSchema],
  recommendedProjects: [{
    title: String,
    description: String,
    suggestedTech: [String]
  }],
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const CareerPlan = mongoose.model('CareerPlan', careerPlanSchema);
export default CareerPlan;
