import { Router } from 'express';
import aiController from '../controllers/ai.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Protect AI operations for authenticated students and admins
router.use(authenticate, authorize('STUDENT', 'ADMIN'));

// Career Copilot
router.post('/copilot/chat', aiController.chatWithCopilot);
router.get('/copilot/conversations', aiController.getConversations);
router.get('/copilot/conversations/:id', aiController.getConversationHistory);

// Intelligence Services
router.post('/skill-gap', aiController.analyzeSkillGap);
router.get('/recommendations', aiController.getRecommendations);
router.post('/semantic-search', aiController.semanticSearchInternships);
router.post('/rag/query', aiController.queryRAG);

// Interview Simulator
router.post('/interview/start', aiController.startInterview);
router.post('/interview/answer', aiController.submitInterviewAnswer);
router.get('/interview/sessions', aiController.getInterviewSessions);
router.get('/interview/sessions/:id', aiController.getInterviewSessionById);

// Career Roadmap
router.post('/roadmap/generate', aiController.generateRoadmap);
router.get('/roadmap/plans', aiController.getRoadmaps);
router.patch('/roadmap/plans/:planId/milestones/:milestoneId/toggle', aiController.toggleMilestone);

export default router;
