import { z } from 'zod';

export const createInternshipSchema = {
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(150),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    responsibilities: z.array(z.string()).default([]),
    requiredSkills: z.array(z.string().min(1)).min(1, 'At least one required skill is required'),
    preferredSkills: z.array(z.string()).default([]),
    location: z.string().min(2, 'Location is required'),
    workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).default('REMOTE'),
    duration: z.object({
      durationValue: z.number().min(1).default(3),
      durationUnit: z.enum(['WEEKS', 'MONTHS']).default('MONTHS')
    }),
    stipend: z.object({
      amount: z.number().min(0).default(0),
      currency: z.string().default('INR'),
      period: z.enum(['MONTHLY', 'TOTAL', 'UNPAID']).default('MONTHLY')
    }).default({ amount: 0, currency: 'INR', period: 'MONTHLY' }),
    applicationDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date string for applicationDeadline'
    }),
    openings: z.number().min(1).default(1),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT')
  })
};

export const updateInternshipSchema = {
  body: z.object({
    title: z.string().min(3).max(150).optional(),
    description: z.string().min(10).optional(),
    responsibilities: z.array(z.string()).optional(),
    requiredSkills: z.array(z.string()).min(1).optional(),
    preferredSkills: z.array(z.string()).optional(),
    location: z.string().min(2).optional(),
    workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
    duration: z.object({
      durationValue: z.number().min(1).optional(),
      durationUnit: z.enum(['WEEKS', 'MONTHS']).optional()
    }).optional(),
    stipend: z.object({
      amount: z.number().min(0).optional(),
      currency: z.string().optional(),
      period: z.enum(['MONTHLY', 'TOTAL', 'UNPAID']).optional()
    }).optional(),
    applicationDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date string'
    }).optional(),
    openings: z.number().min(1).optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'EXPIRED']).optional()
  })
};

export const updateStatusSchema = {
  body: z.object({
    status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'EXPIRED'])
  })
};
