import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Editor from '@monaco-editor/react';
import {
  faHome,
  faCode,
  faUser,
  faTrophy,
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
  faBook,
  faClock
} from '@fortawesome/free-solid-svg-icons';

function TestReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { test, isViewOnly } = location.state || {};
  const [selectedProblem, setSelectedProblem] = useState(0);

  useEffect(() => {
    if (!test) {
      navigate('/coding/mock-tests');
      return;
    }
    window.scrollTo(0, 0);
  }, [test, navigate]);

  if (!test) {
    return null;
  }

  const scorePercentage = Math.round((test.solved / test.questions) * 100);
  const currentProblem = test.problems && test.problems[selectedProblem];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white shadow-sm">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-800">Job Builder</span>
            </div>
            
            {/* Right side navigation */}
            <div className="flex items-center space-x-6">
              {/* Home Button */}
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </Link>
              
              {/* Coding Button */}
              <Link 
                to="/coding/mock-tests" 
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faCode} />
                <span>Tests</span>
              </Link>
              
              {/* User Profile Icon */}
              <Link 
                to="/coding/profile" 
                className="p-3 rounded-lg bg-primary-100 hover:bg-primary-200 transition-colors"
              >
                <FontAwesomeIcon icon={faUser} className="text-primary-600" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6 sm:px-8 lg:px-12 w-full">
        <div className="w-full">
          {/* Test Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] py-16 px-8 mb-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{test.name}</h1>
                <div className="flex gap-4 text-sm text-blue-100">
                  <span><strong>Company:</strong> {test.company}</span>
                  <span><strong>Topic:</strong> {test.topic}</span>
                  <span><strong>Date:</strong> {new Date(test.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white mb-2">{scorePercentage}%</div>
                <div className="text-blue-100 font-semibold mb-3">{test.solved}/{test.questions} Solved</div>
                <div className="flex items-center gap-2 text-sm text-blue-100 font-medium">
                  <FontAwesomeIcon icon={faClock} className="text-lg" />
                  <span>Time Taken: {test.duration}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-blue-400 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${scorePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Content Grid */}
          {test.problems && test.problems.length > 0 ? (
            <div className="space-y-8">
              {/* Problems Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {test.problems.map((problem, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedProblem(idx)}
                    className={`text-left transition-all duration-300 rounded-2xl p-6 border-2 overflow-hidden group hover:shadow-lg hover:-translate-y-1 ${
                      selectedProblem === idx 
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-lg -translate-y-1' 
                        : 'bg-white/80 backdrop-blur-md border-gray-200/50 shadow-[0_4px_20px_0_rgba(0,0,0,0.08)]'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          problem.status === 'solved' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {problem.status === 'solved' ? '✓' : '✗'}
                        </div>
                        <span className="text-2xl font-bold text-gray-400 group-hover:text-blue-400 transition-colors">#{idx + 1}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>

                    {/* Problem Title */}
                    <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {problem.title}
                    </h3>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 text-sm font-semibold ${
                      problem.status === 'solved' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {problem.status === 'solved' ? (
                        <>
                          <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                          Solved
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                          Unsolved
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Solution Viewer - Full Width */}
              {currentProblem && (
                <div className="bg-white/80  rounded-2xl overflow-hidden">
                  {/* Solution Content */}
                  <div className="p-8">
                    {currentProblem.userCode ? (
                      <div>
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wide text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                              {currentProblem.language.toUpperCase()} Solution
                            </span>
                          </div>
                          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-sm">
                            <Editor
                              height="400px"
                              language={currentProblem.language}
                              value={currentProblem.userCode}
                              options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 14,
                                fontFamily: 'Monaco, Menlo, Ubuntu Mono',
                                padding: { top: 16, bottom: 16 },
                                lineHeight: 1.6
                              }}
                              theme="vs-light"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <span className="text-3xl">—</span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg mb-2">No Solution Submitted</p>
                        <p className="text-gray-600">This problem was not attempted during the test.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_0_rgba(0,0,0,0.08)] border border-gray-200/50 p-12 text-center">
              <FontAwesomeIcon icon={faTrophy} className="text-6xl text-primary-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Completed</h2>
              <p className="text-gray-600 mb-6">You scored {scorePercentage}% on this test</p>
              <Link
                to="/coding/mock-tests"
                className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Back to History
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestReview;
