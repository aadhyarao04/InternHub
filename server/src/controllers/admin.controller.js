import adminService from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardStats();
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsers(req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const data = await adminService.getUserById(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const data = await adminService.updateUserStatus(req.params.id, req.body.isActive);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const data = await adminService.getCompanies(req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const data = await adminService.getCompanyById(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateCompanyVerification = async (req, res, next) => {
  try {
    const data = await adminService.updateCompanyVerification(req.params.id, req.body.verificationStatus);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getInternships = async (req, res, next) => {
  try {
    const data = await adminService.getInternships(req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateInternshipStatus = async (req, res, next) => {
  try {
    const data = await adminService.updateInternshipStatus(req.params.id, req.body.status);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const data = await adminService.getApplications(req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboard,
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
