import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Company from '../src/models/Company.js';
import Internship from '../src/models/Internship.js';
import Application from '../src/models/Application.js';
import Resume from '../src/models/Resume.js';
import bcrypt from 'bcryptjs';

describe('End-to-End Core User Journeys Test Suite', () => {
  let adminToken;
  let companyToken;
  let companyUser;
  let companyDoc;
  let studentToken;
  let studentUser;
  let resumeDoc;
  let internshipDoc;
  let applicationDoc;

  beforeAll(async () => {
    await connectDB();

    // Create Admin
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('Password123!', salt);
    const admin = await User.create({
      name: 'E2E Admin',
      email: `e2e_admin_${Date.now()}@internhub.ai`,
      passwordHash: passHash,
      role: 'ADMIN'
    });

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: admin.email,
      password: 'Password123!'
    });
    adminToken = adminLogin.body.data.token;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('Step 1: Company registers and is initially PENDING', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Nexus Recruiter',
        email: `nexus_${Date.now()}@nexus.com`,
        password: 'Password123!',
        role: 'COMPANY',
        companyName: 'Nexus Cloud AI'
      });

    expect(res.status).toBe(201);
    companyToken = res.body.data.token;
    companyUser = res.body.data.user;
    companyDoc = res.body.data.company;
    expect(companyDoc.verificationStatus).toBe('PENDING');
  });

  test('Step 2: Admin verifies the Company', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/companies/${companyDoc._id}/verification`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ verificationStatus: 'VERIFIED' });

    expect(res.status).toBe(200);
    expect(res.body.data.verificationStatus).toBe('VERIFIED');
  });

  test('Step 3: Verified Company creates and publishes an internship', async () => {
    const res = await request(app)
      .post('/api/v1/company/internships')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        title: 'Cloud DevOps Intern',
        description: 'Build CI/CD pipelines and manage Kubernetes clusters in AWS and GCP.',
        requiredSkills: ['Docker', 'Kubernetes', 'Linux', 'AWS'],
        location: 'Remote',
        workMode: 'REMOTE',
        duration: { durationValue: 6, durationUnit: 'MONTHS' },
        stipend: { amount: 40000, currency: 'INR', period: 'MONTHLY' },
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        openings: 2,
        status: 'PUBLISHED'
      });

    expect(res.status).toBe(201);
    internshipDoc = res.body.data;
    expect(internshipDoc.status).toBe('PUBLISHED');
  });

  test('Step 4: Student registers, updates profile, and uploads resume', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'DevOps Candidate',
        email: `devops_candidate_${Date.now()}@student.com`,
        password: 'Password123!',
        role: 'STUDENT'
      });

    expect(regRes.status).toBe(201);
    studentToken = regRes.body.data.token;
    studentUser = regRes.body.data.user;

    // Update Skills
    const skillRes = await request(app)
      .patch('/api/v1/students/me/skills')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ skills: ['Docker', 'Linux', 'Git', 'Python'] });

    expect(skillRes.status).toBe(200);
    expect(skillRes.body.data.skills).toContain('Docker');

    // Create dummy primary resume directly
    resumeDoc = await Resume.create({
      userId: studentUser.id,
      fileName: 'devops_resume.pdf',
      fileUrl: '/uploads/resumes/sample.pdf',
      fileType: 'application/pdf',
      fileSize: 120000,
      isPrimary: true,
      parsedContent: {
        skills: ['Docker', 'Linux', 'Git'],
        atsScore: 82
      }
    });
    expect(resumeDoc._id).toBeDefined();
  });

  test('Step 5: Student discovers internship and applies', async () => {
    // Browse
    const searchRes = await request(app)
      .get('/api/v1/internships?search=DevOps')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.internships.length).toBeGreaterThanOrEqual(1);

    // Apply
    const applyRes = await request(app)
      .post(`/api/v1/internships/${internshipDoc._id}/apply`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        resumeId: resumeDoc._id.toString(),
        coverLetter: 'I am deeply passionate about cloud infrastructure and Kubernetes.'
      });

    expect(applyRes.status).toBe(201);
    applicationDoc = applyRes.body.data;
    expect(applicationDoc.status).toBe('APPLIED');
  });

  test('Step 6: Company reviews applicant and updates status to SHORTLISTED', async () => {
    const listRes = await request(app)
      .get('/api/v1/company/applications')
      .set('Authorization', `Bearer ${companyToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.applications.length).toBeGreaterThanOrEqual(1);

    const updateRes = await request(app)
      .patch(`/api/v1/company/applications/${applicationDoc._id}/status`)
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        status: 'SHORTLISTED',
        note: 'Candidate has strong Docker and Linux background.'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('SHORTLISTED');
  });

  test('Step 7: Company schedules an interview with Candidate', async () => {
    const interviewTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const res = await request(app)
      .post(`/api/v1/company/applications/${applicationDoc._id}/interview`)
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        scheduledAt: interviewTime,
        durationMinutes: 45,
        locationOrLink: 'https://meet.google.com/xyz-devops-interview',
        notes: 'Technical round covering containerization and CI/CD.'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.application.status).toBe('INTERVIEW');
    expect(res.body.data.interview.locationOrLink).toBe('https://meet.google.com/xyz-devops-interview');
  });

  test('Step 8: Student checks notifications and sees interview scheduled', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notifications.length).toBeGreaterThanOrEqual(1);
    const hasInterviewNote = res.body.data.notifications.some(n => n.type === 'INTERVIEW_SCHEDULED');
    expect(hasInterviewNote).toBe(true);
  });

  test('Step 9: Company makes final offer (SELECTED)', async () => {
    const res = await request(app)
      .patch(`/api/v1/company/applications/${applicationDoc._id}/status`)
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        status: 'SELECTED',
        note: 'Exceptional interview performance. Offer extended.'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SELECTED');
  });

  test('Step 10: Admin monitors platform stats reflects completed workflow', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.metrics.applications.selected).toBeGreaterThanOrEqual(1);
    expect(res.body.data.metrics.companies.verified).toBeGreaterThanOrEqual(1);
  });
});
