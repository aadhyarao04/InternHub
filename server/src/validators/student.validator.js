import { z } from 'zod';

export const updateProfileSchema = {
  body: z.object({
    name: z.string().min(2).optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    headline: z.string().max(200).optional(),
    bio: z.string().max(2000).optional(),
    phone: z.string().max(20).optional(),
    location: z.string().max(100).optional()
  })
};

export const updateSkillsSchema = {
  body: z.object({
    skills: z.array(z.string().trim().min(1)).min(0)
  })
};

export const educationSchema = {
  body: z.object({
    institution: z.string().min(1, 'Institution is required'),
    degree: z.string().min(1, 'Degree is required'),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    gpa: z.string().optional()
  })
};

export const projectSchema = {
  body: z.object({
    title: z.string().min(1, 'Project title is required'),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    link: z.string().url().optional().or(z.literal('')),
    githubUrl: z.string().url().optional().or(z.literal('')),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })
};

export const certificationSchema = {
  body: z.object({
    name: z.string().min(1, 'Certification name is required'),
    issuingOrganization: z.string().min(1, 'Issuing organization is required'),
    issueDate: z.string().optional(),
    credentialUrl: z.string().url().optional().or(z.literal('')),
    credentialId: z.string().optional()
  })
};

export const careerPreferencesSchema = {
  body: z.object({
    targetRoles: z.array(z.string()).optional(),
    preferredLocations: z.array(z.string()).optional(),
    workModes: z.array(z.enum(['REMOTE', 'HYBRID', 'ONSITE'])).optional(),
    preferredDomains: z.array(z.string()).optional(),
    minimumStipend: z.number().min(0).optional()
  })
};
