import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import Resume from '../models/Resume.js';
import Interview from '../models/Interview.js';
import Company from '../models/Company.js';
import { createNotification } from './notification.service.js';
import { AppError } from '../middleware/errorHandler.js';

export const apply = async (studentId, internshipId, { resumeId, coverLetter }) => {
  const internship = await Internship.findById(internshipId).populate('companyId');
  if (!internship) throw new AppError('Internship not found.', 404);

  if (internship.status !== 'PUBLISHED') {
    throw new AppError('This internship is not currently accepting applications.', 400);
  }

  if (new Date() > new Date(internship.applicationDeadline)) {
    throw new AppError('The application deadline for this internship has expired.', 400);
  }

  // Duplicate application prevention
  const existing = await Application.findOne({ studentId, internshipId });
  if (existing) {
    throw new AppError('You have already applied for this internship opportunity.', 409);
  }

  // Ownership verification for resume
  const resume = await Resume.findOne({ _id: resumeId, userId: studentId });
  if (!resume) {
    throw new AppError('Selected resume not found or does not belong to your account.', 403);
  }

  const application = await Application.create({
    studentId,
    internshipId,
    resumeId,
    coverLetter: coverLetter || '',
    status: 'APPLIED',
    statusHistory: [{
      status: 'APPLIED',
      changedAt: new Date(),
      note: 'Application submitted by candidate.'
    }],
    appliedAt: new Date()
  });

  // Notify company owner
  if (internship.companyId?.ownerId) {
    await createNotification({
      userId: internship.companyId.ownerId,
      type: 'APPLICATION_SUBMITTED',
      title: 'New Applicant Received',
      message: `A candidate has submitted an application for "${internship.title}".`,
      relatedEntity: { type: 'Application', id: application._id }
    });
  }

  // Notify student
  await createNotification({
    userId: studentId,
    type: 'APPLICATION_SUBMITTED',
    title: 'Application Submitted Successfully',
    message: `Your application for "${internship.title}" at ${internship.companyId?.name || 'the company'} was received.`,
    relatedEntity: { type: 'Application', id: application._id }
  });

  return application;
};

