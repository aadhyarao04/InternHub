/**
 * Comprehensive Skill Taxonomy & Normalization Engine
 */

export const SKILL_TAXONOMY = {
  // Frontend
  'react': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'angular': 'Angular',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'html': 'HTML5',
  'html5': 'HTML5',
  'css': 'CSS3',
  'css3': 'CSS3',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'redux': 'Redux',
  'zustand': 'Zustand',

  // Backend
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node': 'Node.js',
  'express': 'Express.js',
  'expressjs': 'Express.js',
  'python': 'Python',
  'django': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',
  'java': 'Java',
  'spring': 'Spring Boot',
  'springboot': 'Spring Boot',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'dotnet': '.NET',
  'golang': 'Go',
  'go': 'Go',
  'ruby': 'Ruby',
  'rails': 'Ruby on Rails',
  'rust': 'Rust',

  // Databases
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mysql': 'MySQL',
  'sqlite': 'SQLite',
  'redis': 'Redis',
  'elasticsearch': 'Elasticsearch',
  'prisma': 'Prisma',
  'mongoose': 'Mongoose',

  // Cloud & DevOps
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'azure': 'Microsoft Azure',
  'gcp': 'Google Cloud Platform',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'git': 'Git',
  'github': 'GitHub',
  'ci/cd': 'CI/CD',
  'linux': 'Linux',

  // AI & Data
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'artificial intelligence': 'Artificial Intelligence',
  'ai': 'Artificial Intelligence',
  'nlp': 'Natural Language Processing',
  'computer vision': 'Computer Vision',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scikit-learn': 'Scikit-Learn',
  'sql': 'SQL',
  'nosql': 'NoSQL',
  'data structures': 'Data Structures & Algorithms',
  'dsa': 'Data Structures & Algorithms',

  // Concepts & Soft Skills
  'rest api': 'REST APIs',
  'restful api': 'REST APIs',
  'graphql': 'GraphQL',
  'microservices': 'Microservices',
  'agile': 'Agile / Scrum',
  'system design': 'System Design',
  'problem solving': 'Problem Solving',
  'communication': 'Communication',
  'teamwork': 'Teamwork',
  'leadership': 'Leadership'
};

export const normalizeSkill = (skill) => {
  if (!skill) return '';
  const cleaned = skill.trim().toLowerCase();
  return SKILL_TAXONOMY[cleaned] || skill.trim();
};

export const extractSkillsFromText = (text) => {
  if (!text) return [];
  const lowerText = ` ${text.toLowerCase().replace(/[^a-z0-9#+.]/g, ' ')} `;
  const foundSkills = new Set();

  for (const [key, normalized] of Object.entries(SKILL_TAXONOMY)) {
    // Exact word boundary matching
    const regex = new RegExp(`(?:^|[\\s,;:.()\\[\\]/])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[\\s,;:.()\\[\\]/])`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.add(normalized);
    }
  }

  return Array.from(foundSkills);
};

export default {
  SKILL_TAXONOMY,
  normalizeSkill,
  extractSkillsFromText
};
