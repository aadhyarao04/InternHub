import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { sendError } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. Missing or invalid Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Authentication token missing.', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded || !decoded.id) {
      return sendError(res, 'Invalid token payload.', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User account no longer exists.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    // Attach verified user context
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    // If company role, attach their company record if present
    if (user.role === 'COMPANY') {
      const company = await Company.findOne({ ownerId: user._id });
      if (company) {
        req.user.companyId = company._id.toString();
        req.company = company;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, `Forbidden: requires one of the following roles: [${roles.join(', ')}]`, 403);
    }
    next();
  };
};

/**
 * Ensures company is VERIFIED before allowing publication of internships
 */
export const requireVerifiedCompany = (req, res, next) => {
  if (req.user?.role === 'ADMIN') {
    return next();
  }
  if (!req.company) {
    return sendError(res, 'Company profile not found for this account.', 404);
  }
  if (req.company.verificationStatus !== 'VERIFIED') {
    return sendError(res, `Company is not verified (current status: ${req.company.verificationStatus}). Only verified companies can publish internships.`, 403);
  }
  next();
};

export default {
  authenticate,
  authorize,
  requireVerifiedCompany
};
