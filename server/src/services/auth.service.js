import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Notification from '../models/Notification.js';
import config from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const register = async ({ name, email, password, role, companyName }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name,
    email,
    passwordHash,
    role: role || 'STUDENT'
  });

  let company = null;
  if (newUser.role === 'COMPANY') {
    company = await Company.create({
      ownerId: newUser._id,
      name: companyName || `${name}'s Company`,
      verificationStatus: 'PENDING'
    });
  }

  // Create welcome notification
  await Notification.create({
    userId: newUser._id,
    type: 'SYSTEM',
    title: 'Welcome to InternHub AI!',
    message: newUser.role === 'COMPANY'
      ? 'Welcome to InternHub AI. Your company account has been created and is pending administrative verification. You may start drafting internship listings.'
      : 'Welcome to InternHub AI! Explore internship opportunities, upload your resume, and leverage our Career Copilot to launch your career.'
  });

  const token = generateToken(newUser);

  return {
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      profile: newUser.profile
    },
    company,
    token
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);

  let company = null;
  if (user.role === 'COMPANY') {
    company = await Company.findOne({ ownerId: user._id });
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile
    },
    company,
    token
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  let company = null;
  if (user.role === 'COMPANY') {
    company = await Company.findOne({ ownerId: user._id });
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    },
    company
  };
};

export default {
  generateToken,
  register,
  login,
  getCurrentUser
};
