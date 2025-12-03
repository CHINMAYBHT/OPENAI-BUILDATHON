import { useState } from 'react';
import { ArrowLeft, Upload, AlertCircle, BookOpen, Award, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyzeSkillGaps } from './services/geminiService';

function SkillGapAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Default user skills for demo (would come from user profile)
  const defaultUserSkills = ['JavaScript', 'CSS', 'HTML', 'Basic React'];

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      alert('Please paste a job description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const gapAnalysis = await analyzeSkillGaps(jobDescription, defaultUserSkills);
      
      setAnalysis({
        jobTitle: 'Senior React Developer',
        requiredSkills: (gapAnalysis.requiredSkills || []).map(skill => ({
          skill,
          level: 'Advanced',
          status: !defaultUserSkills.some(s => s.toLowerCase().includes(skill.toLowerCase())) ? 'missing' : 'have'
        })),
        currentSkills: defaultUserSkills,
        matchingSkills: gapAnalysis.matchingSkills || defaultUserSkills.filter(skill =>
          (gapAnalysis.requiredSkills || []).some(req => req.toLowerCase().includes(skill.toLowerCase()))
        ),
        recommendations: {
          courses: (gapAnalysis.recommendations?.topCourses || []).map((course, idx) => ({
            name: course,
            platform: idx % 2 === 0 ? 'Udemy' : 'Frontend Masters',
            duration: `${20 + idx * 5} hours`,
            price: '$15'
          })),
          certifications: (gapAnalysis.recommendations?.certifications || []).map(cert => ({
            name: cert,
            provider: 'Amazon',
            effort: '3-4 months'
          })),
          projects: (gapAnalysis.recommendations?.projects || []).map((project, idx) => ({
            title: project,
            skills: 'React, Node.js, MongoDB',
            difficulty: idx % 2 === 0 ? 'Intermediate' : 'Advanced'
          }))
        },
        matchPercentage: Math.round((defaultUserSkills.filter(skill =>
          (gapAnalysis.matchingSkills || []).includes(skill)
        ).length / Math.max((gapAnalysis.requiredSkills || []).length, 1)) * 100),
        improvementPath: [
          '1. Start with TypeScript fundamentals (1-2 weeks)',
          '2. Complete React advanced patterns course (2-3 weeks)',
          '3. Build a React + TypeScript project (3-4 weeks)',
          '4. Learn Node.js basics (2-3 weeks)',
          '5. Learn GraphQL (2 weeks)',
          '6. Build a full-stack project (4-6 weeks)',
          'Total time to become job-ready: 3-4 months'
        ]
      });
      setIsAnalyzing(false);
    } catch (err) {
      console.error('Error analyzing skills:', err);
      setError('Failed to analyze job description. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Link to="/resume" className="flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Resume
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Skill Gap Analyzer</h1>
          <p className="text-lg text-gray-600">
            Upload a job description and we'll analyze required skills, suggest courses, and create a learning path.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Paste Job Description</h2>
              
              <textarea
                placeholder="Paste the job description or requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              />

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jobDescription.trim()}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Skills'}
              </button>

              <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>Tip:</strong> Paste the full job description to get the most accurate analysis of required skills and experience using AI.
                </p>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {analysis && (
              <div className="space-y-8">
                {/* Header with Match Percentage */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Skills Match Analysis</h3>
                      <p className="text-gray-600 text-sm mt-1">{analysis.jobTitle}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{analysis.matchPercentage}%</div>
                      <p className="text-sm text-gray-600">Match</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-500" 
                      style={{ width: `${analysis.matchPercentage}%` }}
                    ></div>
                  </div>

                  <p className="text-sm text-gray-700 mt-4">
                    You match {analysis.matchPercentage}% of the required skills. Follow the recommendations below to improve your fit for this role.
                  </p>
                </div>

                {/* Skills Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">Required Skills Analysis</h3>
                  
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="font-bold text-red-900 mb-3">Missing Skills</h4>
                    <div className="space-y-2">
                      {analysis.requiredSkills.filter(s => s.status === 'missing').map((skill, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-gray-700">{skill.skill}</span>
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">{skill.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {analysis.matchingSkills.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-bold text-green-900 mb-3">Skills You Already Have</h4>
                      <div className="space-y-2">
                        {analysis.matchingSkills.map((skill, idx) => (
                          <div key={idx} className="flex items-center">
                            <span className="text-green-600 font-bold mr-2">✓</span>
                            <span className="text-gray-700">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="space-y-6">
                  {/* Courses */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Recommended Courses
                    </h3>
                    <div className="space-y-3">
                      {analysis.recommendations.courses.map((course, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900">{course.name}</h4>
                            <span className="text-sm font-bold text-blue-600">{course.price}</span>
                          </div>
                          <p className="text-sm text-gray-600">{course.platform}</p>
                          <p className="text-xs text-gray-500 mt-2">⏱️ {course.duration}</p>
                          <button className="mt-3 text-blue-600 hover:text-blue-700 font-semibold text-sm">
                            View Course →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-600" />
                      Recommended Projects
                    </h3>
                    <div className="space-y-3">
                      {analysis.recommendations.projects.map((project, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-bold text-gray-900 mb-2">{project.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">Skills: {project.skills}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            project.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.difficulty}
                          </span>
                          <button className="mt-3 text-purple-600 hover:text-purple-700 font-semibold text-sm">
                            View Project →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      Certifications
                    </h3>
                    <div className="space-y-3">
                      {analysis.recommendations.certifications.map((cert, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-bold text-gray-900">{cert.name}</h4>
                          <p className="text-sm text-gray-600">by {cert.provider}</p>
                          <p className="text-xs text-gray-500 mt-2">⏱️ {cert.effort} of effort</p>
                          <button className="mt-3 text-amber-600 hover:text-amber-700 font-semibold text-sm">
                            Learn More →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Path */}
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
                    <h3 className="font-bold text-gray-900 mb-4">Your Personalized Learning Path</h3>
                    <div className="space-y-3">
                      {analysis.improvementPath.map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {idx < 7 ? idx + 1 : '✓'}
                          </span>
                          <span className="text-gray-700 pt-1">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex gap-3">
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                    Generate Learning Plan PDF
                  </button>
                  <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
                    Analyze Another Job
                  </button>
                </div>
              </div>
            )}

            {!analysis && (
              <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 h-96 flex items-center justify-center">
                <div>
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Paste a job description and click "Analyze" to see required skills and learning recommendations</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillGapAnalyzer;
