import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Company from '../src/models/Company.js';

describe('Authentication & RBAC Test Suite', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  const testEmail = `test_student_${Date.now()}@internhub.ai`;
  const companyEmail = `test_company_${Date.now()}@internhub.ai`;

  test('POST /api/v1/auth/register - Should register a new STUDENT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Student',
        email: testEmail,
        password: 'Password123!',
        role: 'STUDENT'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.role).toBe('STUDENT');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Security: never expose hash
  });

  test('POST /api/v1/auth/register - Should reject duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Duplicate Student',
        email: testEmail,
        password: 'Password123!',
        role: 'STUDENT'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/auth/register - Should register COMPANY and create PENDING company record', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Company Recruiter',
        email: companyEmail,
        password: 'Password123!',
        role: 'COMPANY',
        companyName: 'Apex Innovations'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('COMPANY');
    expect(res.body.data.company).toBeDefined();
    expect(res.body.data.company.verificationStatus).toBe('PENDING');
  });

  test('POST /api/v1/auth/register - Should reject direct registration as ADMIN', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Hacker Admin',
        email: 'hacker@test.com',
        password: 'Password123!',
        role: 'ADMIN'
      });

    expect(res.status).toBe(400); // Zod validation rejects role ADMIN
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/auth/login - Should successfully authenticate and issue JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
  });

  test('POST /api/v1/auth/login - Should return generic 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword999'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password.');
  });

  test('GET /api/v1/auth/me - Should return authenticated profile with valid Bearer token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'Password123!'
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe(testEmail);
  });
});
