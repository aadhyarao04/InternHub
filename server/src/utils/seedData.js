import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB, { disconnectDB } from '../config/db.js';
import {
  User,
  Company,
  Internship,
  Application,
  Resume,
  Notification,
  KnowledgeDocument
} from '../models/index.js';
import { generateEmbedding } from '../ai/embeddings/embeddingService.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Preparing development data...');

    // Clear existing development collections
    await User.deleteMany({});
    await Company.deleteMany({});
    await Internship.deleteMany({});
    await Application.deleteMany({});
    await Resume.deleteMany({});
    await Notification.deleteMany({});
    await KnowledgeDocument.deleteMany({});

    console.log('[Seed] Cleared old collections.');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@internhub.ai',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      isActive: true
    });

    // 2. Create Verified Company 1
    const companyUser1 = await User.create({
      name: 'Sarah Connor',
      email: 'recruiter@techcorp.io',
      passwordHash: defaultPasswordHash,
      role: 'COMPANY',
      isActive: true
    });

    const company1 = await Company.create({
      ownerId: companyUser1._id,
      name: 'TechCorp Solutions',
      description: 'Global cloud software engineering leader building next-generation AI platforms.',
      website: 'https://techcorp.io',
      logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&auto=format&fit=crop&q=80',
      industry: 'Software & Cloud Infrastructure',
      location: 'Bangalore, India',
      companySize: 'LARGE',
      verificationStatus: 'VERIFIED'
    });

    // 3. Create Verified Company 2
    const companyUser2 = await User.create({
      name: 'Alex Rivera',
      email: 'careers@innovatelabs.co',
      passwordHash: defaultPasswordHash,
      role: 'COMPANY',
      isActive: true
    });

    const company2 = await Company.create({
      ownerId: companyUser2._id,
      name: 'Innovate AI Labs',
      description: 'Pioneering frontier machine learning and enterprise intelligence systems.',
      website: 'https://innovatelabs.co',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
      industry: 'Artificial Intelligence & Robotics',
      location: 'Remote / Global',
      companySize: 'STARTUP',
      verificationStatus: 'VERIFIED'
    });

    // 4. Create Pending Company
    const companyUser3 = await User.create({
      name: 'David Miller',
      email: 'recruiting@nextgentech.dev',
      passwordHash: defaultPasswordHash,
      role: 'COMPANY',
      isActive: true
    });

    await Company.create({
      ownerId: companyUser3._id,
      name: 'NextGen Fintech',
      description: 'Decentralized payment infrastructure and smart contract auditing.',
      website: 'https://nextgentech.dev',
      industry: 'FinTech',
      location: 'Mumbai, India',
      companySize: 'MEDIUM',
      verificationStatus: 'PENDING'
    });

    // 5. Create Student 1
    const studentUser = await User.create({
      name: 'Aaditya Sharma',
      email: 'student@internhub.ai',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      isActive: true,
      profile: {
        headline: 'Aspiring Full-Stack Software Engineer & AI Enthusiast',
        bio: 'Computer Science undergrad passionate about building scalable web applications with React, Node.js, and generative AI models.',
        phone: '+91 98765 43210',
        location: 'Bangalore, India',
        skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Python', 'Tailwind CSS', 'Git', 'REST APIs'],
        education: [{
          institution: 'National Institute of Technology',
          degree: 'Bachelor of Technology (B.Tech)',
          fieldOfStudy: 'Computer Science and Engineering',
          startDate: new Date('2022-08-01'),
          endDate: new Date('2026-06-30'),
          current: true,
          gpa: '8.8 / 10'
        }],
        projects: [{
          title: 'Cloud Document Collaborator',
          description: 'Real-time collaborative markdown and diagram editor with operational transform and JWT auth.',
          technologies: ['React', 'Node.js', 'WebSocket', 'MongoDB'],
          link: 'https://github.com/aaditya/cloud-doc',
          githubUrl: 'https://github.com/aaditya/cloud-doc'
        }],
        certifications: [{
          name: 'AWS Certified Cloud Practitioner',
          issuingOrganization: 'Amazon Web Services',
          issueDate: new Date('2024-05-15')
        }],
        careerPreferences: {
          targetRoles: ['Full-Stack Developer', 'Frontend Engineer', 'Backend Developer'],
          preferredLocations: ['Bangalore', 'Remote', 'Hyderabad'],
          workModes: ['REMOTE', 'HYBRID'],
          preferredDomains: ['AI / SaaS', 'Developer Tools'],
          minimumStipend: 25000
        }
      }
    });

    // 6. Create Student Resume
    const studentResume = await Resume.create({
      userId: studentUser._id,
      fileName: 'Aaditya_Sharma_FullStack_Resume.pdf',
      fileUrl: '/uploads/resumes/sample-resume.pdf',
      fileType: 'application/pdf',
      fileSize: 145000,
      isPrimary: true,
      parsedContent: {
        rawText: 'Aaditya Sharma. Full-Stack Engineer with React, Node.js, Python, MongoDB.',
        summary: 'Proactive Computer Science student with hands-on experience developing modern web platforms, APIs, and AI integrations.',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Python', 'Tailwind CSS', 'Git', 'REST APIs'],
        education: ['National Institute of Technology - B.Tech CSE (2022-2026)'],
        projects: ['Cloud Document Collaborator (React, Node.js, WebSocket)'],
        experience: ['Summer Intern - Web Solutions Ltd.'],
        certifications: ['AWS Certified Cloud Practitioner'],
        strengths: ['Strong command of JavaScript and modern full-stack frameworks', 'Good project portfolio'],
        improvements: ['Include quantifiable metrics in project bullet points', 'Add system architecture diagrams'],
        atsScore: 88
      }
    });

    // 7. Create Internships
    const internship1 = await Internship.create({
      companyId: company1._id,
      title: 'Full-Stack Developer Intern',
      description: 'Join our cloud platform team to build real-time dashboard analytics, responsive user interfaces in React, and robust REST APIs in Node.js and MongoDB.',
      responsibilities: [
        'Design and implement high-performance React UI components',
        'Build scalable microservice endpoints using Express and Mongoose',
        'Participate in code reviews and agile sprint cycles'
      ],
      requiredSkills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
      preferredSkills: ['TypeScript', 'Docker', 'Tailwind CSS'],
      location: 'Bangalore, India',
      workMode: 'HYBRID',
      duration: { durationValue: 6, durationUnit: 'MONTHS' },
      stipend: { amount: 35000, currency: 'INR', period: 'MONTHLY' },
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      openings: 3,
      status: 'PUBLISHED',
      embeddings: await generateEmbedding('Full-Stack Developer Intern React Node.js JavaScript MongoDB Bangalore Hybrid Cloud')
    });

    const internship2 = await Internship.create({
      companyId: company2._id,
      title: 'AI & Machine Learning Research Intern',
      description: 'Collaborate with senior researchers to benchmark LLMs, fine-tune domain embeddings, and construct vector-powered retrieval pipelines.',
      responsibilities: [
        'Implement semantic search and RAG knowledge pipelines',
        'Analyze model evaluation metrics and bias mitigation',
        'Prototype assistive AI agents for developer workflows'
      ],
      requiredSkills: ['Python', 'Machine Learning', 'PyTorch', 'REST APIs'],
      preferredSkills: ['NLP', 'Vector Databases', 'Docker'],
      location: 'Remote',
      workMode: 'REMOTE',
      duration: { durationValue: 3, durationUnit: 'MONTHS' },
      stipend: { amount: 45000, currency: 'INR', period: 'MONTHLY' },
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      openings: 2,
      status: 'PUBLISHED',
      embeddings: await generateEmbedding('AI Machine Learning Research Intern Python PyTorch NLP RAG Vector Remote')
    });

    const internship3 = await Internship.create({
      companyId: company1._id,
      title: 'Frontend Engineering Intern',
      description: 'Craft sleek, accessible, responsive user interfaces using modern React 19, Tailwind CSS, and Vite.',
      responsibilities: [
        'Transform Figma designs into clean, responsive React components',
        'Optimize Core Web Vitals and Largest Contentful Paint (LCP)',
        'Write component unit and integration tests'
      ],
      requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS'],
      preferredSkills: ['Next.js', 'TypeScript'],
      location: 'Bangalore, India',
      workMode: 'REMOTE',
      duration: { durationValue: 4, durationUnit: 'MONTHS' },
      stipend: { amount: 30000, currency: 'INR', period: 'MONTHLY' },
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      openings: 4,
      status: 'PUBLISHED',
      embeddings: await generateEmbedding('Frontend Engineering Intern React Tailwind CSS JavaScript HTML5 UI UX Remote')
    });

    // 8. Create Sample Application
    await Application.create({
      studentId: studentUser._id,
      internshipId: internship1._id,
      resumeId: studentResume._id,
      coverLetter: 'I am excited about this Full-Stack internship at TechCorp Solutions. My experience building React apps and REST APIs aligns well with your team requirements.',
      status: 'UNDER_REVIEW',
      statusHistory: [
        { status: 'APPLIED', changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Applied via portal.' },
        { status: 'UNDER_REVIEW', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Recruiter started reviewing profile.' }
      ],
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    // 9. Create Notifications
    await Notification.create({
      userId: studentUser._id,
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Application Under Review',
      message: 'Your application for "Full-Stack Developer Intern" at TechCorp Solutions is now Under Review.',
      isRead: false
    });

    await Notification.create({
      userId: studentUser._id,
      type: 'SYSTEM',
      title: 'Welcome to InternHub AI',
      message: 'Explore verified internships, build your skill-gap roadmap, and chat with Career Copilot.',
      isRead: true
    });

    // 10. Seed Knowledge Base for RAG
    const kbItems = [
      {
        title: 'Mastering Full-Stack Technical Interviews',
        category: 'INTERVIEW',
        content: 'Technical interviews for software engineering internships typically evaluate four core areas: 1) Data Structures and Algorithms (Array manipulation, HashMaps, Trees, Two Pointers), 2) System understanding (how client-server HTTP communication works, REST principles, database indexes), 3) Practical problem solving in a language of choice like JavaScript or Python, and 4) Behavioral communication using the STAR technique (Situation, Task, Action, Result). Always clarify requirements before jumping straight into code.'
      },
      {
        title: 'ATS Resume Best Practices for Tech Internships',
        category: 'RESUME',
        content: 'Applicant Tracking Systems (ATS) scan resumes for keywords that match the job description. Structure your resume with distinct, standard headings: Education, Skills, Technical Projects, Experience, and Certifications. Use quantifiable bullet points: specify the technology stack used, what problem was solved, and measurable impact (e.g. "Reduced API response times by 35% by implementing Redis caching"). Avoid images, columns, and tables that could confuse OCR parsers.'
      },
      {
        title: 'Frontend Performance & Core Web Vitals',
        category: 'TECH',
        content: 'Modern frontend development prioritizes user experience metrics defined by Google: Largest Contentful Paint (LCP) for loading speed, Interaction to Next Paint (INP) for responsiveness, and Cumulative Layout Shift (CLS) for visual stability. Best practices include lazy loading off-screen images, bundling modular CSS with Tailwind, memoizing heavy components, and optimizing server response times.'
      },
      {
        title: 'Closing Skill Gaps and Building a Strong GitHub Portfolio',
        category: 'CAREER',
        content: 'When you identify missing skills required for your dream internship, the fastest route to competency is building 1-2 focused projects rather than simply watching video tutorials. Document your project thoroughly with an architecture diagram, installation steps, live demo link, and key technical challenges overcome. Recruiters look for evidence that you can take an idea from concept to deployed reality.'
      }
    ];

    for (const item of kbItems) {
      const chunks = [{
        text: item.content,
        embedding: await generateEmbedding(item.content)
      }];
      await KnowledgeDocument.create({
        ...item,
        chunks
      });
    }

    console.log('\n=============================================================');
    console.log('   DEVELOPMENT SEED DATA GENERATED SUCCESSFULLY');
    console.log('=============================================================');
    console.log('  Accounts (DEVELOPMENT ONLY):');
    console.log('  - Admin:   email: admin@internhub.ai        password: Password123!');
    console.log('  - Student: email: student@internhub.ai      password: Password123!');
    console.log('  - Company: email: recruiter@techcorp.io     password: Password123!');
    console.log('=============================================================\n');

    await disconnectDB();
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
