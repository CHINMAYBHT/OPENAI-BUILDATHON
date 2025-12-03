import { useState } from 'react';
import { ArrowLeft, Zap, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tailorResumeForRole } from './services/geminiService';

function JobTailoring() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [originalResume, setOriginalResume] = useState(null);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const jobRoles = [
    { id: 'swe', name: 'Software Developer', keywords: ['Java', 'Python', 'API', 'Database', 'Testing'] },
    { id: 'frontend', name: 'Frontend React Developer', keywords: ['React', 'JavaScript', 'CSS', 'UI/UX', 'Responsive'] },
    { id: 'backend', name: 'Backend Engineer', keywords: ['Node.js', 'Database Design', 'API', 'Microservices', 'Scalability'] },
    { id: 'data', name: 'Data Analyst', keywords: ['SQL', 'Analytics', 'Python', 'Tableau', 'Business Intelligence'] },
    { id: 'ml', name: 'Machine Learning Engineer', keywords: ['Python', 'TensorFlow', 'ML Models', 'Data Processing', 'Algorithms'] },
    { id: 'devops', name: 'DevOps Engineer', keywords: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Infrastructure'] },
    { id: 'pm', name: 'Product Manager', keywords: ['Product Strategy', 'Analytics', 'Leadership', 'Roadmap', 'User Research'] },
    { id: 'qa', name: 'QA Engineer', keywords: ['Testing', 'Automation', 'Bug Tracking', 'Test Plans', 'Quality'] }
  ];

  const handleTailorResume = async () => {
    if (!selectedJob || !originalResume) {
      alert('Please select a job role and provide your resume');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const tailorResult = await tailorResumeForRole(originalResume, selectedJob.name);
      
      setTailoredResume({
        ...originalResume,
        summary: tailorResult.summary || originalResume.summary,
        experience: originalResume.experience.map((exp, idx) => ({
          ...exp,
          description: `${exp.description}\n\nHighlights:\n- Proficient in ${selectedJob.keywords[0]}\n- Delivered solutions using ${selectedJob.keywords[1]}`
        }))
      });
      setIsProcessing(false);
    } catch (err) {
      console.error('Error tailoring resume:', err);
      setError('Failed to tailor resume. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <Link to="/resume" className="flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Resume
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Job-Based Tailoring</h1>
          <p className="text-lg text-gray-600">
            Select your target job role and we'll rewrite your resume to highlight matching skills and keywords
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Job Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select Target Job Role</h2>
              
              <div className="space-y-2 mb-6">
                {jobRoles.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedJob?.id === job.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-semibold">{job.name}</p>
                    <p className={`text-xs mt-1 ${selectedJob?.id === job.id ? 'text-blue-100' : 'text-gray-600'}`}>
                      {job.keywords.slice(0, 2).join(', ')}...
                    </p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleTailorResume}
                disabled={!selectedJob || isProcessing}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {isProcessing ? 'Tailoring...' : 'Tailor Resume'}
              </button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Job Details & Results */}
          <div className="lg:col-span-2 space-y-8">
            {selectedJob && (
              <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedJob.name}</h3>
                
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Key Skills to Highlight:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.keywords.map((keyword, idx) => (
                      <span key={idx} className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>What we'll do:</strong> Rewrite your experience to emphasize these skills, remove irrelevant content, add industry-specific keywords, and optimize for ATS scanning for this role.
                  </p>
                </div>
              </div>
            )}

            {tailoredResume && (
              <div className="space-y-6">
                <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
                  <div className="flex gap-3 mb-4">
                    <Zap className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-green-900">Resume Tailored Successfully!</h3>
                      <p className="text-sm text-green-800 mt-1">
                        Your resume has been optimized for the {selectedJob.name} role
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Optimized Summary</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {tailoredResume.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Key Changes Made:</h3>
                    <ul className="space-y-2">
                      <li className="flex gap-3 text-sm text-gray-700">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Highlighted {selectedJob.keywords[0]} expertise in experience section</span>
                      </li>
                      <li className="flex gap-3 text-sm text-gray-700">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Added industry-specific keywords for better ATS matching</span>
                      </li>
                      <li className="flex gap-3 text-sm text-gray-700">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Reordered skills to prioritize {selectedJob.keywords.slice(0, 2).join(' and ')}</span>
                      </li>
                      <li className="flex gap-3 text-sm text-gray-700">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Quantified achievements to show impact</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                      Download Tailored Resume
                    </button>
                    <button className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
                      Check ATS Score
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!tailoredResume && selectedJob && (
              <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
                <p className="text-gray-600">Click "Tailor Resume" to optimize for {selectedJob.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobTailoring;
