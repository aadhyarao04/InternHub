import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, err, {
    requestId: req.id,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const issues = err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    return sendError(res, `Validation error: ${issues}`, 400, err.issues);
  }

  // Handle Mongoose CastError (malformed ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid ID format for ${err.path}`, 400);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyPattern || {});
    if (keys.includes('studentId') && keys.includes('internshipId')) {
      return sendError(res, 'You have already applied for this internship.', 409);
    }
    if (keys.includes('email')) {
      return sendError(res, 'An account with this email already exists.', 409);
    }
    return sendError(res, 'Duplicate resource record already exists.', 409);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    return sendError(res, `Validation failed: ${messages}`, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired. Please log in again.', 401);
  }

  // Handle custom AppError
  if (err.statusCode) {
    return sendError(res, err.message, err.statusCode);
  }

  // Default internal server error
  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message,
    500
  );
};

export default errorHandler;
