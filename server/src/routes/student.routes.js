import { Router } from 'express';
import studentController from '../controllers/student.controller.js';
import applicationController from '../controllers/application.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  updateProfileSchema,
  updateSkillsSchema,
  educationSchema,
  projectSchema,
  certificationSchema,
  careerPreferencesSchema
} from '../validators/student.validator.js';

const router = Router();

// Protect all student routes
router.use(authenticate, authorize('STUDENT', 'ADMIN'));

// Profile
router.get('/me/profile', studentController.getProfile);
router.patch('/me/profile', validate(updateProfileSchema), studentController.updateProfile);

// Skills
router.patch('/me/skills', validate(updateSkillsSchema), studentController.updateSkills);

// Education
router.post('/me/education', validate(educationSchema), studentController.addEducation);
router.patch('/me/education/:id', validate(educationSchema), studentController.updateEducation);
router.delete('/me/education/:id', studentController.deleteEducation);

// Projects
router.post('/me/projects', validate(projectSchema), studentController.addProject);
router.patch('/me/projects/:id', validate(projectSchema), studentController.updateProject);
router.delete('/me/projects/:id', studentController.deleteProject);

// Certifications
router.post('/me/certifications', validate(certificationSchema), studentController.addCertification);
router.patch('/me/certifications/:id', validate(certificationSchema), studentController.updateCertification);
router.delete('/me/certifications/:id', studentController.deleteCertification);

// Career Preferences
router.patch('/me/career-preferences', validate(careerPreferencesSchema), studentController.updateCareerPreferences);

// Applications
router.get('/me/applications', applicationController.getStudentApplications);
router.get('/me/applications/:id', applicationController.getStudentApplicationById);
router.patch('/me/applications/:id/withdraw', applicationController.withdraw);

export default router;
