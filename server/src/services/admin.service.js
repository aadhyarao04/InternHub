import User from '../models/User.js';
import Company from '../models/Company.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import { createNotification } from './notification.service.js';
import { AppError } from '../middleware/errorHandler.js';

export const getDashboardStats = async () => {
  const totalStudents = await User.countDocuments({ role: 'STUDENT' });
  const totalCompanies = await Company.countDocuments();
  const verifiedCompanies = await Company.countDocuments({ verificationStatus: 'VERIFIED' });
  const pendingCompanies = await Company.countDocuments({ verificationStatus: 'PENDING' });
  const rejectedCompanies = await Company.countDocuments({ verificationStatus: 'REJECTED' });

  const totalInternships = await Internship.countDocuments();
  const publishedInternships = await Internship.countDocuments({ status: 'PUBLISHED' });
  const closedInternships = await Internship.countDocuments({ status: 'CLOSED' });
  const draftInternships = await Internship.countDocuments({ status: 'DRAFT' });

  const totalApplications = await Application.countDocuments();
  const selectedApplications = await Application.countDocuments({ status: 'SELECTED' });
  const rejectedApplications = await Application.countDocuments({ status: 'REJECTED' });
  const interviewApplications = await Application.countDocuments({ status: 'INTERVIEW' });

  // Recent activities
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role isActive createdAt');
  const pendingVerifications = await Company.find({ verificationStatus: 'PENDING' })
    .populate('ownerId', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    metrics: {
      users: {
        totalStudents,
        totalCompanies
      },
      companies: {
        total: totalCompanies,
        verified: verifiedCompanies,
        pending: pendingCompanies,
        rejected: rejectedCompanies
      },
      internships: {
        total: totalInternships,
        published: publishedInternships,
        closed: closedInternships,
        drafts: draftInternships
      },
      applications: {
        total: totalApplications,
        selected: selectedApplications,
        rejected: rejectedApplications,
        interviews: interviewApplications
      }
    },
    recentUsers,
    pendingVerifications
  };
};

export const getUsers = async (query = {}) => {
  const { role, isActive, search, page = 1, limit = 15 } = query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .select('name email role isActive lastLoginAt createdAt');

  return {
    users,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);
  let company = null;
  if (user.role === 'COMPANY') {
    company = await Company.findOne({ ownerId: user._id });
  }
  return { user, company };
};

export const updateUserStatus = async (userId, isActive) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  user.isActive = isActive;
  await user.save();

  await createNotification({
    userId: user._id,
    type: 'SYSTEM',
    title: 'Account Status Updated',
    message: isActive ? 'Your account has been reactivated by administrators.' : 'Your account has been deactivated by administrators.'
  });

  return user;
};

export const getCompanies = async (query = {}) => {
  const { verificationStatus, search, page = 1, limit = 15 } = query;
  const filter = {};
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { industry: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Company.countDocuments(filter);
  const companies = await Company.find(filter)
    .populate('ownerId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  return {
    companies,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  };
};

export const getCompanyById = async (companyId) => {
  const company = await Company.findById(companyId).populate('ownerId', 'name email');
  if (!company) throw new AppError('Company not found.', 404);
  return company;
};

export const updateCompanyVerification = async (companyId, verificationStatus) => {
  const company = await Company.findById(companyId);
  if (!company) throw new AppError('Company not found.', 404);

  company.verificationStatus = verificationStatus;
  await company.save();

  // Notify company owner
  await createNotification({
    userId: company.ownerId,
    type: 'SYSTEM',
    title: 'Company Verification Status Updated',
    message: verificationStatus === 'VERIFIED'
      ? `Congratulations! ${company.name} has been verified by the administrator. You can now publish active internship listings.`
      : `Your company verification status is now: ${verificationStatus}.`
  });

  return company;
};

export const getInternships = async (query = {}) => {
  const { status, search, page = 1, limit = 15 } = query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Internship.countDocuments(filter);
  const internships = await Internship.find(filter)
    .populate('companyId', 'name logoUrl verificationStatus')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  return {
    internships,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  };
};

export const updateInternshipStatus = async (internshipId, status) => {
  const internship = await Internship.findById(internshipId);
  if (!internship) throw new AppError('Internship not found.', 404);

  internship.status = status;
  await internship.save();
  return internship;
};

export const getApplications = async (query = {}) => {
  const { status, page = 1, limit = 15 } = query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Application.countDocuments(filter);
  const applications = await Application.find(filter)
    .populate('studentId', 'name email')
    .populate({
      path: 'internshipId',
      select: 'title location workMode',
      populate: { path: 'companyId', select: 'name' }
    })
    .populate('resumeId', 'fileName fileUrl')
    .sort({ appliedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  return {
    applications,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  };
};

export default {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserStatus,
  getCompanies,
  getCompanyById,
  updateCompanyVerification,
  getInternships,
  updateInternshipStatus,
  getApplications
};
