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

  const handleLogout = async () => {
    try {
      // Sign out from Supabase (handles OAuth and regular auth)
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }

      // Clear local storage
      localStorage.removeItem('user');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Supabase logout fails, clear local data
      localStorage.removeItem('user');
      setIsLoggedIn(false);
    }
  };

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

              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/coding/submissions" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to submissions
            </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {submission.problems?.title || `Problem ${submission.problem_id}`}
            </h1>
            <p className="text-gray-600 mb-4">
              {submission.problems?.description ? submission.problems.description.substring(0, 100) + '...' : ''}
            </p>
          </div>

          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${getStatusColor(submission.final_status)}`}>
            <FontAwesomeIcon
              icon={submission.final_status === 'passed' ? faCheck : (submission.final_status === 'failed' ? faTimes : faPlay)}
              className="text-sm"
            />
            <span className="capitalize">{submission.final_status}</span>
          </div>
        </div>

        {/* Submission metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600">Language</div>
            <div className="font-medium">{submission.languages?.name || submission.language}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Submitted</div>
            <div className="font-medium" title={formatDate(submission.created_at)}>
              <FontAwesomeIcon icon={faCalendar} className="mr-1" />
              {formatDate(submission.created_at)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Time Taken</div>
            <div className="font-medium">
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              {formatDuration(submission.total_time_ms)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Tests Passed</div>
            <div className="font-medium">
              {submission.passed_count || 0} / {submission.total_tests || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Code Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Submitted Code</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              {submission.languages?.name || submission.language}
            </span>
          </div>
          <Editor
            height="500px"
            language={submission.language || 'javascript'}
            value={submission.code || ''}
            theme="vs-light"
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

      {/* Test Results */}
      {submission.submission_results && submission.submission_results.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="space-y-4">
            {submission.submission_results.map((result, index) => (
              <div key={result.id || index} className="border border-gray-200 rounded-lg p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Test Case {index + 1}</h3>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <FontAwesomeIcon
                      icon={result.passed ? faCheck : faTimes}
                      className="text-xs"
                    />
                    <span>{result.passed ? 'Passed' : 'Failed'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Input</h4>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200">
                      {result.input || 'N/A'}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Expected Output</h4>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200">
                      {result.expected_output || 'N/A'}
                    </pre>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Your Output</h4>
                  <pre className={`p-4 rounded-lg text-sm overflow-x-auto border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {result.actual_output || 'N/A'}
                  </pre>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Runtime: {result.time_ms}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {(submission.readability_score || submission.maintainability_score) && (
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
        <Link
          to={`/coding/problem/${submission.problem_id}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Problem Again
        </Link>

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
