import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faPlay,
  faCheck,
  faCode,
  faCalendar,
  faHome,
  faBuilding,
  faUser
} from '@fortawesome/free-solid-svg-icons';

function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const { supabase } = await import('../utils/supabase');
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setError('Please log in to view your submissions');
        return;
      }

      const response = await fetch(`${apiBase}/api/gemini/submissions/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load submissions: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error('Error loading submissions:', err);
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
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Filter submissions based on search term
  const filteredSubmissions = submissions.filter(submission => {
    if (!searchTerm) return true;
    const problemTitle = submission.problems?.title || '';
    const problemId = submission.problem_id?.toString() || '';
    const searchLower = searchTerm.toLowerCase();
    return problemTitle.toLowerCase().includes(searchLower) || problemId.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <FontAwesomeIcon icon={faCode} size="3x" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading submissions</p>
          <p className="text-gray-600 text-sm">{error}</p>
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

              {/* Coding Page Button */}
              <Link
                to="/coding"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faCode} />
                <span>Coding</span>
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
            <p className="text-gray-600">Track your coding progress and review past submissions</p>

            {/* Search/Filter Input */}
            {submissions.length > 0 && (
              <div className="mt-6">
                <div className="max-w-md">

                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Type problem name or number..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <FontAwesomeIcon icon={faCode} size="3x" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No submissions yet</h3>
          <p className="text-gray-600 mb-6">Start solving problems to track your progress here</p>
          <button
            onClick={() => navigate('/coding/problems')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Problems
          </button>
        </div>
      ) : (
        <div>
          {/* Filter Results Info */}
          {searchTerm && (
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredSubmissions.length} of {submissions.length} submissions
            </div>
          )}

          {filteredSubmissions.length === 0 && searchTerm ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <FontAwesomeIcon icon={faCode} size="3x" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No submissions found</h3>
              <p className="text-gray-600 mb-6">
                No submissions match your search for "{searchTerm}". Try different keywords.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
              >
                Clear Search
              </button>
              <button
                onClick={() => navigate('/coding/problems')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Browse Problems
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              onClick={() => navigate(`/coding/submission/${submission.id}`)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {submission.problems?.title || `Problem ${submission.problem_id}`}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{submission.languages?.name || submission.language}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <FontAwesomeIcon icon={faCalendar} />
                      <span>{formatDate(submission.created_at)}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <FontAwesomeIcon icon={faClock} />
                      <span>{formatDuration(submission.total_time_ms)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(submission.final_status)}`}>
                    <FontAwesomeIcon
                      icon={submission.final_status === 'passed' ? faCheck : faPlay}
                      className="text-xs"
                    />
                    <span className="capitalize">{submission.final_status}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {submission.passed_count || 0} / {submission.total_tests || 0} tests passed
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Runtime:</span> {submission.readability_score || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Memory:</span> {submission.maintainability_score || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

          {/* Refresh button */}
          <div className="mt-8 text-center">
            <button
              onClick={loadSubmissions}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Refresh submissions ↻
            </button>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

export default SubmissionHistory;
