import InterviewSession from '../../models/InterviewSession.js';
import { generateText } from './aiProvider.js';
import { AppError } from '../../middleware/errorHandler.js';

const ROLE_QUESTION_BANKS = {
  'frontend': [
    { questionId: 'q1', questionText: 'Explain the difference between state and props in React, and how the component lifecycle handles state updates.', category: 'React & State' },
    { questionId: 'q2', questionText: 'How do you optimize the performance and Largest Contentful Paint (LCP) of a modern web application?', category: 'Web Performance' },
    { questionId: 'q3', questionText: 'Explain CSS Flexbox vs Grid and when you would choose one over the other for a responsive dashboard.', category: 'CSS & Layout' }
  ],
  'backend': [
    { questionId: 'q1', questionText: 'What is the Node.js event loop, and how does it handle asynchronous I/O operations without blocking execution?', category: 'Node.js Internals' },
    { questionId: 'q2', questionText: 'Explain the difference between SQL and NoSQL databases. How would you choose between MongoDB and PostgreSQL for a high-traffic e-commerce system?', category: 'Database Architecture' },
    { questionId: 'q3', questionText: 'How do you secure REST API endpoints against common vulnerabilities like unauthorized access, SQL/NoSQL injection, and rate abuse?', category: 'API Security' }
  ],
  'fullstack': [
    { questionId: 'q1', questionText: 'Walk through how an end-to-end user authentication flow works using JWT and HTTP-only cookies/Bearer headers.', category: 'Authentication & Security' },
    { questionId: 'q2', questionText: 'How do you structure database models and relationship references in MongoDB to ensure optimal read/write query performance?', category: 'Full-Stack Architecture' },
    { questionId: 'q3', questionText: 'Describe how you troubleshoot and debug a production error that only occurs under concurrent user load.', category: 'System Debugging' }
  ],
  'data': [
    { questionId: 'q1', questionText: 'Explain the difference between supervised and unsupervised machine learning, giving practical business examples of each.', category: 'Machine Learning' },
    { questionId: 'q2', questionText: 'How do you handle missing values, outliers, and skewed distributions in a real-world tabular dataset?', category: 'Data Preprocessing' },
    { questionId: 'q3', questionText: 'Explain SQL Window Functions (e.g. ROW_NUMBER(), RANK(), DENSE_RANK()) and write an example use case.', category: 'SQL Analytics' }
  ]
};

export const startSession = async (userId, targetRole, difficulty = 'ENTRY') => {
  const roleKey = Object.keys(ROLE_QUESTION_BANKS).find(k => targetRole.toLowerCase().includes(k)) || 'fullstack';
  const questions = ROLE_QUESTION_BANKS[roleKey];

  const session = await InterviewSession.create({
    userId,
    targetRole,
    difficulty,
    questions,
    answers: [],
    completed: false
  });

  return session;
};

export const submitAnswer = async (userId, sessionId, questionId, answerText) => {
  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw new AppError('Interview session not found or unauthorized.', 404);

  const question = session.questions.find(q => q.questionId === questionId);
  if (!question) throw new AppError('Question not found in this session.', 400);

  // Analyze answer via AI or rubric
  const prompt = `Target Role: ${session.targetRole}
Interview Question: "${question.questionText}"
Candidate's Answer: "${answerText}"

Evaluate this answer and output a valid JSON object matching this schema:
{
  "score": 85 (integer from 0 to 100),
  "strengths": ["Key positive points mentioned"],
  "improvements": ["Constructive specific recommendations to make the answer more impressive"],
  "modelAnswer": "An exemplary high-scoring response to this question"
}`;

  let feedback = null;
  try {
    const aiResponse = await generateText(prompt, 'You are a senior tech hiring manager conducting a technical interview.', true);
    if (aiResponse) {
      const clean = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      feedback = JSON.parse(clean);
    }
  } catch (err) {
    console.warn('[InterviewSimulator] AI feedback fallback:', err.message);
  }

  if (!feedback) {
    const wordCount = answerText.split(/\s+/).length;
    const score = Math.min(95, Math.max(50, 50 + Math.min(40, wordCount * 0.8)));
    feedback = {
      score: Math.round(score),
      strengths: [
        wordCount > 30 ? 'Provided a detailed explanation with relevant context.' : 'Answered directly.',
        'Demonstrated understanding of core concepts.'
      ],
      improvements: [
        'Incorporate specific real-world examples or metrics from past projects.',
        'Structure your answer using the STAR method (Situation, Task, Action, Result).'
      ],
      modelAnswer: `In an interview, start with a concise definition, highlight architectural trade-offs, and mention how you applied this in a real project.`
    };
  }

  // Update or add answer in session
  const existingIdx = session.answers.findIndex(a => a.questionId === questionId);
  if (existingIdx >= 0) {
    session.answers[existingIdx] = { questionId, answerText, feedback };
  } else {
    session.answers.push({ questionId, answerText, feedback });
  }

  // Check if all answered
  if (session.answers.length >= session.questions.length) {
    session.completed = true;
    const avgScore = Math.round(session.answers.reduce((acc, a) => acc + (a.feedback?.score || 70), 0) / session.answers.length);
    session.overallScore = avgScore;
    session.overallFeedback = avgScore >= 80
      ? 'Outstanding performance! You communicated technical concepts clearly with strong depth.'
      : 'Good effort! Review the model answers to sharpen your technical explanations and structured examples.';
  }

  await session.save();
  return session;
};

export const getSessionHistory = async (userId) => {
  return await InterviewSession.find({ userId }).sort({ createdAt: -1 });
};

export const getSessionById = async (userId, sessionId) => {
  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw new AppError('Interview session not found.', 404);
  return session;
};

export default {
  startSession,
  submitAnswer,
  getSessionHistory,
  getSessionById
};
