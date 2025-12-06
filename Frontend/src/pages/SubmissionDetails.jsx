import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faClock,
  faCheck,
  faTimes,
  faCode,
  faCalendar,
  faPlay,
  faHome,
  faBuilding,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import Editor from '@monaco-editor/react';

function SubmissionDetails() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check initial login status
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    // Listen for auth state changes
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      setIsLoggedIn(!!user);
    };

    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    loadSubmissionDetails();
  }, [submissionId]);

  const loadSubmissionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBase}/api/gemini/submission-details/${submissionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load submission details: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSubmission(data.submission);
    } catch (err) {
      console.error('Error loading submission details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Link to="/coding/submissions" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to submissions
        </Link>

        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <FontAwesomeIcon icon={faCode} size="3x" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading submission</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Link to="/coding/submissions" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to submissions
        </Link>

        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <FontAwesomeIcon icon={faCode} size="3x" />
          </div>
          <p className="text-red-600 font-medium mb-2">Submission not found</p>
          <p className="text-gray-600 text-sm">The submission may have been deleted or you may not have permission to view it.</p>
        </div>
      </div>
    );
  }



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

              {/* Companies Button */}
              <Link
                to="/coding/companies"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faBuilding} />
                <span>Companies</span>
              </Link>

              {/* Coding Button */}
              <Link
                to="/coding"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faCode} />
                <span>Coding</span>
              </Link>

              {/* Submissions Button */}
              <Link
                to="/coding/submissions"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
                title="View my submissions"
              >
                <FontAwesomeIcon icon={faCheck} />
                <span>Submissions</span>
              </Link>

              {/* User Profile Icon */}
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
      <main className="pt-24 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="p-6 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    {submission.problems?.title || `Problem ${submission.problem_id}`}
                  </h1>
                  <p className="text-gray-600">
                    {submission.problems?.description ? submission.problems.description.substring(0, 150) + '...' : ''}
                  </p>
                </div>

                <div className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full font-semibold text-sm ${getStatusColor(submission.final_status)}`}>
                  <FontAwesomeIcon
                    icon={submission.final_status === 'passed' ? faCheck : (submission.final_status === 'failed' ? faTimes : faPlay)}
                  />
                  <span className="capitalize">{submission.final_status}</span>
                </div>
              </div>

              {/* Submission metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Language</div>
                  <div className="font-semibold text-gray-900">{submission.languages?.name || submission.language}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Submitted</div>
                  <div className="font-semibold text-gray-900" title={formatDate(submission.created_at)}>
                    {new Date(submission.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Time Taken</div>
                  <div className="font-semibold text-gray-900">
                    {formatDuration(submission.total_time_ms)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tests Passed</div>
                  <div className="font-semibold text-gray-900">
                    {submission.passed_count || 0} / {submission.total_tests || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout - Code and Test Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Left Column - Code Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Submitted Code
              </h2>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">
                    {submission.languages?.name || submission.language}
                  </span>
                </div>
                <Editor
                  height="600px"
                  language={submission.language || 'javascript'}
                  value={submission.code || ''}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    folding: true,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all'
                  }}
                />
              </div>
            </div>

            {/* Right Column - Test Results */}
            {submission.submission_results && submission.submission_results.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Test Results
                </h2>
                <div className="space-y-4">
                  {submission.submission_results.map((result, index) => (
                    <div key={result.id || index} className="bg-white rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-900">Test Case {index + 1}</h3>
                        <div className="flex items-center space-x-3">
                          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {result.passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">{result.time_ms}ms</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs font-semibold text-gray-700 mb-2">Input</div>
                          <pre className="bg-gray-50 text-gray-800 p-3 rounded-lg text-xs overflow-x-auto border border-gray-200">{result.input || 'N/A'}</pre>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-700 mb-2">Expected Output</div>
                          <pre className="bg-gray-50 text-gray-800 p-3 rounded-lg text-xs overflow-x-auto border border-gray-200">{result.expected_output || 'N/A'}</pre>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-700 mb-2">Your Output</div>
                          <pre className={`p-3 rounded-lg text-xs overflow-x-auto border ${result.passed ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                            {result.actual_output || 'No output produced'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Code Review */}
          {submission.ai_code_reviews && submission.ai_code_reviews.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                AI Code Review & Feedback
              </h2>
              {submission.ai_code_reviews.map((review, index) => (
                <div key={review.id || index} className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200">
                  {/* Scores Grid - Use scores from submission table */}
                  {(submission.readability_score || submission.maintainability_score) && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Code Quality Scores</h3>
                      <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
                        {submission.readability_score && (
                          <div className="flex flex-col items-center">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-blue-50 border-4 border-blue-500 flex flex-col items-center justify-center mb-3 hover:scale-105 transition-transform">
                              <div className="text-4xl sm:text-5xl font-bold text-blue-600">{submission.readability_score}</div>
                              <div className="text-xs text-gray-500 font-medium">out of 10</div>
                            </div>
                            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Readability</div>
                            {review.readability_justification && (
                              <p className="text-xs text-gray-600 text-center max-w-xs leading-relaxed">{review.readability_justification}</p>
                            )}
                          </div>
                        )}
                        {submission.maintainability_score && (
                          <div className="flex flex-col items-center">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-green-50 border-4 border-green-500 flex flex-col items-center justify-center mb-3 hover:scale-105 transition-transform">
                              <div className="text-4xl sm:text-5xl font-bold text-green-600">{submission.maintainability_score}</div>
                              <div className="text-xs text-gray-500 font-medium">out of 10</div>
                            </div>
                            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Maintainability</div>
                            {review.maintainability_justification && (
                              <p className="text-xs text-gray-600 text-center max-w-xs leading-relaxed">{review.maintainability_justification}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {review.suggestions && (
                    <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-indigo-200">
                      <h4 className="font-bold text-indigo-900 mb-4 text-lg flex items-center gap-2">
                        <FontAwesomeIcon icon={faCode} className="text-indigo-600" />
                        AI Suggestions
                      </h4>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.suggestions}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Strengths */}
                    {review.strengths && review.strengths.length > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-200">
                        <h4 className="font-bold text-green-900 mb-4 text-lg flex items-center gap-2">
                          <FontAwesomeIcon icon={faCheck} className="text-green-600" />
                          Strengths
                        </h4>
                        <ul className="space-y-3">
                          {review.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-3">
                              <span className="text-green-500 text-lg mt-0.5 flex-shrink-0">✓</span>
                              <span className="flex-1">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses / Critical Issues */}
                    {(review.weaknesses || review.critical_issues) && (
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 sm:p-6 border border-orange-200">
                        <h4 className="font-bold text-orange-900 mb-4 text-lg flex items-center gap-2">
                          <FontAwesomeIcon icon={faTimes} className="text-orange-600" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-3">
                          {review.weaknesses && review.weaknesses.length > 0 && review.weaknesses.map((weakness, idx) => (
                            <li key={`weakness-${idx}`} className="text-sm text-gray-700 flex items-start gap-3">
                              <span className="text-orange-500 text-lg mt-0.5 flex-shrink-0">→</span>
                              <span className="flex-1">{weakness}</span>
                            </li>
                          ))}
                          {review.critical_issues && review.critical_issues.length > 0 && review.critical_issues.map((issue, idx) => (
                            <li key={`issue-${idx}`} className="text-sm text-red-700 flex items-start gap-3">
                              <span className="text-red-500 text-lg mt-0.5 flex-shrink-0">⚠</span>
                              <span className="flex-1 font-medium">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Interview Perspective */}
                  {review.interview_perspective && review.interview_perspective.length > 0 && (
                    <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-4 text-lg flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-purple-600" />
                        Interview Perspective
                      </h4>
                      <ul className="space-y-2">
                        {review.interview_perspective.map((point, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-3">
                            <span className="text-purple-500 text-lg mt-0.5 flex-shrink-0">•</span>
                            <span className="flex-1">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Review Date */}
                  {review.created_at && (
                    <div className="mt-6 text-center">
                      <p className="text-xs text-gray-500">
                        <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                        Review generated on {formatDate(review.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Performance Metrics (Fallback if no AI review) */}
          {(!submission.ai_code_reviews || submission.ai_code_reviews.length === 0) && (submission.readability_score || submission.maintainability_score) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Readability Score</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {submission.readability_score || 'N/A'}
                  </div>
                  <p className="text-blue-700 text-sm mt-1">Code clarity and structure</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Maintainability Score</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {submission.maintainability_score || 'N/A'}
                  </div>
                  <p className="text-green-700 text-sm mt-1">Code maintainability</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Submission ID: {submission.id}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SubmissionDetails;
