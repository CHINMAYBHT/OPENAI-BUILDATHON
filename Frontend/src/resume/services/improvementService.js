// Resume improvement utilities

// Strong action verbs for different roles
const ACTION_VERBS = {
  management: ['Led', 'Directed', 'Managed', 'Coordinated', 'Oversaw', 'Supervised', 'Orchestrated'],
  development: ['Developed', 'Designed', 'Built', 'Created', 'Engineered', 'Implemented', 'Architected'],
  analysis: ['Analyzed', 'Investigated', 'Evaluated', 'Assessed', 'Examined', 'Reviewed', 'Studied'],
  achievement: ['Achieved', 'Accomplished', 'Attained', 'Delivered', 'Succeeded', 'Completed', 'Realized'],
  improvement: ['Improved', 'Enhanced', 'Optimized', 'Streamlined', 'Accelerated', 'Increased', 'Maximized'],
  collaboration: ['Collaborated', 'Partnered', 'Worked', 'Cooperated', 'Coordinated', 'Liaised', 'Partnered'],
  communication: ['Communicated', 'Presented', 'Advocated', 'Articulated', 'Conveyed', 'Expressed', 'Drafted']
};

// Weak verbs to avoid
const WEAK_VERBS = ['worked', 'did', 'helped', 'was involved in', 'responsible for', 'assisted', 'handled', 'managed'];

// Metrics templates
const METRICS_TEMPLATES = [
  { pattern: /improved|enhanced|optimized/i, suggestion: 'by X%, saving $Y or Z hours' },
  { pattern: /led|managed|oversaw/i, suggestion: 'team of X people, delivered Y results' },
  { pattern: /developed|built|created/i, suggestion: 'used by X users/customers, processing Y daily' },
  { pattern: /increased|grew|expanded/i, suggestion: 'by X% to Y total' },
  { pattern: /reduced|decreased|cut/i, suggestion: 'by X% or from Y to Z' }
];

export const improveResume = (resumeData) => {
  const improved = { ...resumeData };
  
  // Improve experience descriptions
  improved.experience = improved.experience.map(exp => ({
    ...exp,
    description: improveDescription(exp.description)
  }));
  
  // Improve summary
  if (improved.summary) {
    improved.summary = improveSummary(improved.summary);
  }
  
  return improved;
};

export const improveDescription = (description) => {
  let improved = description;
  
  // Replace weak verbs
  WEAK_VERBS.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const replacement = ACTION_VERBS.development[Math.floor(Math.random() * ACTION_VERBS.development.length)];
    improved = improved.replace(regex, replacement);
  });
  
  // Add metrics if missing
  if (!improved.match(/\d+%|\d+\s*(users|customers|hours|days|weeks|months|years)/i)) {
    improved += ' (Consider adding metrics: users impacted, time saved, % improvement, etc.)';
  }
  
  return improved;
};

export const improveSummary = (summary) => {
  // Ensure it has strong keywords and action verbs
  let improved = summary;
  
  // Check for weak openings
  if (improved.startsWith('I am') || improved.startsWith('I have')) {
    improved = improved.substring(improved.indexOf(' ') + 1);
  }
  
  // Add quantifiable info if missing
  if (!improved.match(/\d+\+?\s*(years?|months?)/i)) {
    improved = improved.replace(/\b(experience|background)\b/i, '$& with proven results');
  }
  
  return improved;
};

export const generateMetrics = (experience) => {
  return experience.map(exp => ({
    ...exp,
    description: addMetricsToDescription(exp.description)
  }));
};

const addMetricsToDescription = (description) => {
  let improved = description;
  let metricsAdded = false;
  
  METRICS_TEMPLATES.forEach(template => {
    if (template.pattern.test(description) && !metricsAdded) {
      improved += ` ${template.suggestion}`;
      metricsAdded = true;
    }
  });
  
  return improved;
};

// Get strong action verb for context
export const getStrongActionVerb = (context) => {
  const verb = ACTION_VERBS[context] || ACTION_VERBS.achievement;
  return verb[Math.floor(Math.random() * verb.length)];
};

// Analyze resume for gaps
export const analyzeResumeGaps = (resumeData) => {
  const gaps = [];
  
  if (!resumeData.summary || resumeData.summary.length < 50) {
    gaps.push('Professional summary is missing or too short');
  }
  
  if (resumeData.experience.length === 0) {
    gaps.push('No work experience listed');
  } else {
    const expWithoutMetrics = resumeData.experience.filter(
      exp => !exp.description.match(/\d+%|\d+\s*(users|customers|hours)/)
    );
    if (expWithoutMetrics.length > 0) {
      gaps.push(`${expWithoutMetrics.length} experience items lack quantifiable metrics`);
    }
  }
  
  if (resumeData.skills.length < 5) {
    gaps.push('Fewer than 5 skills listed. Add more relevant skills');
  }
  
  if (!resumeData.education || resumeData.education.length === 0) {
    gaps.push('No education information provided');
  }
  
  const weakVerbs = resumeData.experience.filter(exp => 
    WEAK_VERBS.some(verb => new RegExp(`\\b${verb}\\b`, 'i').test(exp.description))
  );
  if (weakVerbs.length > 0) {
    gaps.push(`Use stronger action verbs instead of: ${WEAK_VERBS.join(', ')}`);
  }
  
  return gaps;
};

// Score resume quality
export const scoreResume = (resumeData) => {
  let score = 0;
  
  // Basic info: 20 points
  if (resumeData.fullName) score += 5;
  if (resumeData.email) score += 5;
  if (resumeData.phone) score += 5;
  if (resumeData.location) score += 5;
  
  // Summary: 15 points
  if (resumeData.summary && resumeData.summary.length > 50) score += 15;
  
  // Experience: 30 points
  if (resumeData.experience.length > 0) {
    score += 10;
    const expWithMetrics = resumeData.experience.filter(
      exp => exp.description.match(/\d+%|\d+\s*(users|customers|hours)/)
    );
    if (expWithMetrics.length === resumeData.experience.length) score += 10;
    score += Math.min(expWithMetrics.length * 2, 10);
  }
  
  // Education: 15 points
  if (resumeData.education && resumeData.education.length > 0) score += 15;
  
  // Skills: 20 points
  if (resumeData.skills && resumeData.skills.length >= 5) score += 20;
  else if (resumeData.skills) score += Math.min(resumeData.skills.length * 4, 20);
  
  return Math.min(score, 100);
};

// Format text with proper capitalization and punctuation
export const formatText = (text) => {
  return text
    .trim()
    .replace(/^./, str => str.toUpperCase())
    .replace(/\s{2,}/g, ' ')
    .replace(/([.!?])\s*([a-z])/g, '$1 $2'.toUpperCase());
};

// Remove duplicate skills
export const removeDuplicateSkills = (skills) => {
  return [...new Set(skills.map(skill => skill.toLowerCase()))]
    .map(skill => skill.charAt(0).toUpperCase() + skill.slice(1));
};
