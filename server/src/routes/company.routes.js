import { Router } from 'express';
import companyController from '../controllers/company.controller.js';
import internshipController from '../controllers/internship.controller.js';
import applicationController from '../controllers/application.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createInternshipSchema,
  updateInternshipSchema,
  updateStatusSchema as updateInternshipStatusSchema
} from '../validators/internship.validator.js';
import {
  updateStatusSchema as updateApplicationStatusSchema,
  scheduleInterviewSchema
} from '../validators/application.validator.js';

const router = Router();

// Protect all company routes
router.use(authenticate, authorize('COMPANY', 'ADMIN'));

// Profile & Dashboard
router.get('/profile', companyController.getProfile);
router.patch('/profile', companyController.updateProfile);
router.get('/dashboard', companyController.getDashboard);

// Internships
router.post('/internships', validate(createInternshipSchema), internshipController.createInternship);
router.get('/internships', internshipController.getCompanyInternships);
router.get('/internships/:id', internshipController.getCompanyInternshipById);
router.patch('/internships/:id', validate(updateInternshipSchema), internshipController.updateInternship);
router.delete('/internships/:id', internshipController.deleteInternship);
router.patch('/internships/:id/status', validate(updateInternshipStatusSchema), internshipController.updateInternshipStatus);

// Applications
router.get('/applications', applicationController.getCompanyApplications);
router.get('/applications/:id', applicationController.getCompanyApplicationById);
router.patch('/applications/:id/status', validate(updateApplicationStatusSchema), applicationController.updateStatus);
router.post('/applications/:id/interview', validate(scheduleInterviewSchema), applicationController.scheduleInterview);

export default router;
