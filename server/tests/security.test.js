import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Company from '../src/models/Company.js';
import Internship from '../src/models/Internship.js';
import Application from '../src/models/Application.js';
import Resume from '../src/models/Resume.js';
import { generateToken } from '../src/services/auth.service.js';

describe('Security & Authorization Boundary Test Suite', () => {
  let studentToken;
  let studentUser;
  let companyUser;
  let companyRecord;
  let companyToken;
  let sampleInternship;
  let sampleResume;

  beforeAll(async () => {
    await connectDB();

    // Create test student
    studentUser = await User.create({
      name: 'Security Test Student',
      email: `sec_student_${Date.now()}@test.com`,
      passwordHash: 'dummyHash',
      role: 'STUDENT'
    });
    studentToken = generateToken(studentUser);

    // Create test company
    companyUser = await User.create({
      name: 'Security Test Recruiter',
      email: `sec_company_${Date.now()}@test.com`,
      passwordHash: 'dummyHash',
      role: 'COMPANY'
    });
    companyRecord = await Company.create({
      ownerId: companyUser._id,
      name: 'Secured Corp',
      verificationStatus: 'PENDING' // NOTE: PENDING!
    });
    companyToken = generateToken(companyUser);

    // Create published internship
    sampleInternship = await Internship.create({
      companyId: companyRecord._id,
      title: 'Security Analyst Intern',
      description: 'Test internship for security test suite',
      requiredSkills: ['Cybersecurity', 'Linux'],
      location: 'Remote',
      workMode: 'REMOTE',
      duration: { durationValue: 3, durationUnit: 'MONTHS' },
      applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'PUBLISHED'
    });

    sampleResume = await Resume.create({
      userId: studentUser._id,
      fileName: 'test_resume.pdf',
      fileUrl: '/uploads/resumes/dummy.pdf',
      fileType: 'application/pdf',
      fileSize: 100000,
      isPrimary: true
    });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('Missing Token - Protected route must return 401', async () => {
    const res = await request(app).get('/api/v1/students/me/profile');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Tampered Token - Modified JWT payload must return 401', async () => {
    const tampered = studentToken.slice(0, -6) + 'abcdef';
    const res = await request(app)
      .get('/api/v1/students/me/profile')
      .set('Authorization', `Bearer ${tampered}`);
    expect(res.status).toBe(401);
  });

  test('Role Privilege Escalation - Student cannot access Admin endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Role Privilege Escalation - Student cannot access Company endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/company/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  test('Company Verification Gate - Pending company cannot publish internships directly', async () => {
    const res = await request(app)
      .post('/api/v1/company/internships')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        title: 'Unauthorized Published Internship',
        description: 'Should be rejected because company is PENDING verification',
        requiredSkills: ['React'],
        location: 'Remote',
        workMode: 'REMOTE',
        duration: { durationValue: 3, durationUnit: 'MONTHS' },
        applicationDeadline: new Date(Date.now() + 5000000).toISOString(),
        status: 'PUBLISHED'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Only verified companies may publish internships');
  });

  test('Duplicate Application Prevention - Cannot apply twice for same internship', async () => {
    // 1st application
    const firstRes = await request(app)
      .post(`/api/v1/internships/${sampleInternship._id}/apply`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        resumeId: sampleResume._id.toString(),
        coverLetter: 'First application'
      });

    expect(firstRes.status).toBe(201);

    // 2nd application (must be rejected)
    const secondRes = await request(app)
      .post(`/api/v1/internships/${sampleInternship._id}/apply`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        resumeId: sampleResume._id.toString(),
        coverLetter: 'Duplicate application'
      });

    expect(secondRes.status).toBe(409);
    expect(secondRes.body.success).toBe(false);
  });

  test('IDOR Protection - Student cannot use another student resume to apply', async () => {
    const anotherStudent = await User.create({
      name: 'Another Student',
      email: `another_${Date.now()}@test.com`,
      passwordHash: 'dummy',
      role: 'STUDENT'
    });
    const anotherToken = generateToken(anotherStudent);

    const res = await request(app)
      .post(`/api/v1/internships/${sampleInternship._id}/apply`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .send({
        resumeId: sampleResume._id.toString(), // belongs to studentUser!
        coverLetter: 'IDOR attempt'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('does not belong to your account');
  });

  test('Malformed ObjectId Handling - Returns clean 400 error rather than crashing', async () => {
    const res = await request(app)
      .get('/api/v1/internships/malformed-id-12345')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid ID format');
  });
});
