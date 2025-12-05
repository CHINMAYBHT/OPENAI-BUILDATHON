import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  X,
  Clock,
  Target,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Trophy,
  Menu,
  ArrowRight,
  Star,
  RefreshCw,
  BarChart,
  Zap
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faHome, faCode, faUser } from '@fortawesome/free-solid-svg-icons';

// Component to render text with code blocks
function SuggestionRenderer({ text }) {
  if (!text) return null;

  // Split text by code block markers
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const content = part.slice(3, -3).trim();
          const firstLineEnd = content.indexOf('\n');
          let language = '';
          let code = content;

          if (firstLineEnd !== -1) {
            language = content.slice(0, firstLineEnd).trim();
            code = content.slice(firstLineEnd + 1);
          }

          return (
            <pre key={index} className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{code}</code>
            </pre>
          );
        } else {
          // Regular text
          return (
            <span key={index} className="text-gray-700">
              {part}
            </span>
          );
        }
      })}
    </div>
  );
}

function SubmissionResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Strengths');

  // Get results from navigation state
  const results = location.state || {
    success: true,
    testCasesPassed: 2,
    totalTestCases: 3,
    code: '',
    problemId: 1,
    aiReview: null,
    readability_score: null,
    maintainability_score: null
  };

  useEffect(() => {
    // Check login status
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  // Calculate success rate percentage
  const successRate = (results.testCasesPassed / results.totalTestCases) * 100;

  // Use AI review data from results or fallback to generic
  const aiReview = results.aiReview || {
    strengths: [
      "Strong understanding of basic algorithms and data structures",
      "Good use of Hash Maps for O(1) lookup performance",
      "Clean code structure with meaningful variable names",
      "Efficient space complexity considerations",
      "Proper input validation and edge case handling"
    ],
    weaknesses: [
      "Optimize inner loop to reduce time complexity from O(n²) to O(n) - Consider using a HashSet for O(1) lookups instead of nested loops",
      "Add early return statements for invalid inputs to improve code readability and performance",
      "Consider using more descriptive variable names throughout the solution",
      "Add unit tests for all edge cases, especially empty arrays and single elements",
      "Missing comprehensive error handling for edge cases - implement proper null/undefined checks",
      "Include JSDoc comments for better documentation and maintainability"
    ],
    interview_perspective: [
      "You demonstrated solid problem-solving skills with a working solution. The interviewer would appreciate your clear thinking and structured approach, though they might ask about optimization opportunities.",
      "Shows good foundation in algorithm implementation, needs optimization focus"
    ],
    critical_issues: results.success
      ? []
      : ["Logic errors in edge case handling", "Incorrect time/space complexity", "Algorithm doesn't handle all edge cases properly, specifically: empty arrays, single elements, and negative numbers."],
    readability_score: results.readability_score || (results.success ? 8.5 : 6.2),
    maintainability_score: results.maintainability_score || (results.success ? 8.0 : 5.8),
    suggestions: `The primary suggestion is to implement the actual solution to the Maximum Subarray problem. This typically involves using Kadane's algorithm for optimal efficiency.

The function solve should accept the nums array as an argument and return the maximum sum.

Example:
\`\`\`javascript
function maxSubArray(nums) {
    if (!nums || nums.length === 0) {
        return 0; // Or throw an error, depending on requirements
    }

    let maxSoFar = nums[0];
    let currentMax = nums[0];

    for (let i = 1; i < nums.length; i++) {
        currentMax = Math.max(nums[i], currentMax + nums[i]);
        maxSoFar = Math.max(maxSoFar, currentMax);
    }

    return maxSoFar;
}
\`\`\`

Also, consider adding comments to explain complex parts of the logic and ensure variable names are descriptive.`,
  };

  const statusOptions = ['Strengths', 'Interview Perspective', 'Improvement Areas', 'Issues Found'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation - Similar to Problem Set Page */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm border-b">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <span className="text-lg font-bold text-gray-800">Job Builder</span>

            </div>

            {/* Right side navigation */}
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </Link>

              <Link
                to="/coding/problems"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faCode} />
                <span>Problems</span>
              </Link>

              <Link
                to="/coding/profile"
                className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <FontAwesomeIcon icon={faUser} className="text-blue-600" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mt-10">
        <div className="max-w-7xl mx-auto">

          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-4 mb-6">
              {results.success ? (
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-white" />
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {results.success ? 'Submission Successful!' : 'Submission Failed'}
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {results.success
                ? 'Great job! Your solution passed all test cases and has been accepted.'
                : 'Your solution didn\'t pass all test cases. Review the feedback below to improve.'
              }
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {/* Success Rate */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Success Rate</h3>
                <div className="relative h-32 w-32 mx-auto">
                  <svg className="transform -rotate-90 h-32 w-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - successRate / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{Math.round(successRate)}%</div>
                      <div className="text-sm text-gray-500">{results.testCasesPassed}/{results.totalTestCases}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Cases Passed */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Test Cases</h3>
                <div className="relative h-32 w-32 mx-auto">
                  <svg className="transform -rotate-90 h-32 w-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - (results.testCasesPassed / results.totalTestCases))}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">{results.testCasesPassed}/{results.totalTestCases}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Readability Score */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Readability</h3>
                <div className="relative h-32 w-32 mx-auto">
                  <svg className="transform -rotate-90 h-32 w-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#06b6d4"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - aiReview.readability_score / 10)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-600">{aiReview.readability_score}</div>
                      <div className="text-xs text-gray-500">/10</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintainability Score */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Maintainability</h3>
                <div className="relative h-32 w-32 mx-auto">
                  <svg className="transform -rotate-90 h-32 w-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#f97316"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - aiReview.maintainability_score / 10)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{aiReview.maintainability_score}</div>
                      <div className="text-xs text-gray-500">/10</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Review Section */}
          <div className="mt-32">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                AI Code Review & Feedback
              </h2>
            </div>

            {/* AI Review Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <tbody>
                  {/* Strengths Row */}
                  <tr className="border-b border-gray-100">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-800 w-1/4 border-r border-gray-100">
                      Strengths
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {aiReview.strengths && aiReview.strengths.slice(0, 5).map((strength, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 leading-relaxed">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>

                  {/* Interview Perspective Row */}
                  <tr className="border-b border-gray-100">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-800 border-r border-gray-100">
                      Interview Perspective
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {aiReview.interview_perspective && aiReview.interview_perspective.map((perspective, index) => (
                          <div key={index} className="text-sm text-gray-700 leading-relaxed">{perspective}</div>
                        ))}
                      </div>
                    </td>
                  </tr>

                  {/* Improvement Areas Row */}
                  <tr className="border-b border-gray-100">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-800 border-r border-gray-100">
                      Areas to Improve & Solutions
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {aiReview.weaknesses && aiReview.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex space-x-2">
                            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <span className="text-sm text-gray-700 leading-relaxed">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>

                  {/* Suggestions Row */}
                  {aiReview.suggestions && (
                    <tr className="border-b border-gray-100">
                      <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-800 border-r border-gray-100">
                        Suggestions
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 leading-relaxed">
                          <SuggestionRenderer text={aiReview.suggestions} />
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Critical Issues Found Row */}
                  {aiReview.critical_issues && aiReview.critical_issues.length > 0 && (
                    <tr>
                      <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-800 border-r border-gray-100">
                        Critical Issues Found
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {aiReview.critical_issues.map((issue, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 leading-relaxed">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

export default SubmissionResults;
