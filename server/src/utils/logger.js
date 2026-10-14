/**
 * Structured logger utility
 * Masks sensitive fields (passwords, tokens, credentials)
 */

const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'jwt', 'secret', 'authorization', 'cookie', 'apiKey'];
  
  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object' && clone[key] !== null) {
      clone[key] = sanitize(clone[key]);
    }
  }
  return clone;
};

export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...sanitize(meta)
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...sanitize(meta)
    }));
  },
  error: (message, error = null, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || error,
      ...(process.env.NODE_ENV !== 'production' && error?.stack ? { stack: error.stack } : {}),
      ...sanitize(meta)
    }));
  }
};

export default logger;
