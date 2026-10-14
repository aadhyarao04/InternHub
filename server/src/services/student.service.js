import User from '../models/User.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import { AppError } from '../middleware/errorHandler.js';

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  const applicationsCount = await Application.countDocuments({ studentId: userId });
  const resumesCount = await Resume.countDocuments({ userId });
  const primaryResume = await Resume.findOne({ userId, isPrimary: true });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      isActive: user.isActive,
      createdAt: user.createdAt
    },
    stats: {
      applicationsCount,
      resumesCount,
      hasPrimaryResume: !!primaryResume
    }
  };
};

export const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  if (data.name) user.name = data.name;
  if (data.avatarUrl !== undefined) user.profile.avatarUrl = data.avatarUrl;
  if (data.headline !== undefined) user.profile.headline = data.headline;
  if (data.bio !== undefined) user.profile.bio = data.bio;
  if (data.phone !== undefined) user.profile.phone = data.phone;
  if (data.location !== undefined) user.profile.location = data.location;

  await user.save();
  return user.profile;
};

export const updateSkills = async (userId, skills) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  // Normalize skill names
  const normalized = Array.from(new Set(skills.map(s => s.trim()))).filter(Boolean);
  user.profile.skills = normalized;
  await user.save();
  return user.profile.skills;
};

export const addEducation = async (userId, eduData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  user.profile.education.push(eduData);
  await user.save();
  return user.profile.education;
};

export const updateEducation = async (userId, eduId, eduData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  const edu = user.profile.education.id(eduId);
  if (!edu) throw new AppError('Education entry not found.', 404);

  Object.assign(edu, eduData);
  await user.save();
  return user.profile.education;
};

export const deleteEducation = async (userId, eduId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  user.profile.education.pull(eduId);
  await user.save();
  return user.profile.education;
};

export const addProject = async (userId, projData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  user.profile.projects.push(projData);
  await user.save();
  return user.profile.projects;
};

export const updateProject = async (userId, projId, projData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  const proj = user.profile.projects.id(projId);
  if (!proj) throw new AppError('Project entry not found.', 404);

  Object.assign(proj, projData);
  await user.save();
  return user.profile.projects;
};

export const deleteProject = async (userId, projId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  user.profile.projects.pull(projId);
  await user.save();
  return user.profile.projects;
};

export const addCertification = async (userId, certData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  user.profile.certifications.push(certData);
  await user.save();
  return user.profile.certifications;
};

export const updateCertification = async (userId, certId, certData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  const cert = user.profile.certifications.id(certId);
  if (!cert) throw new AppError('Certification entry not found.', 404);

  Object.assign(cert, certData);
  await user.save();
  return user.profile.certifications;
};

export const deleteCertification = async (userId, certId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  user.profile.certifications.pull(certId);
  await user.save();
  return user.profile.certifications;
};

export const updateCareerPreferences = async (userId, prefs) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Student not found.', 404);

  user.profile.careerPreferences = {
    ...user.profile.careerPreferences,
    ...prefs
  };
  await user.save();
  return user.profile.careerPreferences;
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
