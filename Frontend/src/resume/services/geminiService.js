import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Initialize Gemini client
const geminiClient = axios.create({
  baseURL: GEMINI_API_URL,
  params: {
    key: GEMINI_API_KEY
  }
});

// Generate resume content using Gemini
export const generateResumeContent = async (prompt) => {
  try {
    const response = await geminiClient.post('', {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    if (response.data.candidates && response.data.candidates.length > 0) {
      return response.data.candidates[0].content.parts[0].text;
    }
    return '';
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw error;
  }
};

// Improve resume experience description
export const improveExperienceDescription = async (description) => {
  const prompt = `You are an expert resume writer. Improve this work experience description by:
1. Using strong action verbs
2. Adding specific metrics and quantifiable achievements
3. Making it concise and impactful (2-3 bullet points max)
4. Using professional language

Original description: "${description}"

Provide only the improved bullet points, no explanations.`;

  return generateResumeContent(prompt);
};

// Generate resume summary
export const generateResumeSummary = async (resumeData) => {
  const prompt = `Generate a concise, impactful professional summary (2-3 sentences) for a resume based on this information:
- Name: ${resumeData.fullName}
- Job Title/Role: ${resumeData.experience?.[0]?.position || 'Professional'}
- Key Skills: ${resumeData.skills?.slice(0, 5).join(', ') || 'Various'}
- Years of Experience: ${resumeData.experience?.length || '0'} positions

The summary should highlight unique value and key strengths.`;

  return generateResumeContent(prompt);
};

// Tailor resume for job role
export const tailorResumeForRole = async (resumeData, jobRole) => {
  const prompt = `You are an expert resume optimizer. Tailor this resume for a "${jobRole}" position.

Current resume data:
- Experience: ${resumeData.experience?.map(e => e.position).join(', ') || 'N/A'}
- Skills: ${resumeData.skills?.join(', ') || 'N/A'}
- Summary: ${resumeData.summary || 'N/A'}

Please provide:
1. An optimized professional summary (1-2 sentences) specific to ${jobRole}
2. 3-5 key skills to highlight for this role
3. Bullet points to emphasize in experience related to this role

Format as JSON with keys: summary, keySkills (array), experienceHighlights (array)`;

  const response = await generateResumeContent(prompt);
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Error parsing Gemini response:', e);
  }
  return { summary: '', keySkills: [], experienceHighlights: [] };
};

// Analyze skill gaps
export const analyzeSkillGaps = async (jobDescription, userSkills) => {
  const prompt = `Analyze the skill gaps between a job description and a candidate's current skills.

Job Description:
${jobDescription}

Candidate's Current Skills: ${userSkills.join(', ')}

Please provide JSON response with:
1. requiredSkills: Array of skills mentioned in job description
2. missingSkills: Array of skills candidate doesn't have
3. matchingSkills: Array of skills candidate already has
4. recommendations: Object with:
   - topCourses: Array of course names to take
   - certifications: Array of certifications to pursue
   - projects: Array of project ideas to build

Format response as valid JSON only.`;

  const response = await generateResumeContent(prompt);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Error parsing skill gap response:', e);
  }
  return { requiredSkills: [], missingSkills: [], matchingSkills: [], recommendations: {} };
};

// Check ATS score
export const generateATSFeedback = async (resumeText) => {
  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume text and provide feedback:

Resume Text:
${resumeText}

Provide JSON response with:
1. score: Number 0-100
2. issues: Array of objects with { type: 'error'|'warning'|'info', title: string, description: string, suggestion: string }
3. improvements: Array of specific improvements to make

Consider:
- Formatting and readability
- Use of keywords
- Action verb strength
- Quantifiable metrics
- Relevant skills inclusion

Format response as valid JSON only.`;

  const response = await generateResumeContent(prompt);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Error parsing ATS feedback:', e);
  }
  return { score: 50, issues: [], improvements: [] };
};

// Generate cover letter
export const generateCoverLetter = async (resumeData, jobDescription, companyName) => {
  const prompt = `Generate a professional cover letter for a ${resumeData.experience?.[0]?.position || 'job'} position.

Candidate Details:
- Name: ${resumeData.fullName}
- Background: ${resumeData.summary || 'Experienced professional'}
- Key Skills: ${resumeData.skills?.slice(0, 5).join(', ')}

Company: ${companyName || 'the company'}
Job Description: ${jobDescription}

The cover letter should:
1. Be 3-4 paragraphs
2. Highlight relevant experience and skills
3. Show enthusiasm for the role
4. Include specific details from the job description
5. End with a professional closing

Write the complete cover letter body (no salutation).`;

  return generateResumeContent(prompt);
};

export default {
  generateResumeContent,
  improveExperienceDescription,
  generateResumeSummary,
  tailorResumeForRole,
  analyzeSkillGaps,
  generateATSFeedback,
  generateCoverLetter
};
