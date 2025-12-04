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
    timeTaken: 45,
    totalTime: 60,
    code: '',
    problemId: 1
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

  // Calculate the circle progress percentage
  const timeProgress = ((results.totalTime - results.timeTaken) / results.totalTime) * 100;
  const testProgress = (results.testCasesPassed / results.totalTestCases) * 100;

  // Generate AI review data
  const getAIReview = () => {
    const strengthAreas = [
      "Strong understanding of basic algorithms and data structures",
      "Good use of Hash Maps for O(1) lookup performance",
      "Clean code structure with meaningful variable names",
      "Efficient space complexity considerations",
      "Proper input validation and edge case handling"
    ];

    const areasToImproveAndSuggestions = [
      "Optimize inner loop to reduce time complexity from O(n²) to O(n) - Consider using a HashSet for O(1) lookups instead of nested loops",
      "Add early return statements for invalid inputs to improve code readability and performance",
      "Consider using more descriptive variable names throughout the solution",
      "Add unit tests for all edge cases, especially empty arrays and single elements",
      "Missing comprehensive error handling for edge cases - implement proper null/undefined checks",
      "Include JSDoc comments for better documentation and maintainability"
    ];

    const companyReadiness = [
      "Google - Entry level role preparation",
      "Amazon - Good foundation, needs optimization",
      "Meta - Strong on data structures, improve problem solving speed",
      "Microsoft - Excellent clean code practices"
    ];

    const interviewFeedback = results.success
      ? "You demonstrated solid problem-solving skills with a working solution. The interviewer would appreciate your clear thinking and structured approach, though they might ask about optimization opportunities."
      : "Your approach shows understanding of the problem, but there are implementation issues that need fixing. The interviewer would push for debugging skills and cleaner code structure.";

    return {
      strengthAreas,
      areasToImproveAndSuggestions,
      companyReadiness,
      interviewFeedback,
      readabilityScore: results.success ? 8.5 : 6.2,
      maintainabilityScore: results.success ? 8.0 : 5.8,
      hiddenFlaws: results.success
        ? ["Minor variable naming inconsistencies", "Could add input bounds checking"]
        : ["Logic errors in edge case handling", "Incorrect time/space complexity", "Poor error messaging"],
      failureReason: results.success
        ? null
        : "Algorithm doesn't handle all edge cases properly, specifically: empty arrays, single elements, and negative numbers."
    };
  };

const aiReview = getAIReview();

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
            {/* Time Taken */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Time Taken</h3>
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
                      stroke="#3b82f6"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - timeProgress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{results.timeTaken}m</div>
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
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - testProgress / 100)}`}
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
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - aiReview.readabilityScore / 10)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-600">{aiReview.readabilityScore}</div>
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
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - aiReview.maintainabilityScore / 10)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{aiReview.maintainabilityScore}</div>
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
                        {aiReview.strengthAreas.slice(0, 3).map((strength, index) => (
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
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {aiReview.interviewFeedback}
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
                        {aiReview.areasToImproveAndSuggestions.map((item, index) => (
                          <div key={index} className="flex space-x-2">
                            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>

                  {/* Critical Issues Found Row */}
                  {aiReview.hiddenFlaws.length > 0 && (
                    <tr>
                      <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-800 border-r border-gray-100">
                        Critical Issues Found
                      </td>
                      <td className="px-6 py-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            {aiReview.hiddenFlaws.map((flaw, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700 leading-relaxed">{flaw}</span>
                              </div>
                            ))}
                          </div>
                          {aiReview.failureReason && (
                            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <FontAwesomeIcon icon={faTimes} className="text-red-600 w-4 h-4" />
                                <span className="font-semibold text-red-800 text-sm">Failure Analysis</span>
                              </div>
                              <p className="text-xs text-red-700 leading-relaxed">{aiReview.failureReason}</p>
                            </div>
                          )}
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
