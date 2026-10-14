import Company from '../models/Company.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import { AppError } from '../middleware/errorHandler.js';

export const getProfile = async (companyId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new AppError('Company profile not found.', 404);
  return company;
};

export const updateProfile = async (companyId, data) => {
  const company = await Company.findById(companyId);
  if (!company) throw new AppError('Company profile not found.', 404);

  const allowed = ['name', 'description', 'website', 'logoUrl', 'industry', 'location', 'companySize'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      company[key] = data[key];
    }
  }

  await company.save();
  return company;
};

export const getDashboardStats = async (companyId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new AppError('Company not found.', 404);

  // Internships stats
  const totalInternships = await Internship.countDocuments({ companyId });
  const publishedInternships = await Internship.countDocuments({ companyId, status: 'PUBLISHED' });
  const draftInternships = await Internship.countDocuments({ companyId, status: 'DRAFT' });
  const closedInternships = await Internship.countDocuments({ companyId, status: 'CLOSED' });

  // Applications stats
  const companyInternships = await Internship.find({ companyId }).select('_id');
  const internshipIds = companyInternships.map(i => i._id);

  const totalApplications = await Application.countDocuments({ internshipId: { $in: internshipIds } });
  const appliedCount = await Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'APPLIED' });
  const underReviewCount = await Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'UNDER_REVIEW' });
  const shortlistedCount = await Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'SHORTLISTED' });
  const interviewCount = await Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'INTERVIEW' });
  const selectedCount = await Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'SELECTED' });
  const rejectedCount = await Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'REJECTED' });

  // Upcoming interviews
  const upcomingInterviews = await Interview.find({
    companyId,
    status: 'SCHEDULED',
    scheduledAt: { $gte: new Date() }
  })
    .populate('studentId', 'name email profile.phone')
    .populate('internshipId', 'title')
    .sort({ scheduledAt: 1 })
    .limit(5);

  // Recent applicants
  const recentApplicants = await Application.find({ internshipId: { $in: internshipIds } })
    .populate('studentId', 'name email profile.headline profile.skills profile.avatarUrl')
    .populate('internshipId', 'title')
    .populate('resumeId', 'fileName fileUrl parsedContent.atsScore')
    .sort({ appliedAt: -1 })
    .limit(6);

  return {
    company: {
      id: company._id,
      name: company.name,
      verificationStatus: company.verificationStatus,
      logoUrl: company.logoUrl,
      industry: company.industry,
      location: company.location
    },
    metrics: {
      internships: {
        total: totalInternships,
        published: publishedInternships,
        drafts: draftInternships,
        closed: closedInternships
      },
      applications: {
        total: totalApplications,
        applied: appliedCount,
        underReview: underReviewCount,
        shortlisted: shortlistedCount,
        interviews: interviewCount,
        selected: selectedCount,
        rejected: rejectedCount
      }
    },
    upcomingInterviews,
    recentApplicants
  };
};

export default {
  getProfile,
  updateProfile,
  getDashboardStats
};
