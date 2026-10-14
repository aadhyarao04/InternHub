import { Router } from 'express';
import internshipController from '../controllers/internship.controller.js';
import applicationController from '../controllers/application.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { applySchema } from '../validators/application.validator.js';

const router = Router();

// Public browse & view
router.get('/', internshipController.getPublicInternships);
router.get('/:id', internshipController.getPublicInternshipById);

// Student apply
router.post(
  '/:internshipId/apply',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  validate(applySchema),
  applicationController.apply
);

export default router;
