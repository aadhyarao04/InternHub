import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Strict Admin authorization
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/status', adminController.updateUserStatus);

// Companies
router.get('/companies', adminController.getCompanies);
router.get('/companies/:id', adminController.getCompanyById);
router.patch('/companies/:id/verification', adminController.updateCompanyVerification);

// Internships
router.get('/internships', adminController.getInternships);
router.patch('/internships/:id/status', adminController.updateInternshipStatus);

// Applications
router.get('/applications', adminController.getApplications);

export default router;
