import Internship from '../models/Internship.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import { AppError } from '../middleware/errorHandler.js';

export const createInternship = async (companyId, data) => {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new AppError('Company profile not found.', 404);
  }

  // If user requests to publish immediately, verify company status
  if (data.status === 'PUBLISHED' && company.verificationStatus !== 'VERIFIED') {
    throw new AppError('Only verified companies may publish internships. You can save as DRAFT until administrative approval.', 403);
  }

  const internship = await Internship.create({
    ...data,
    companyId: company._id
  });

  return internship;
};

export const getCompanyInternships = async (companyId, query = {}) => {
  const { status, page = 1, limit = 10 } = query;
  const filter = { companyId };
  if (status) filter.status = status;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Internship.countDocuments(filter);

  const internships = await Internship.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();

  // Attach applicant counts for each internship
  const withCounts = await Promise.all(
    internships.map(async (item) => {
      const applicantCount = await Application.countDocuments({ internshipId: item._id });
      return { ...item, applicantCount };
    })
  );

  return {
    internships: withCounts,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  };
};

export const getCompanyInternshipById = async (companyId, internshipId) => {
  const internship = await Internship.findOne({ _id: internshipId, companyId }).lean();
  if (!internship) {
    throw new AppError('Internship not found or unauthorized access.', 404);
  }
  const applicantCount = await Application.countDocuments({ internshipId: internship._id });
  return { ...internship, applicantCount };
};

export const updateInternship = async (companyId, internshipId, data) => {
  const internship = await Internship.findOne({ _id: internshipId, companyId });
  if (!internship) {
    throw new AppError('Internship not found or unauthorized access.', 404);
  }

  if (data.status === 'PUBLISHED') {
    const company = await Company.findById(companyId);
    if (!company || company.verificationStatus !== 'VERIFIED') {
      throw new AppError('Only verified companies may publish internships.', 403);
    }
  }

  Object.assign(internship, data);
  await internship.save();
  return internship;
};

export const updateInternshipStatus = async (companyId, internshipId, status) => {
  const internship = await Internship.findOne({ _id: internshipId, companyId });
  if (!internship) {
    throw new AppError('Internship not found or unauthorized access.', 404);
  }

  if (status === 'PUBLISHED') {
    const company = await Company.findById(companyId);
    if (!company || company.verificationStatus !== 'VERIFIED') {
      throw new AppError('Only verified companies may publish internships.', 403);
    }
  }

  internship.status = status;
  await internship.save();
  return internship;
};

export const deleteInternship = async (companyId, internshipId) => {
  const internship = await Internship.findOneAndDelete({ _id: internshipId, companyId });
  if (!internship) {
    throw new AppError('Internship not found or unauthorized access.', 404);
  }
  // Remove related applications or mark cancelled
  await Application.deleteMany({ internshipId });
  return { message: 'Internship and associated applications successfully removed.' };
};

export const getPublicInternships = async (query = {}) => {
  const {
    search,
    workMode,
    location,
    skills,
    minStipend,
    page = 1,
    limit = 12,
    sort = 'newest'
  } = query;

  const filter = {
    status: 'PUBLISHED',
    applicationDeadline: { $gte: new Date() } // active deadline
  };

  if (workMode && ['REMOTE', 'HYBRID', 'ONSITE'].includes(workMode)) {
    filter.workMode = workMode;
  }

  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  if (minStipend) {
    filter['stipend.amount'] = { $gte: Number(minStipend) };
  }

  if (skills) {
    const skillList = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    filter.requiredSkills = { $in: skillList.map(s => new RegExp(s, 'i')) };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { requiredSkills: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const sortOptions = {};
  if (sort === 'newest') sortOptions.createdAt = -1;
  else if (sort === 'deadline') sortOptions.applicationDeadline = 1;
  else if (sort === 'stipend') sortOptions['stipend.amount'] = -1;
  else sortOptions.createdAt = -1;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Internship.countDocuments(filter);

  const internships = await Internship.find(filter)
    .populate('companyId', 'name logoUrl industry location verificationStatus')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit, 10));

  return {
    internships,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  };
};

export const getPublicInternshipById = async (id) => {
  const internship = await Internship.findById(id)
    .populate('companyId', 'name description logoUrl website industry location companySize verificationStatus');

  if (!internship) {
    throw new AppError('Internship not found.', 404);
  }

  return internship;
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
