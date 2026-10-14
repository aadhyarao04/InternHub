import { normalizeSkill } from './skillExtractor.js';
import { generateText } from './aiProvider.js';

export const analyzeSkillGap = async (studentSkills = [], internshipRequiredSkills = [], internshipTitle = '') => {
  const normalizedStudent = studentSkills.map(s => normalizeSkill(s).toLowerCase());
  const normalizedRequired = internshipRequiredSkills.map(s => normalizeSkill(s));

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of normalizedRequired) {
    if (normalizedStudent.includes(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const totalRequired = normalizedRequired.length || 1;
  const matchPercentage = Math.round((matchedSkills.length / totalRequired) * 100);

  // Recommendations generator
  const learningRecommendations = missingSkills.map(skill => ({
    skill,
    priority: ['React', 'Node.js', 'Python', 'SQL', 'TypeScript'].some(core => skill.toLowerCase().includes(core.toLowerCase()))
      ? 'HIGH'
      : 'MEDIUM',
    recommendedAction: `Complete a targeted project or tutorial demonstrating practical competency in ${skill}. Build a sample GitHub repository showcasing API or UI handling.`
  }));

  let aiAdvice = null;
  const prompt = `Student has skills: [${studentSkills.join(', ')}].
Target internship: "${internshipTitle}" requires: [${internshipRequiredSkills.join(', ')}].
The student matches ${matchedSkills.length}/${totalRequired} skills (${matchPercentage}%).
Missing skills: [${missingSkills.join(', ')}].
Provide a concise, encouraging 2-sentence career coaching recommendation for how this student can rapidly close these skill gaps to become interview-ready.`;

  try {
    aiAdvice = await generateText(prompt, 'You are an encouraging and practical tech career mentor.');
  } catch (err) {
    // Non-blocking
  }

  return {
    internshipTitle,
    totalRequired: normalizedRequired.length,
    matchedCount: matchedSkills.length,
    missingCount: missingSkills.length,
    matchPercentage,
    readinessLevel: matchPercentage >= 80 ? 'HIGH' : matchPercentage >= 50 ? 'MODERATE' : 'EMERGING',
    matchedSkills,
    missingSkills,
    recommendations: learningRecommendations,
    aiCoachingTip: aiAdvice || (missingSkills.length === 0
      ? 'Outstanding match! Your profile aligns strongly with this opportunity. Emphasize your key achievements during applications.'
      : `Prioritize gaining hands-on experience with ${missingSkills.slice(0, 2).join(' and ')} by building a small focused portfolio project before applying.`),
    disclaimer: 'This skill-gap analysis is an automated assessment of stated skills against posted requirements, provided for preparation guidance.'
  };
};

export default {
  analyzeSkillGap
};
