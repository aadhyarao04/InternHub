import resumeService from '../services/resume.service.js';
import { sendSuccess } from '../utils/response.js';

export const uploadResume = async (req, res, next) => {
  try {
    const data = await resumeService.uploadAndAnalyzeResume(req.user.id, req.file);
    return sendSuccess(res, data, 201);
  } catch (error) {
    next(error);
  }
};

export const getResumes = async (req, res, next) => {
  try {
    const data = await resumeService.getStudentResumes(req.user.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const data = await resumeService.getResumeById(req.user.id, req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const setPrimary = async (req, res, next) => {
  try {
    const data = await resumeService.setPrimaryResume(req.user.id, req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const data = await resumeService.deleteResume(req.user.id, req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export default {
  uploadResume,
  getResumes,
  getResumeById,
  setPrimary,
  deleteResume
};
