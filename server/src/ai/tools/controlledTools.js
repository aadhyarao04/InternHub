import User from '../../models/User.js';
import Internship from '../../models/Internship.js';
import CareerPlan from '../../models/CareerPlan.js';
import { analyzeSkillGap } from '../services/skillGapService.js';
import { getRecommendationsForStudent } from '../services/recommendationEngine.js';

/**
 * Controlled AI Tools
 * Enforces authenticated identity, authorization, ownership, and input boundaries.
 */

export const executeControlledTool = async (toolName, args, userContext) => {
  if (!userContext || !userContext.id) {
    throw new Error('Authentication required for AI tool execution.');
  }

  switch (toolName) {
    case 'searchInternships': {
      const { keyword, workMode } = args || {};
      const filter = {
        status: 'PUBLISHED',
        applicationDeadline: { $gte: new Date() }
      };
      if (workMode && ['REMOTE', 'HYBRID', 'ONSITE'].includes(workMode)) {
        filter.workMode = workMode;
      }
      if (keyword) {
        filter.$or = [
          { title: { $regex: keyword, $options: 'i' } },
          { requiredSkills: { $in: [new RegExp(keyword, 'i')] } }
        ];
      }
      const results = await Internship.find(filter)
        .populate('companyId', 'name location industry')
        .limit(5)
        .select('title description requiredSkills location workMode stipend applicationDeadline');
      return results;
    }

    case 'getStudentProfile': {
      // Identity isolation: Only return the calling student's profile!
      const user = await User.findById(userContext.id).select('name email profile');
      return user;
    }

    case 'getInternshipDetails': {
      const { internshipId } = args || {};
      if (!internshipId) throw new Error('internshipId is required');
      const item = await Internship.findOne({ _id: internshipId, status: 'PUBLISHED' })
        .populate('companyId', 'name description location website');
      return item;
    }

    case 'analyzeSkillGap': {
      const { internshipId } = args || {};
      const user = await User.findById(userContext.id);
      const studentSkills = user?.profile?.skills || [];
      const item = await Internship.findById(internshipId);
      if (!item) throw new Error('Internship not found.');
      return await analyzeSkillGap(studentSkills, item.requiredSkills, item.title);
    }

    case 'getRecommendations': {
      return await getRecommendationsForStudent(userContext.id, 5);
    }

    case 'createCareerPlan': {
      const { targetRole, milestones, targetSkills } = args || {};
      if (!targetRole) throw new Error('targetRole is required');
      const user = await User.findById(userContext.id);
      const plan = await CareerPlan.create({
        userId: userContext.id,
        targetRole,
        currentSkills: user?.profile?.skills || [],
        targetSkills: targetSkills || [],
        milestones: milestones || [
          { title: 'Core Foundations', description: `Master fundamental tools for ${targetRole}`, targetWeeks: 4, completed: false },
          { title: 'Portfolio Project', description: 'Build and deploy a full-stack project demonstrating key competencies', targetWeeks: 4, completed: false },
          { title: 'Mock Interviews & Resume Polishing', description: 'Practice role-specific interview questions and tailor applications', targetWeeks: 2, completed: false }
        ]
      });
      return plan;
    }

    default:
      throw new Error(`Unrecognized controlled tool: ${toolName}`);
  }
};

export default {
  executeControlledTool
};
