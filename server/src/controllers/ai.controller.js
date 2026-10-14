import careerCopilot from '../ai/agents/careerCopilot.js';
import skillGapService from '../ai/services/skillGapService.js';
import recommendationEngine from '../ai/services/recommendationEngine.js';
import ragService from '../ai/rag/ragService.js';
import interviewSimulator from '../ai/services/interviewSimulator.js';
import careerRoadmapService from '../ai/services/careerRoadmapService.js';
import { generateEmbedding, cosineSimilarity } from '../ai/embeddings/embeddingService.js';
import Internship from '../models/Internship.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';

export const chatWithCopilot = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    if (!message) throw new AppError('Message text is required.', 400);

    const result = await careerCopilot.handleCopilotChat(
      req.user.id,
      req.user,
      message,
      conversationId
    );
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const data = await careerCopilot.getUserConversations(req.user.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getConversationHistory = async (req, res, next) => {
  try {
    const data = await careerCopilot.getConversationHistory(req.user.id, req.params.id);
    if (!data) throw new AppError('Conversation not found.', 404);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const analyzeSkillGap = async (req, res, next) => {
  try {
    const { internshipId } = req.body;
    if (!internshipId) throw new AppError('internshipId is required.', 400);

    const user = await User.findById(req.user.id);
    const internship = await Internship.findById(internshipId);
    if (!internship) throw new AppError('Internship not found.', 404);

    const result = await skillGapService.analyzeSkillGap(
      user?.profile?.skills || [],
      internship.requiredSkills || [],
      internship.title
    );
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const data = await recommendationEngine.getRecommendationsForStudent(req.user.id, 8);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const semanticSearchInternships = async (req, res, next) => {
  try {
    const { query, workMode, minStipend, limit = 10 } = req.body;
    if (!query) throw new AppError('Search query is required.', 400);

    const queryEmbedding = await generateEmbedding(query);

    const filter = {
      status: 'PUBLISHED',
      applicationDeadline: { $gte: new Date() }
    };
    if (workMode && ['REMOTE', 'HYBRID', 'ONSITE'].includes(workMode)) {
      filter.workMode = workMode;
    }
    if (minStipend) {
      filter['stipend.amount'] = { $gte: Number(minStipend) };
    }

    const internships = await Internship.find(filter)
      .populate('companyId', 'name logoUrl industry location verificationStatus')
      .lean();

    const scored = await Promise.all(
      internships.map(async (item) => {
        let itemEmbedding = item.embeddings;
        if (!itemEmbedding || itemEmbedding.length === 0) {
          itemEmbedding = await generateEmbedding(`${item.title} ${item.description} ${(item.requiredSkills || []).join(' ')}`);
        }
        const similarity = cosineSimilarity(queryEmbedding, itemEmbedding);
        return {
          ...item,
          similarityScore: Math.round(similarity * 100)
        };
      })
    );

    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    return sendSuccess(res, scored.slice(0, parseInt(limit, 10)));
  } catch (error) {
    next(error);
  }
};

export const queryRAG = async (req, res, next) => {
  try {
    const { question, category } = req.body;
    if (!question) throw new AppError('Question is required.', 400);

    const result = await ragService.answerWithRAG(question, category);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const startInterview = async (req, res, next) => {
  try {
    const { targetRole, difficulty } = req.body;
    if (!targetRole) throw new AppError('targetRole is required.', 400);

    const session = await interviewSimulator.startSession(req.user.id, targetRole, difficulty);
    return sendSuccess(res, session, 201);
  } catch (error) {
    next(error);
  }
};

export const submitInterviewAnswer = async (req, res, next) => {
  try {
    const { sessionId, questionId, answerText } = req.body;
    if (!sessionId || !questionId || !answerText) {
      throw new AppError('sessionId, questionId, and answerText are required.', 400);
    }

    const session = await interviewSimulator.submitAnswer(req.user.id, sessionId, questionId, answerText);
    return sendSuccess(res, session);
  } catch (error) {
    next(error);
  }
};

export const getInterviewSessions = async (req, res, next) => {
  try {
    const data = await interviewSimulator.getSessionHistory(req.user.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getInterviewSessionById = async (req, res, next) => {
  try {
    const data = await interviewSimulator.getSessionById(req.user.id, req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const generateRoadmap = async (req, res, next) => {
  try {
    const { targetRole, timelineWeeks } = req.body;
    if (!targetRole) throw new AppError('targetRole is required.', 400);

    const plan = await careerRoadmapService.generateRoadmap(req.user.id, targetRole, timelineWeeks);
    return sendSuccess(res, plan, 201);
  } catch (error) {
    next(error);
  }
};

export const getRoadmaps = async (req, res, next) => {
  try {
    const data = await careerRoadmapService.getStudentPlans(req.user.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const toggleMilestone = async (req, res, next) => {
  try {
    const data = await careerRoadmapService.toggleMilestone(req.user.id, req.params.planId, req.params.milestoneId);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export default {
  chatWithCopilot,
  getConversations,
  getConversationHistory,
  analyzeSkillGap,
  getRecommendations,
  semanticSearchInternships,
  queryRAG,
  startInterview,
  submitInterviewAnswer,
  getInterviewSessions,
  getInterviewSessionById,
  generateRoadmap,
  getRoadmaps,
  toggleMilestone
};
