import authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getMe
};
