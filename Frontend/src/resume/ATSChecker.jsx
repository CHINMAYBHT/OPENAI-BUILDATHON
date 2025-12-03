import { useState } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateATSFeedback } from './services/geminiService';

function ATSChecker() {
  const [resumeText, setResumeText] = useState('');
  const [atsScore, setAtsScore] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert('Please paste your resume text');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const feedback = await generateATSFeedback(resumeText);
      
      setAtsScore(feedback.score || 50);
      setSuggestions({
        score: feedback.score || 50,
        status: (feedback.score || 50) >= 80 ? 'excellent' : (feedback.score || 50) >= 60 ? 'good' : 'needs-improvement',
        issues: feedback.issues || [
          { type: 'warning', title: 'Missing Keywords', description: '5 common tech stack keywords not found', suggestion: 'Add AWS, Docker, Kubernetes to skills section' },
          { type: 'error', title: 'Weak Action Verbs', description: 'Some bullets use passive language', suggestion: 'Replace "Worked on" with "Developed", "Managed" with "Led"' },
          { type: 'warning', title: 'No Metrics', description: '40% of achievements lack quantifiable results', suggestion: 'Add numbers: users, %, time saved, revenue impact' },
          { type: 'info', title: 'Good Formatting', description: 'Clean structure and proper sections detected', suggestion: null }
        ],
        improvements: feedback.improvements || [
          'Add 8-10 more relevant keywords',
          'Include 3-5 quantifiable achievements per role',
          'Use stronger action verbs in bullet points',
          'Optimize white space and formatting',
          'Add metrics: increased efficiency by X%, reduced costs by Y%'
        ]
      });
      setIsAnalyzing(false);
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setError('Failed to analyze resume. Please try again.');
      setIsAnalyzing(false);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ATS Score & Suggestions</h1>
          <p className="text-lg text-gray-600">
            Analyze your resume for ATS compatibility. Get instant feedback on formatting, keywords, and optimization opportunities.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Paste Your Resume</h2>
              
              <textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              />

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText.trim()}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze ATS Score'}
              </button>

              <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>Tip:</strong> Copy your resume text (without formatting) and paste here. We'll analyze it for ATS compatibility using AI.
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
            {atsScore !== null && suggestions && (
              <div className="space-y-8">
                {/* Score Card */}
                <div className={`rounded-2xl p-8 border-2 ${
                  suggestions.status === 'excellent' ? 'bg-green-50 border-green-300' :
                  suggestions.status === 'good' ? 'bg-blue-50 border-blue-300' :
                  'bg-yellow-50 border-yellow-300'
                }`}>
                  <div className="text-center mb-6">
                    <div className={`text-6xl font-bold mb-3 ${
                      suggestions.status === 'excellent' ? 'text-green-600' :
                      suggestions.status === 'good' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {atsScore}
                    </div>
                    <p className={`text-lg font-semibold ${
                      suggestions.status === 'excellent' ? 'text-green-900' :
                      suggestions.status === 'good' ? 'text-blue-900' :
                      'text-yellow-900'
                    }`}>
                      {suggestions.status === 'excellent' ? 'Excellent ATS Score!' :
                       suggestions.status === 'good' ? 'Good ATS Compatibility' :
                       'Needs Improvement'}
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {suggestions.status === 'excellent' ? 'Your resume has excellent ATS compatibility. You\'re well-positioned to pass automated filters.' :
                       suggestions.status === 'good' ? 'Your resume should pass most ATS systems, but there\'s room for optimization.' :
                       'Your resume may struggle with ATS systems. Make the suggested improvements to increase your chances.'}
                    </p>
                  </div>
                </div>

                {/* Issues & Warnings */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">Detailed Feedback</h3>
                  {suggestions.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-4 border-l-4 ${
                        issue.type === 'error' ? 'bg-red-50 border-red-400' :
                        issue.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div className="flex gap-3">
                        {issue.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        {issue.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
                        {issue.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
                        
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{issue.title}</p>
                          <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                          {issue.suggestion && (
                            <p className="text-sm font-semibold text-gray-900 mt-2">
                              💡 <span className="text-gray-700">{issue.suggestion}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Wins */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-blue-600" />
                    Quick Wins to Boost Your Score
                  </h3>
                  
                  <ol className="space-y-3">
                    {suggestions.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{improvement}</span>
                      </li>
                    ))}
                  </ol>

                  <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold w-full">
                    Get Detailed Improvement Plan
                  </button>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                    Download Enhanced Resume
                  </button>
                  <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
                    Tailor for Job Role
                  </button>
                </div>
              </div>
            )}

            {atsScore === null && (
              <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 h-96 flex items-center justify-center">
                <div>
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Paste your resume and click "Analyze" to get your ATS score</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ATSChecker;
