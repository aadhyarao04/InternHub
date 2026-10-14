import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'COMPANY'], {
      errorMap: () => ({ message: 'Role must be either STUDENT or COMPANY' })
    }).default('STUDENT'),
    companyName: z.string().optional()
  }).refine((data) => {
    if (data.role === 'COMPANY' && (!data.companyName || data.companyName.trim().length === 0)) {
      return false;
    }
    return true;
  }, {
    message: 'Company name is required when registering as a COMPANY',
    path: ['companyName']
  })
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required')
  })
};
