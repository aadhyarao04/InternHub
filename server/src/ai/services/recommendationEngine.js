import Internship from '../../models/Internship.js';
import User from '../../models/User.js';
import { normalizeSkill } from './skillExtractor.js';

export const getRecommendationsForStudent = async (studentId, limit = 8) => {
  const student = await User.findById(studentId);
  if (!student) return [];

  const studentSkills = (student.profile?.skills || []).map(s => normalizeSkill(s).toLowerCase());
  const prefs = student.profile?.careerPreferences || {};
  const targetRoles = (prefs.targetRoles || []).map(r => r.toLowerCase());
  const preferredLocations = (prefs.preferredLocations || []).map(l => l.toLowerCase());
  const workModes = prefs.workModes || [];
  const minStipend = prefs.minimumStipend || 0;

  // Find active published internships
  const internships = await Internship.find({
    status: 'PUBLISHED',
    applicationDeadline: { $gte: new Date() }
  }).populate('companyId', 'name logoUrl industry location verificationStatus');

  const scored = internships.map((internship) => {
    let score = 0;
    const reasons = [];

    // 1. Skill overlap (up to 50 points)
    const required = (internship.requiredSkills || []).map(s => normalizeSkill(s).toLowerCase());
    const matched = required.filter(s => studentSkills.includes(s));
    if (required.length > 0) {
      const skillScore = (matched.length / required.length) * 50;
      score += skillScore;
      if (matched.length > 0) {
        reasons.push(`Matches ${matched.length} of ${required.length} required skills (${matched.slice(0, 3).join(', ')})`);
      }
    }

    // 2. Role preference (up to 20 points)
    const titleLower = internship.title.toLowerCase();
    const roleMatched = targetRoles.some(role => titleLower.includes(role));
    if (roleMatched) {
      score += 20;
      reasons.push('Aligns directly with your target career roles');
    }

    // 3. Work mode preference (up to 15 points)
    if (workModes.length > 0 && workModes.includes(internship.workMode)) {
      score += 15;
      reasons.push(`Matches your ${internship.workMode.toLowerCase()} work mode preference`);
    } else if (internship.workMode === 'REMOTE') {
      score += 10;
      reasons.push('Remote opportunity with high flexibility');
    }

    // 4. Location match (up to 10 points)
    const locLower = internship.location.toLowerCase();
    if (preferredLocations.some(l => locLower.includes(l))) {
      score += 10;
      reasons.push(`Located in your preferred region (${internship.location})`);
    }

    // 5. Stipend threshold (up to 5 points)
    if (internship.stipend?.amount >= minStipend && internship.stipend.amount > 0) {
      score += 5;
    }

    if (reasons.length === 0) {
      reasons.push('Recommended opportunity in your domain of interest');
    }

    return {
      internship,
      matchScore: Math.round(score),
      matchedSkillsCount: matched.length,
      reasons
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
};

export default {
  getRecommendationsForStudent
};
