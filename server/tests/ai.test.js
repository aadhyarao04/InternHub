import { extractSkillsFromText, normalizeSkill } from '../src/ai/services/skillExtractor.js';
import { analyzeResume } from '../src/ai/services/resumeAnalyzer.js';
import { analyzeSkillGap } from '../src/ai/services/skillGapService.js';
import { executeControlledTool } from '../src/ai/tools/controlledTools.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

describe('AI Intelligence & Controlled Tools Test Suite', () => {
  let testUser;

  beforeAll(async () => {
    await connectDB();
    testUser = await User.create({
      name: 'AI Test Candidate',
      email: `ai_candidate_${Date.now()}@test.com`,
      passwordHash: 'dummy',
      role: 'STUDENT',
      profile: {
        skills: ['React', 'JavaScript', 'Node.js', 'MongoDB']
      }
    });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('Skill Normalization & Extraction', () => {
    expect(normalizeSkill('reactjs')).toBe('React');
    expect(normalizeSkill('NODE.JS')).toBe('Node.js');
    expect(normalizeSkill('k8s')).toBe('Kubernetes');

    const sampleText = 'Experienced in React, TypeScript, and building microservices using Docker and PostgreSQL.';
    const extracted = extractSkillsFromText(sampleText);
    expect(extracted).toContain('React');
    expect(extracted).toContain('TypeScript');
    expect(extracted).toContain('Docker');
    expect(extracted).toContain('PostgreSQL');
  });

  test('Resume Analyzer & ATS Scoring', async () => {
    const sampleResumeText = `
John Doe
Email: john@example.com | Phone: 123-456-7890
Education: Bachelor of Science in Computer Science from State University, GPA: 3.9
Skills: React, Node.js, Python, MongoDB, Docker, Git
Experience: Software Engineering Intern at Alpha Cloud. Built REST APIs and optimized database queries.
Projects: E-commerce web application with full authentication and payment gateway integration.
Certifications: AWS Certified Developer Associate
`;

    const result = await analyzeResume(sampleResumeText);
    expect(result.skills.length).toBeGreaterThanOrEqual(4);
    expect(result.skills).toContain('React');
    expect(result.skills).toContain('Python');
    expect(result.atsScore).toBeGreaterThanOrEqual(70);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.improvements.length).toBeGreaterThan(0);
  });

  test('Skill-Gap Analysis - Correctly calculates match % and recommendations', async () => {
    const studentSkills = ['React', 'JavaScript', 'Node.js'];
    const requiredSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];

    const gap = await analyzeSkillGap(studentSkills, requiredSkills, 'Full-Stack Developer');

    expect(gap.matchedSkills).toContain('React');
    expect(gap.matchedSkills).toContain('Node.js');
    expect(gap.missingSkills).toContain('TypeScript');
    expect(gap.missingSkills).toContain('PostgreSQL');
    expect(gap.matchedCount).toBe(2);
    expect(gap.missingCount).toBe(2);
    expect(gap.matchPercentage).toBe(50);
    expect(gap.readinessLevel).toBe('MODERATE');
    expect(gap.recommendations.length).toBe(2);
  });

  test('Controlled AI Tools - Enforces authentication and authorization isolation', async () => {
    // 1. Should reject if no user context
    await expect(executeControlledTool('getStudentProfile', {}, null)).rejects.toThrow('Authentication required');

    // 2. Should only retrieve the authenticated student's profile
    const profile = await executeControlledTool('getStudentProfile', {}, { id: testUser._id.toString() });
    expect(profile._id.toString()).toBe(testUser._id.toString());
    expect(profile.name).toBe('AI Test Candidate');

    // 3. Should reject unknown tool name
    await expect(executeControlledTool('unknownDangerousTool', {}, { id: testUser._id.toString() }))
      .rejects.toThrow('Unrecognized controlled tool');
  });
});
