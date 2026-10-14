import applicationService from '../services/application.service.js';
import { sendSuccess } from '../utils/response.js';

export const apply = async (req, res, next) => {
  try {
    const data = await applicationService.apply(req.user.id, req.params.internshipId, req.body);
    return sendSuccess(res, data, 201);
  } catch (error) {
    next(error);
  }
};

export const getStudentApplications = async (req, res, next) => {
  try {
    const data = await applicationService.getStudentApplications(req.user.id, req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getStudentApplicationById = async (req, res, next) => {
  try {
    const data = await applicationService.getStudentApplicationById(req.user.id, req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const withdraw = async (req, res, next) => {
  try {
    const data = await applicationService.withdrawApplication(req.user.id, req.params.id, req.body.note);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getCompanyApplications = async (req, res, next) => {
  try {
    const data = await applicationService.getCompanyApplications(req.user.companyId, req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getCompanyApplicationById = async (req, res, next) => {
  try {
    const data = await applicationService.getCompanyApplicationById(req.user.companyId, req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const data = await applicationService.updateApplicationStatus(
      req.user.companyId,
      req.params.id,
      req.body.status,
      req.body.note
    );
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const scheduleInterview = async (req, res, next) => {
  try {
    const data = await applicationService.scheduleInterview(
      req.user.companyId,
      req.params.id,
      req.body
    );
    return sendSuccess(res, data, 201);
  } catch (error) {
    next(error);
  }
};

export default {
  apply,
  getStudentApplications,
  getStudentApplicationById,
  withdraw,
  getCompanyApplications,
  getCompanyApplicationById,
  updateStatus,
  scheduleInterview
};
