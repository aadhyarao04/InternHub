import studentService from '../services/student.service.js';
import { sendSuccess } from '../utils/response.js';

export const getProfile = async (req, res, next) => {
  try {
    const data = await studentService.getProfile(req.user.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const data = await studentService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateSkills = async (req, res, next) => {
  try {
    const data = await studentService.updateSkills(req.user.id, req.body.skills);
    return sendSuccess(res, { skills: data });
  } catch (error) {
    next(error);
  }
};

export const addEducation = async (req, res, next) => {
  try {
    const data = await studentService.addEducation(req.user.id, req.body);
    return sendSuccess(res, { education: data }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateEducation = async (req, res, next) => {
  try {
    const data = await studentService.updateEducation(req.user.id, req.params.id, req.body);
    return sendSuccess(res, { education: data });
  } catch (error) {
    next(error);
  }
};

export const deleteEducation = async (req, res, next) => {
  try {
    const data = await studentService.deleteEducation(req.user.id, req.params.id);
    return sendSuccess(res, { education: data });
  } catch (error) {
    next(error);
  }
};

export const addProject = async (req, res, next) => {
  try {
    const data = await studentService.addProject(req.user.id, req.body);
    return sendSuccess(res, { projects: data }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const data = await studentService.updateProject(req.user.id, req.params.id, req.body);
    return sendSuccess(res, { projects: data });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const data = await studentService.deleteProject(req.user.id, req.params.id);
    return sendSuccess(res, { projects: data });
  } catch (error) {
    next(error);
  }
};

export const addCertification = async (req, res, next) => {
  try {
    const data = await studentService.addCertification(req.user.id, req.body);
    return sendSuccess(res, { certifications: data }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCertification = async (req, res, next) => {
  try {
    const data = await studentService.updateCertification(req.user.id, req.params.id, req.body);
    return sendSuccess(res, { certifications: data });
  } catch (error) {
    next(error);
  }
};

export const deleteCertification = async (req, res, next) => {
  try {
    const data = await studentService.deleteCertification(req.user.id, req.params.id);
    return sendSuccess(res, { certifications: data });
  } catch (error) {
    next(error);
  }
};

export const updateCareerPreferences = async (req, res, next) => {
  try {
    const data = await studentService.updateCareerPreferences(req.user.id, req.body);
    return sendSuccess(res, { careerPreferences: data });
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
  updateSkills,
  addEducation,
  updateEducation,
  deleteEducation,
  addProject,
  updateProject,
  deleteProject,
  addCertification,
  updateCertification,
  deleteCertification,
  updateCareerPreferences
};
