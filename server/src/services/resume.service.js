import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { extractTextFromFile } from '../utils/textExtractor.js';
import { analyzeResume } from '../ai/services/resumeAnalyzer.js';
import { deleteFile } from '../utils/fileStorage.js';
import { AppError } from '../middleware/errorHandler.js';

export const uploadAndAnalyzeResume = async (userId, file) => {
  if (!file) throw new AppError('Resume file is required.', 400);

  // Extract text from uploaded document
  const rawText = await extractTextFromFile(file.path, file.mimetype);

  // Run AI / NLP analysis
  const analysis = await analyzeResume(rawText);

  // Check if student has any existing resumes
  const existingCount = await Resume.countDocuments({ userId });
  const isPrimary = existingCount === 0;

  const resume = await Resume.create({
    userId,
    fileName: file.originalname,
    fileUrl: `/uploads/resumes/${file.filename}`,
    fileType: file.mimetype,
    fileSize: file.size,
    isPrimary,
    parsedContent: analysis
  });

  // Automatically sync skills to student profile if student profile has few skills
  if (analysis.skills && analysis.skills.length > 0) {
    const user = await User.findById(userId);
    if (user) {
      const mergedSkills = Array.from(new Set([...(user.profile?.skills || []), ...analysis.skills]));
      user.profile.skills = mergedSkills;
      await user.save();
    }
  }

  return resume;
};

export const getStudentResumes = async (userId) => {
  return await Resume.find({ userId }).sort({ createdAt: -1 });
};

export const getResumeById = async (userId, resumeId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) throw new AppError('Resume not found or unauthorized.', 404);
  return resume;
};

export const setPrimaryResume = async (userId, resumeId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) throw new AppError('Resume not found or unauthorized.', 404);

  // Unset all others
  await Resume.updateMany({ userId }, { isPrimary: false });

  resume.isPrimary = true;
  await resume.save();
  return resume;
};

export const deleteResume = async (userId, resumeId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) throw new AppError('Resume not found or unauthorized.', 404);

  // Delete physical file
  if (resume.fileUrl) {
    deleteFile(resume.fileUrl.replace('/uploads/resumes/', ''));
  }

  await resume.deleteOne();

  // If was primary, set another as primary if exists
  if (resume.isPrimary) {
    const another = await Resume.findOne({ userId });
    if (another) {
      another.isPrimary = true;
      await another.save();
    }
  }

  return { message: 'Resume deleted successfully.' };
};

export default {
  uploadAndAnalyzeResume,
  getStudentResumes,
  getResumeById,
  setPrimaryResume,
  deleteResume
};
