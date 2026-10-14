import { z } from 'zod';

export const applySchema = {
  body: z.object({
    resumeId: z.string().min(1, 'Resume selection is required'),
    coverLetter: z.string().max(3000).optional()
  })
};

export const updateStatusSchema = {
  body: z.object({
    status: z.enum(['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED']),
    note: z.string().max(500).optional()
  })
};

export const scheduleInterviewSchema = {
  body: z.object({
    scheduledAt: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid scheduled date/time'
    }),
    durationMinutes: z.number().min(15).max(180).default(45),
    locationOrLink: z.string().min(3, 'Meeting link or location is required'),
    notes: z.string().max(1000).optional()
  })
};
