import CareerPlan from '../../models/CareerPlan.js';
import User from '../../models/User.js';
import { generateText } from './aiProvider.js';
import { AppError } from '../../middleware/errorHandler.js';

export const generateRoadmap = async (userId, targetRole, timelineWeeks = 12) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student profile not found.', 404);

  const currentSkills = user.profile?.skills || [];

  const prompt = `Student Current Skills: [${currentSkills.join(', ')}]
Target Career Role: "${targetRole}"
Timeline: ${timelineWeeks} Weeks

Generate a structured career learning roadmap as JSON:
{
  "targetSkills": ["List of critical missing skills to learn"],
  "milestones": [
    {
      "title": "Phase title",
      "description": "Specific focus and concepts",
      "targetWeeks": 3,
      "resources": ["Recommended documentation, tutorials, or topics"],
      "completed": false
    }
  ],
  "recommendedProjects": [
    {
      "title": "Project Title",
      "description": "Practical portfolio application to build",
      "suggestedTech": ["React", "Express", "MongoDB"]
    }
  ],
  "notes": "Actionable mentorship guidance"
}`;

  let parsed = null;
  try {
    const aiResponse = await generateText(prompt, 'You are an elite career development architect.', true);
    if (aiResponse) {
      const clean = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(clean);
    }
  } catch (err) {
    console.warn('[CareerRoadmap] AI roadmap generation fallback:', err.message);
  }

  if (!parsed) {
    // Intelligent heuristic roadmap
    parsed = {
      targetSkills: ['Modern Web Architecture', 'API Design & Security', 'Database Modeling', 'System Optimization'],
      milestones: [
        {
          title: 'Foundational Competency',
          description: `Consolidate programming fundamentals and modern best practices for ${targetRole}.`,
          targetWeeks: Math.round(timelineWeeks * 0.3),
          resources: ['Official Documentation', 'Modern Web Standards Guidelines'],
          completed: false
        },
        {
          title: 'Advanced Implementation & Projects',
          description: 'Build a production-grade portfolio application demonstrating end-to-end functionality.',
          targetWeeks: Math.round(timelineWeeks * 0.4),
          resources: ['GitHub portfolio review', 'System Design Primer'],
          completed: false
        },
        {
          title: 'Interview Preparation & Applications',
          description: 'Conduct mock interviews, refine ATS resume, and apply to targeted internship opportunities.',
          targetWeeks: Math.round(timelineWeeks * 0.3),
          resources: ['InternHub AI Interview Simulator', 'Technical Q&A Practice'],
          completed: false
        }
      ],
      recommendedProjects: [
        {
          title: `${targetRole} Production Showcase`,
          description: 'A full-stack, deployed system with authentication, database indexing, and external API integrations.',
          suggestedTech: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS']
        }
      ],
      notes: `Focus consistently on closing identified skill gaps and updating your profile as you master each milestone.`
    };
  }

  const plan = await CareerPlan.create({
    userId,
    targetRole,
    currentSkills,
    targetSkills: parsed.targetSkills || [],
    timelineWeeks,
    milestones: parsed.milestones || [],
    recommendedProjects: parsed.recommendedProjects || [],
    notes: parsed.notes || ''
  });

  return plan;
};

export const getStudentPlans = async (userId) => {
  return await CareerPlan.find({ userId }).sort({ createdAt: -1 });
};

export const toggleMilestone = async (userId, planId, milestoneId) => {
  const plan = await CareerPlan.findOne({ _id: planId, userId });
  if (!plan) throw new AppError('Career plan not found.', 404);

  const milestone = plan.milestones.id(milestoneId);
  if (!milestone) throw new AppError('Milestone not found.', 404);

  milestone.completed = !milestone.completed;
  await plan.save();
  return plan;
};

export default {
  generateRoadmap,
  getStudentPlans,
  toggleMilestone
};
