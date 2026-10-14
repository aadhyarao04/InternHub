import internshipService from '../services/internship.service.js';
import { sendSuccess } from '../utils/response.js';

export const createInternship = async (req, res, next) => {
  try {
    const data = await internshipService.createInternship(req.user.companyId, req.body);
    return sendSuccess(res, data, 201);
  } catch (error) {
    next(error);
  }
};

export const getCompanyInternships = async (req, res, next) => {
  try {
    const data = await internshipService.getCompanyInternships(req.user.companyId, req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getCompanyInternshipById = async (req, res, next) => {
  try {
    const data = await internshipService.getCompanyInternshipById(req.user.companyId, req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateInternship = async (req, res, next) => {
  try {
    const data = await internshipService.updateInternship(req.user.companyId, req.params.id, req.body);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateInternshipStatus = async (req, res, next) => {
  try {
    const data = await internshipService.updateInternshipStatus(req.user.companyId, req.params.id, req.body.status);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const deleteInternship = async (req, res, next) => {
  try {
    const data = await internshipService.deleteInternship(req.user.companyId, req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getPublicInternships = async (req, res, next) => {
  try {
    const data = await internshipService.getPublicInternships(req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getPublicInternshipById = async (req, res, next) => {
  try {
    const data = await internshipService.getPublicInternshipById(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export default {
  createInternship,
  getCompanyInternships,
  getCompanyInternshipById,
  updateInternship,
  updateInternshipStatus,
  deleteInternship,
  getPublicInternships,
  getPublicInternshipById
};