export const getStudentApplications = async (studentId, query = {}) => {
  const { status, page = 1, limit = 10 } = query;
  const filter = { studentId };
  if (status) filter.status = status;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Application.countDocuments(filter);

  const applications = await Application.find(filter)
    .populate({
      path: 'internshipId',
      select: 'title location workMode stipend applicationDeadline status',
      populate: { path: 'companyId', select: 'name logoUrl industry' }
    })
    .populate('resumeId', 'fileName fileUrl parsedContent')
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

export const getStudentApplicationById = async (studentId, applicationId) => {
  const application = await Application.findOne({ _id: applicationId, studentId })
    .populate({
      path: 'internshipId',
      populate: { path: 'companyId', select: 'name logoUrl industry website location' }
    })
    .populate('resumeId');

  if (!application) throw new AppError('Application not found or unauthorized.', 404);

  // Check if an interview is scheduled
  const interview = await Interview.findOne({ applicationId });

  return { application, interview };
};

export const withdrawApplication = async (studentId, applicationId, note = '') => {
  const application = await Application.findOne({ _id: applicationId, studentId })
    .populate({ path: 'internshipId', populate: { path: 'companyId' } });

  if (!application) throw new AppError('Application not found or unauthorized.', 404);

  if (['WITHDRAWN', 'REJECTED', 'SELECTED'].includes(application.status)) {
    throw new AppError(`Cannot withdraw application in status ${application.status}.`, 400);
  }

  application.status = 'WITHDRAWN';
  application.statusHistory.push({
    status: 'WITHDRAWN',
    changedAt: new Date(),
    note: note || 'Application withdrawn by candidate.'
  });

  await application.save();

  // Notify company
  if (application.internshipId?.companyId?.ownerId) {
    await createNotification({
      userId: application.internshipId.companyId.ownerId,
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Applicant Withdrew Application',
      message: `A candidate withdrew their application for "${application.internshipId.title}".`,
      relatedEntity: { type: 'Application', id: application._id }
    });
  }

  return application;
};

export const getCompanyApplications = async (companyId, query = {}) => {
  const { status, internshipId, page = 1, limit = 15 } = query;

  // Find all internships for this company
  const companyInternships = await Internship.find({ companyId }).select('_id');
  const internshipIds = companyInternships.map(i => i._id);

  const filter = {
    internshipId: internshipId ? internshipId : { $in: internshipIds }
  };
  if (status) filter.status = status;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Application.countDocuments(filter);

  const applications = await Application.find(filter)
    .populate('studentId', 'name email profile')
    .populate('internshipId', 'title location workMode applicationDeadline')
    .populate('resumeId', 'fileName fileUrl parsedContent')
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

export const getCompanyApplicationById = async (companyId, applicationId) => {
  const application = await Application.findById(applicationId)
    .populate('studentId', 'name email profile')
    .populate('internshipId')
    .populate('resumeId');

  if (!application) throw new AppError('Application not found.', 404);

  // Enforce company ownership!
  if (application.internshipId.companyId.toString() !== companyId.toString()) {
    throw new AppError('Unauthorized access to another company\'s applicant.', 403);
  }

  const interview = await Interview.findOne({ applicationId });

  return { application, interview };
};

export const updateApplicationStatus = async (companyId, applicationId, status, note = '') => {
  const application = await Application.findById(applicationId)
    .populate('internshipId', 'title companyId');

  if (!application) throw new AppError('Application not found.', 404);

  if (application.internshipId.companyId.toString() !== companyId.toString()) {
    throw new AppError('Unauthorized access to another company\'s applicant.', 403);
  }

  application.status = status;
  application.statusHistory.push({
    status,
    changedAt: new Date(),
    note: note || `Application status changed to ${status}.`
  });

  await application.save();

  // Notify candidate
  await createNotification({
    userId: application.studentId,
    type: 'APPLICATION_STATUS_CHANGED',
    title: 'Application Status Update',
    message: `Your application for "${application.internshipId.title}" is now: ${status}. ${note ? `Note: "${note}"` : ''}`,
    relatedEntity: { type: 'Application', id: application._id }
  });

  return application;
};

export const scheduleInterview = async (companyId, applicationId, { scheduledAt, durationMinutes = 45, locationOrLink, notes }) => {
  const application = await Application.findById(applicationId)
    .populate('internshipId', 'title companyId');

  if (!application) throw new AppError('Application not found.', 404);

  if (application.internshipId.companyId.toString() !== companyId.toString()) {
    throw new AppError('Unauthorized access.', 403);
  }

  const interview = await Interview.create({
    applicationId: application._id,
    studentId: application.studentId,
    companyId,
    internshipId: application.internshipId._id,
    scheduledAt: new Date(scheduledAt),
    durationMinutes,
    locationOrLink,
    notes: notes || '',
    status: 'SCHEDULED'
  });

  // Update application status to INTERVIEW
  application.status = 'INTERVIEW';
  application.statusHistory.push({
    status: 'INTERVIEW',
    changedAt: new Date(),
    note: `Interview scheduled for ${new Date(scheduledAt).toLocaleString()}.`
  });
  await application.save();

  // Notify student
  await createNotification({
    userId: application.studentId,
    type: 'INTERVIEW_SCHEDULED',
    title: 'Interview Scheduled!',
    message: `An interview has been scheduled for "${application.internshipId.title}" on ${new Date(scheduledAt).toLocaleString()}.\nLink/Location: ${locationOrLink}`,
    relatedEntity: { type: 'Interview', id: interview._id }
  });

  return { application, interview };
};

export default {
  apply,
  getStudentApplications,
  getStudentApplicationById,
  withdrawApplication,
  getCompanyApplications,
  getCompanyApplicationById,
  updateApplicationStatus,
  scheduleInterview
};
