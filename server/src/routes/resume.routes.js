import { Router } from 'express';
import resumeController from '../controllers/resume.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadResumeMiddleware } from '../utils/fileStorage.js';

const router = Router();

router.use(authenticate, authorize('STUDENT', 'ADMIN'));

router.post('/', uploadResumeMiddleware, resumeController.uploadResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResumeById);
router.patch('/:id/primary', resumeController.setPrimary);
router.delete('/:id', resumeController.deleteResume);

export default router;
