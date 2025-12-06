import { useState, useEffect, useRef } from 'react';
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
  faUser,
  faSearch,
  faSort,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { HiFilter } from 'react-icons/hi';

function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const navigate = useNavigate();
  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  // Get unique languages for filter
  const uniqueLanguages = [...new Set(submissions.map(s => s.languages?.name || s.language).filter(Boolean))];

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter(submission => {
      // Search filter
      if (searchTerm) {
        const problemTitle = submission.problems?.title || '';
        const problemId = submission.problem_id?.toString() || '';
        const searchLower = searchTerm.toLowerCase();
        if (!problemTitle.toLowerCase().includes(searchLower) && !problemId.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && submission.final_status !== statusFilter) {
        return false;
      }

      // Language filter
      if (languageFilter !== 'all') {
        const lang = submission.languages?.name || submission.language;
        if (lang !== languageFilter) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(b.created_at) - new Date(a.created_at);
          break;
        case 'status':
          comparison = a.final_status.localeCompare(b.final_status);
          break;
        case 'tests':
          comparison = (b.passed_count / b.total_tests) - (a.passed_count / a.total_tests);
          break;
        case 'problem':
          const titleA = a.problems?.title || '';
          const titleB = b.problems?.title || '';
          comparison = titleA.localeCompare(titleB);
          break;
        default:
          return 0;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });

  const clearFilters = () => {
    setStatusFilter('all');
    setLanguageFilter('all');
    setSearchTerm('');
  };

  const clearSort = () => {
    setSortBy('date');
    setSortOrder('desc');
  };

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
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-in {
          animation: slideIn 0.2s ease-out forwards;
        }
      `}</style>

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
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              My <span className="gradient-text">Submissions</span>
            </h1>
            <p className="text-xl text-gray-600">
              Track your coding progress and review past submissions
            </p>
          </div>

          {/* Statistics Cards */}
          {submissions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{submissions.length}</h3>
                  <p className="text-gray-600">Total Submissions</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {submissions.filter(s => s.final_status === 'passed').length}
                  </h3>
                  <p className="text-gray-600">Passed</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {submissions.filter(s => s.final_status === 'failed').length}
                  </h3>
                  <p className="text-gray-600">Failed</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {Math.round((submissions.filter(s => s.final_status === 'passed').length / submissions.length) * 100)}%
                  </h3>
                  <p className="text-gray-600">Success Rate</p>
                </div>
              </div>
            </div>
          )}

          {submissions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
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
            <>
              {/* Search and Controls Bar */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left side - Search */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search by problem name or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                  {/* Middle - Sort and Filter */}
                  <div className="flex items-center space-x-3">
                    {/* Sort dropdown */}
                    <div className="relative" ref={sortRef}>
                      <button
                        onClick={() => {
                          setShowSortDropdown(!showSortDropdown);
                          if (showFilterDropdown) setShowFilterDropdown(false);
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faSort} className="text-gray-600" />
                      </button>

                      {showSortDropdown && (
                        <div className="absolute left-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-10 animate-in">
                          <div className="px-4 py-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Sort By</h4>
                            {[
                              { value: 'date', label: 'Date' },
                              { value: 'problem', label: 'Problem Name' },
                              { value: 'status', label: 'Status' },
                              { value: 'tests', label: 'Success Rate' }
                            ].map(option => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSortBy(option.value);
                                  setShowSortDropdown(false);
                                }}
                                className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${sortBy === option.value ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                  }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="px-4 py-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Order</h4>
                            <button
                              onClick={() => {
                                setSortOrder('asc');
                                setShowSortDropdown(false);
                              }}
                              className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${sortOrder === 'asc' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                }`}
                            >
                              Ascending
                            </button>
                            <button
                              onClick={() => {
                                setSortOrder('desc');
                                setShowSortDropdown(false);
                              }}
                              className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${sortOrder === 'desc' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                }`}
                            >
                              Descending
                            </button>
                          </div>

                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="px-4 py-2">
                            <button
                              onClick={() => {
                                clearSort();
                                setShowSortDropdown(false);
                              }}
                              className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 text-red-600"
                            >
                              Clear Sort
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Filter dropdown */}
                    <div className="relative" ref={filterRef}>
                      <button
                        onClick={() => {
                          setShowFilterDropdown(!showFilterDropdown);
                          if (showSortDropdown) setShowSortDropdown(false);
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <HiFilter className="text-gray-600 text-lg" style={{ stroke: 'currentColor', fill: 'transparent', strokeWidth: 1.5 }} />
                      </button>

                      {showFilterDropdown && (
                        <div className="absolute left-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-10 animate-in">
                          <div className="px-4 py-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Status</h4>
                            {['all', 'passed', 'failed'].map(status => (
                              <button
                                key={status}
                                onClick={() => {
                                  setStatusFilter(status);
                                  setShowFilterDropdown(false);
                                }}
                                className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 capitalize ${statusFilter === status ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                  }`}
                              >
                                {status === 'all' ? 'All Status' : status}
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="px-4 py-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Language</h4>
                            <div className="max-h-40 overflow-y-auto scrollbar-hide">
                              <button
                                onClick={() => {
                                  setLanguageFilter('all');
                                  setShowFilterDropdown(false);
                                }}
                                className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${languageFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                  }`}
                              >
                                All Languages
                              </button>
                              {uniqueLanguages.map(lang => (
                                <button
                                  key={lang}
                                  onClick={() => {
                                    setLanguageFilter(lang);
                                    setShowFilterDropdown(false);
                                  }}
                                  className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${languageFilter === lang ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                    }`}
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="px-4 py-2">
                            <button
                              onClick={() => {
                                clearFilters();
                                setShowFilterDropdown(false);
                              }}
                              className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 text-red-600"
                            >
                              Clear Filters
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Stats */}
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-900 font-medium">{filteredSubmissions.length}</span> / {submissions.length} Submissions
                  </div>
                </div>
              </div>

              {/* Submissions Table */}
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                  <div className="text-gray-400 mb-4">
                    <FontAwesomeIcon icon={faCode} size="3x" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No submissions found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search term</p>
                  <button
                    onClick={() => {
                      clearFilters();
                      setSearchTerm('');
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-transparent">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent">
                        {filteredSubmissions.map((submission) => (
                          <tr
                            key={submission.id}
                            onClick={() => navigate(`/coding/submission/${submission.id}`)}
                            className="hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {submission.problems?.title || `Problem ${submission.problem_id}`}
                                </div>
                                {submission.problems?.difficulty && (
                                  <span className={`text-xs font-semibold ${getDifficultyColor(submission.problems.difficulty)}`}>
                                    {submission.problems.difficulty}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {submission.languages?.name || submission.language}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.final_status)}`}>
                                <FontAwesomeIcon
                                  icon={submission.final_status === 'passed' ? faCheck : faPlay}
                                  className="text-xs"
                                />
                                <span className="capitalize">{submission.final_status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-900 font-medium">
                                  {submission.passed_count || 0} / {submission.total_tests || 0}
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${submission.final_status === 'passed' ? 'bg-green-500' : 'bg-red-500'
                                      }`}
                                    style={{ width: `${(submission.passed_count / submission.total_tests) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <FontAwesomeIcon icon={faCalendar} className="mr-1 text-xs" />
                              {formatDate(submission.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <FontAwesomeIcon icon={faClock} className="mr-1 text-xs" />
                              {formatDuration(submission.total_time_ms)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default SubmissionHistory;
