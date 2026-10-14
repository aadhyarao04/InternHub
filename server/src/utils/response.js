/**
 * Standard API response helpers conforming to the specification:
 * Success: { success: true, data: ... }
 * Error: { success: false, message: ... }
 */

export const sendSuccess = (res, data = {}, statusCode = 200, meta = null) => {
  const payload = {
    success: true,
    data
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
};

export const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message
  };
  if (errors && process.env.NODE_ENV !== 'production') {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
};
