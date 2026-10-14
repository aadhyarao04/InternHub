import companyService from '../services/company.service.js';
import { sendSuccess } from '../utils/response.js';

export const getProfile = async (req, res, next) => {
  try {
    const data = await companyService.getProfile(req.user.companyId);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const data = await companyService.updateProfile(req.user.companyId, req.body);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const data = await companyService.getDashboardStats(req.user.companyId);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
  getDashboard
};
