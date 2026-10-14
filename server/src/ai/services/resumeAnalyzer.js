import { extractSkillsFromText } from './skillExtractor.js';
import { generateText } from './aiProvider.js';

export const analyzeResume = async (rawText) => {
  if (!rawText || rawText.trim().length === 0) {
    return {
      rawText: '',
      summary: 'No readable text could be extracted from this document.',
      skills: [],
      education: [],
      projects: [],
      experience: [],
      certifications: [],
      strengths: ['Uploaded resume file'],
      improvements: ['Ensure document has selectable text rather than flattened image scans.'],
      atsScore: 40
    };
  }

  // 1. Try LLM analysis first if API key configured
  const prompt = `Analyze the following resume text and output a valid JSON object matching this schema:
{
  "summary": "2-3 sentence executive professional summary",
  "skills": ["List of extracted technical and soft skills"],
  "education": ["Institution, degree, field of study, graduation year"],
  "experience": ["Company name, role title, duration, key accomplishments"],
  "projects": ["Project title, tech stack used, description"],
  "certifications": ["Certification name and issuing body"],
  "strengths": ["Key professional strengths found in this candidate's background"],
  "improvements": ["Actionable, constructive resume improvement recommendations"],
  "atsScore": 85 (a score between 0 and 100 based on ATS readability, structure, and clarity)
}

Resume Text:
"""
${rawText.slice(0, 10000)}
"""`;

  const systemInstruction = 'You are an expert career counselor, executive recruiter, and ATS algorithm specialist. Return ONLY valid raw JSON with no markdown backticks or commentary.';

  try {
    const aiResponse = await generateText(prompt, systemInstruction, true);
    if (aiResponse) {
      const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        rawText,
        summary: parsed.summary || 'Summary generated from resume analysis.',
        skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : extractSkillsFromText(rawText),
        education: Array.isArray(parsed.education) ? parsed.education : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Clear format', 'Relevant skillset'],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Quantify project outcomes with metrics'],
        atsScore: typeof parsed.atsScore === 'number' ? Math.min(100, Math.max(0, parsed.atsScore)) : 75
      };
    }
  } catch (err) {
    console.warn('[ResumeAnalyzer] AI parsing fallback activated:', err.message);
  }

  // 2. Intelligent Heuristic Rule-Based NLP Analysis
  const extractedSkills = extractSkillsFromText(rawText);
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const education = [];
  const projects = [];
  const experience = [];
  const certifications = [];

  const eduKeywords = ['university', 'college', 'bachelor', 'master', 'b.tech', 'b.e', 'degree', 'gpa', 'institute', 'school'];
  const projKeywords = ['project', 'built', 'developed', 'github', 'designed', 'application', 'system'];
  const expKeywords = ['intern', 'experience', 'worked', 'developer', 'engineer', 'lead', 'associate'];
  const certKeywords = ['certified', 'certification', 'license', 'aws certified', 'coursera', 'udemy'];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (eduKeywords.some(k => lower.includes(k)) && line.length > 15 && line.length < 150) {
      if (!education.includes(line)) education.push(line);
    } else if (projKeywords.some(k => lower.includes(k)) && line.length > 20 && line.length < 200) {
      if (!projects.includes(line)) projects.push(line);
    } else if (expKeywords.some(k => lower.includes(k)) && line.length > 20 && line.length < 200) {
      if (!experience.includes(line)) experience.push(line);
    } else if (certKeywords.some(k => lower.includes(k)) && line.length > 10 && line.length < 150) {
      if (!certifications.includes(line)) certifications.push(line);
    }
  }

  // Calculate ATS Score based on best-practice criteria
  let atsScore = 50;
  if (extractedSkills.length >= 5) atsScore += 15;
  if (education.length > 0) atsScore += 10;
  if (projects.length > 0) atsScore += 10;
  if (experience.length > 0) atsScore += 10;
  if (rawText.length > 400 && rawText.length < 4000) atsScore += 5;

  const strengths = [];
  if (extractedSkills.length >= 6) strengths.push(`Strong technical keyword density with ${extractedSkills.length} identified skills.`);
  if (projects.length > 0) strengths.push('Identified structured project portfolio items showcasing practical implementation.');
  if (education.length > 0) strengths.push('Clear academic qualifications presented.');
  if (strengths.length === 0) strengths.push('Solid baseline foundation for internship applications.');

  const improvements = [];
  if (extractedSkills.length < 5) improvements.push('Add more specific technical and programming tools/frameworks to your skills section.');
  if (!/\d+%|\d+x|\$\d+|\d+\s*users/i.test(rawText)) improvements.push('Include measurable metrics and quantified results (e.g. "improved load time by 30%").');
  if (experience.length === 0) improvements.push('Highlight relevant open-source contributions, academic research, or leadership roles.');
  improvements.push('Ensure standard section headers (Education, Skills, Experience, Projects) for optimal ATS machine parsing.');

  return {
    rawText,
    summary: `Candidate profile demonstrating technical proficiencies in ${extractedSkills.slice(0, 4).join(', ') || 'software development'}. Prepared for entry-level and internship engineering roles.`,
    skills: extractedSkills,
    education: education.slice(0, 3),
    projects: projects.slice(0, 4),
    experience: experience.slice(0, 3),
    certifications: certifications.slice(0, 3),
    strengths,
    improvements,
    atsScore: Math.min(100, atsScore)
  };
};

export default {
  analyzeResume
};
