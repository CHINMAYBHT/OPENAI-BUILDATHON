import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { supabase } from '../utils/supabase';
import {
  faArrowLeft,
  faSearch,
  faFilter,
  faCode,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faStar,
  faChartLine,
  faBullseye,
  faGraduationCap,
  faHeart,
  faDownload,
  faCopy,
  faBuilding,
  faHome,
  faUser,
  faCheck,
  faArrowUp,
  faArrowDown,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { HiFilter } from 'react-icons/hi';
import companyService from './services/companyService.js';

function CompanyQuestions() {
  const { companyName } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('frequency');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [starredQuestions, setStarredQuestions] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentCompany, setCurrentCompany] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [problemStatuses, setProblemStatuses] = useState({});
  const [companyProgress, setCompanyProgress] = useState(null);

  const filterRef = useRef(null);
  const sortRef = useRef(null);

  const apiBase = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')
    : 'http://localhost:5000';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [companyName]);

  // Fetch company data and problems from database
  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBase}/api/companies/${companyName}`);
        const data = await response.json();

        if (data.success) {
          setCurrentCompany(data.company);
          setProblems(data.problems);
        } else {
          setError('Failed to load company data');
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError('Error loading company data');
      } finally {
        setLoading(false);
      }
    };

    if (companyName) {
      fetchCompanyData();
    }
  }, [companyName, apiBase]);

  // Fetch user problem statuses
  useEffect(() => {
    const fetchProblemStatuses = async () => {
      if (problems.length === 0 || !currentCompany) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const userId = session.user.id;
        const problemIds = problems.map(p => p.id);

        const response = await fetch(`${apiBase}/api/problem-status/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ user_id: userId, problem_ids: problemIds })
        });

        if (response.ok) {
          const data = await response.json();
          const statusMap = {};
          data.statuses?.forEach(status => {
            statusMap[status.problem_id] = status;
          });
          setProblemStatuses(statusMap);

          // Sync company progress after getting statuses
          const syncResponse = await fetch(`${apiBase}/api/company-progress/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ user_id: userId, company_id: currentCompany.id })
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            setCompanyProgress(syncData.progress);
          }
        }
      } catch (err) {
        console.error('Error fetching problem statuses:', err);
      }
    };

    fetchProblemStatuses();
  }, [problems, currentCompany, apiBase]);

  // Listen for problem status updates and re-sync company progress
  useEffect(() => {
    const handleStatusUpdate = async (event) => {
      const { problemId, newStatus } = event.detail;

      // Update local status map
      setProblemStatuses(prev => ({
        ...prev,
        [problemId]: { ...prev[problemId], status: newStatus }
      }));

      // Re-sync company progress if user is logged in and company is loaded
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user || !currentCompany) return;

        const syncResponse = await fetch(`${apiBase}/api/company-progress/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            user_id: session.user.id,
            company_id: currentCompany.id
          })
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          setCompanyProgress(syncData.progress);
        }
      } catch (err) {
        console.error('Error syncing company progress:', err);
      }
    };

    window.addEventListener('problemStatusUpdated', handleStatusUpdate);
    return () => window.removeEventListener('problemStatusUpdated', handleStatusUpdate);
  }, [currentCompany, apiBase]);

  // Get user's progress from problems or company_progress table
  const userProgress = useMemo(() => {
    // If we have company progress from DB, use it
    if (companyProgress) {
      return {
        solved: companyProgress.solved_total,
        attempted: 0, // This would need to be added to the table if needed
        total: companyProgress.total_questions,
        easySolved: companyProgress.solved_easy,
        mediumSolved: companyProgress.solved_medium,
        hardSolved: companyProgress.solved_hard,
        totalEasy: companyProgress.total_easy,
        totalMedium: companyProgress.total_medium,
        totalHard: companyProgress.total_hard
      };
    }

    // Fallback: Calculate from problemStatuses
    const solved = problems.filter(p => problemStatuses[p.id]?.status === 'solved').length;
    const attempted = problems.filter(p => problemStatuses[p.id]?.status === 'attempted').length;

    // Count by difficulty
    const easySolved = problems.filter(p =>
      p.difficulty.toLowerCase() === 'easy' && problemStatuses[p.id]?.status === 'solved'
    ).length;
    const mediumSolved = problems.filter(p =>
      p.difficulty.toLowerCase() === 'medium' && problemStatuses[p.id]?.status === 'solved'
    ).length;
    const hardSolved = problems.filter(p =>
      p.difficulty.toLowerCase() === 'hard' && problemStatuses[p.id]?.status === 'solved'
    ).length;

    const totalEasy = problems.filter(p => p.difficulty.toLowerCase() === 'easy').length;
    const totalMedium = problems.filter(p => p.difficulty.toLowerCase() === 'medium').length;
    const totalHard = problems.filter(p => p.difficulty.toLowerCase() === 'hard').length;

    return {
      solved,
      attempted,
      total: problems.length,
      easySolved,
      mediumSolved,
      hardSolved,
      totalEasy,
      totalMedium,
      totalHard
    };
  }, [problems, problemStatuses, companyProgress]);

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      const matchesTopic = selectedTopic === 'all' || (problem.topics && problem.topics.includes(selectedTopic));
      // Status filtering would require user_problem_status integration

      return matchesSearch && matchesDifficulty && matchesTopic;
    });

    // Sort questions
    switch (sortBy) {
      case 'frequency':
        return filtered.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return filtered.sort((a, b) => difficultyOrder[a.difficulty.toLowerCase()] - difficultyOrder[b.difficulty.toLowerCase()]);
      case 'acceptance':
        return filtered.sort((a, b) => (b.acceptanceRate || 0) - (a.acceptanceRate || 0));
      default:
        return filtered;
    }
  }, [problems, searchTerm, selectedDifficulty, selectedTopic, sortBy]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'solved': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'attempted': return <FontAwesomeIcon icon={faTimesCircle} className="text-yellow-500" />;
      default: return <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>;
    }
  };

  const toggleStar = (questionId) => {
    const newStarred = new Set(starredQuestions);
    if (newStarred.has(questionId)) {
      newStarred.delete(questionId);
    } else {
      newStarred.add(questionId);
    }
    setStarredQuestions(newStarred);
  };

  const clearFilters = () => {
    setSelectedDifficulty('all');
    setSelectedTopic('all');
    setSelectedStatus('all');
    setSearchTerm('');
  };

  const clearSort = () => {
    setSortBy('frequency');
    setSortOrder('asc');
  };

  const calculateWeakAreas = () => {
    const topicStats = {};
    questionsData.forEach(q => {
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, solved: 0 };
      }
      topicStats[q.topic].total++;
      if (q.status === 'solved') topicStats[q.topic].solved++;
    });

    return Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        percentage: (stats.solved / stats.total) * 100,
        solved: stats.solved,
        total: stats.total
      }))
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5);
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

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading company data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Content - only show when not loading and no error */}
          {!loading && !error && currentCompany && (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                      <span className="gradient-text">{currentCompany.name}</span> Questions
                    </h1>
                    <p className="text-xl text-gray-600">
                      Practice from {currentCompany.total_questions || 0} coding questions frequently asked at {currentCompany.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Questions Card */}
                <div className="relative bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
                  <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    TOTAL
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-200 rounded-full opacity-50"></div>
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-cyan-200 rounded-full opacity-30"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{userProgress.solved} / {userProgress.total}</h3>
                    <p className="text-gray-600 mb-4">Solved / Total</p>
                    <div className="text-xs text-gray-500">{userProgress.total > 0 ? Math.round((userProgress.solved / userProgress.total) * 100) : 0}% Complete</div>
                  </div>
                </div>

                {/* Easy Questions Card */}
                <div className="relative bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    EASY
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-200 rounded-full opacity-50"></div>
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-teal-200 rounded-full opacity-30"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{userProgress.easySolved} / {currentCompany.difficulty?.easy || 0}</h3>
                    <p className="text-gray-600 mb-4">Easy Solved</p>
                    <div className="text-xs text-gray-500">{currentCompany.difficulty?.easy ? Math.round((userProgress.easySolved / currentCompany.difficulty.easy) * 100) : 0}% Complete</div>
                  </div>
                </div>

                {/* Medium Questions Card */}
                <div className="relative bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    MEDIUM
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-200 rounded-full opacity-50"></div>
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-200 rounded-full opacity-30"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{userProgress.mediumSolved} / {currentCompany.difficulty?.medium || 0}</h3>
                    <p className="text-gray-600 mb-4">Medium Solved</p>
                    <div className="text-xs text-gray-500">{currentCompany.difficulty?.medium ? Math.round((userProgress.mediumSolved / currentCompany.difficulty.medium) * 100) : 0}% Complete</div>
                  </div>
                </div>

                {/* Hard Questions Card */}
                <div className="relative bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    HARD
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-200 rounded-full opacity-50"></div>
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink-200 rounded-full opacity-30"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{userProgress.hardSolved} / {currentCompany.difficulty?.hard || 0}</h3>
                    <p className="text-gray-600 mb-4">Hard Solved</p>
                    <div className="text-xs text-gray-500">{currentCompany.difficulty?.hard ? Math.round((userProgress.hardSolved / currentCompany.difficulty.hard) * 100) : 0}% Complete</div>
                  </div>
                </div>
              </div>

              {/* Filters Section */}
              <div className="p-6 mb-8">
                <div className="flex items-center justify-between">
                  {/* Left side - Search with Sort and Filter buttons */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="relative">
                      <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search questions"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white text-gray-900 placeholder-gray-500 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-96"
                      />
                    </div>

                    {/* Sort icon with dropdown */}
                    <div className="relative" ref={sortRef}>
                      <button
                        onClick={() => {
                          setShowSortDropdown(!showSortDropdown);
                          if (showFilterDropdown) setShowFilterDropdown(false);
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col items-center">
                          <FontAwesomeIcon icon={faArrowUp} className="text-gray-600" style={{ fontSize: '8px' }} />
                          <FontAwesomeIcon icon={faArrowDown} className="text-gray-600" style={{ fontSize: '8px' }} />
                        </div>
                      </button>

                      {/* Sort Dropdown Menu */}
                      {showSortDropdown && (
                        <div className="absolute left-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-10 transform transition-all duration-200 ease-out opacity-100 scale-100 animate-in">
                          {/* Sort Options */}
                          <div className="px-4 py-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Sort by</h4>
                            {[
                              { value: 'frequency', label: 'Frequency' },
                              { value: 'difficulty', label: 'Difficulty' },
                              { value: 'acceptance', label: 'Acceptance Rate' },
                              { value: 'recent', label: 'Recently Asked' }
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

                          {/* Sort Order */}
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

                          {/* Clear Sort */}
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

                    {/* Filter icon with dropdown */}
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

                      {/* Dropdown Menu */}
                      {showFilterDropdown && (
                        <div className="absolute left-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-10 transform transition-all duration-200 ease-out opacity-100 scale-100 animate-in">
                          {/* Difficulty Section */}
                          <div className="px-4 py-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Difficulty</h4>
                            {['all', 'easy', 'medium', 'hard'].map(difficulty => (
                              <button
                                key={difficulty}
                                onClick={() => {
                                  setSelectedDifficulty(difficulty);
                                  setShowFilterDropdown(false);
                                }}
                                className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${selectedDifficulty === difficulty ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                  }`}
                              >
                                {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                              </button>
                            ))}
                          </div>

                          {/* Topics Section */}
                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="px-4 py-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Topics</h4>
                            <div className="max-h-40 overflow-y-auto scrollbar-hide">
                              {['all', ...currentCompany.popularTopics].map(topic => (
                                <button
                                  key={topic}
                                  onClick={() => {
                                    setSelectedTopic(topic);
                                    setShowFilterDropdown(false);
                                  }}
                                  className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${selectedTopic === topic ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                    }`}
                                >
                                  {topic === 'all' ? 'All Topics' : topic}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Status Section */}
                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="px-4 py-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Status</h4>
                            {['all', 'solved', 'attempted', 'unsolved'].map(status => (
                              <button
                                key={status}
                                onClick={() => {
                                  setSelectedStatus(status);
                                  setShowFilterDropdown(false);
                                }}
                                className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${selectedStatus === status ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                  }`}
                              >
                                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>

                          {/* Clear Filters */}
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
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      <span className="text-gray-900 font-medium">{filteredAndSortedQuestions.length}</span> Questions
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-transparent">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent">
                      {filteredAndSortedQuestions.map((problem) => (
                        <tr
                          key={problem.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/coding/problem/${problem.slug}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {problem.problemNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {problemStatuses[problem.id]?.status === 'solved' ? (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {problem.title}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-semibold ${getDifficultyColor(problem.difficulty.toLowerCase())}`}>
                              {problem.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {problem.topics && problem.topics.length > 0 ? problem.topics[0] : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {problem.acceptanceRate || 0}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredAndSortedQuestions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">No questions found matching your criteria</div>
                    <div className="text-gray-400 text-sm mt-2">Try adjusting your filters</div>
                  </div>
                )}
              </div>

              {/* Results Summary */}
              <div className="mt-6 text-center text-gray-600">
                Showing {filteredAndSortedQuestions.length} of {problems.length} questions
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default CompanyQuestions;