import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faSearch, 
  faFilter,
  faCode,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faStar,
  faBookmark,
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
  const [savedToMyPrep, setSavedToMyPrep] = useState(false);
  const [starredQuestions, setStarredQuestions] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [companyName]);

  // Scroll to top when component mounts or companyName changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [companyName]);

  // Get company data from service
  const currentCompany = companyService.getCompanyById(companyName) || companyService.getCompanyById('amazon');
  
  // Get questions for this company from service  
  const questionsData = companyService.getQuestionsByCompany(companyName);

  // Get user's progress from localStorage
  const getUserProgress = () => {
    const progress = localStorage.getItem('userProgress');
    return progress ? JSON.parse(progress) : {
      solved: questionsData.filter(q => q.status === 'solved').length,
      attempted: questionsData.filter(q => q.status === 'attempted').length,
      total: questionsData.length
    };
  };

  const [userProgress] = useState(getUserProgress());

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questionsData.filter(question => {
      const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          question.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
      const matchesTopic = selectedTopic === 'all' || question.topic === selectedTopic;
      const matchesStatus = selectedStatus === 'all' || question.status === selectedStatus;
      const matchesCompany = question.companies.includes(companyName);
      
      return matchesSearch && matchesDifficulty && matchesTopic && matchesStatus && matchesCompany;
    });

    // Sort questions
    switch (sortBy) {
      case 'frequency':
        return filtered.sort((a, b) => b.frequency - a.frequency);
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
      case 'acceptance':
        return filtered.sort((a, b) => b.acceptance - a.acceptance);
      case 'recent':
        return filtered.sort((a, b) => new Date(b.lastAsked) - new Date(a.lastAsked));
      default:
        return filtered;
    }
  }, [searchTerm, selectedDifficulty, selectedTopic, selectedStatus, sortBy, companyName]);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'solved': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'attempted': return <FontAwesomeIcon icon={faTimesCircle} className="text-yellow-500" />;
      default: return <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>;
    }
  };

  const handleSaveToMyPrep = () => {
    setSavedToMyPrep(true);
    // Here you would normally save to backend/localStorage
    setTimeout(() => setSavedToMyPrep(false), 2000);
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
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  <span className="gradient-text">{currentCompany.name}</span> Questions
                </h1>
                <p className="text-xl text-gray-600">
                  Practice from {currentCompany.totalQuestions} coding questions frequently asked at {currentCompany.name}
                </p>
              </div>
              
              {/* Add Button */}
              <button className="flex items-center space-x-2 px-4 py-2 mt-5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all">
                <FontAwesomeIcon icon={faPlus} />
                <span>Add to Sheets</span>
              </button>
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
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentCompany.totalQuestions}</h3>
                <p className="text-gray-600 mb-4">Total Questions</p>
                <div className="text-xs text-gray-500">{Math.round((userProgress.solved / userProgress.total) * 100)}% Solved</div>
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
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentCompany.difficulty.easy}</h3>
                <p className="text-gray-600 mb-4">Easy Questions</p>
                <div className="text-xs text-gray-500">Good for beginners</div>
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
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentCompany.difficulty.medium}</h3>
                <p className="text-gray-600 mb-4">Medium Questions</p>
                <div className="text-xs text-gray-500">Most common difficulty</div>
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
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentCompany.difficulty.hard}</h3>
                <p className="text-gray-600 mb-4">Hard Questions</p>
                <div className="text-xs text-gray-500">Advanced challenges</div>
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
                      <FontAwesomeIcon icon={faArrowUp} className="text-gray-600" style={{fontSize: '8px'}} />
                      <FontAwesomeIcon icon={faArrowDown} className="text-gray-600" style={{fontSize: '8px'}} />
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
                            className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                              sortBy === option.value ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
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
                          className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                            sortOrder === 'asc' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          Ascending
                        </button>
                        <button
                          onClick={() => {
                            setSortOrder('desc');
                            setShowSortDropdown(false);
                          }}
                          className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                            sortOrder === 'desc' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
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
                            className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                              selectedDifficulty === difficulty ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
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
                              className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                                selectedTopic === topic ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
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
                            className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                              selectedStatus === status ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Save</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {filteredAndSortedQuestions.map((question) => (
                    <tr key={question.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {question.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {question.status === 'solved' ? (
                          <FontAwesomeIcon icon={faCheck} className="text-green-500 text-lg" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/coding/problem/${question.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {question.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {question.topic}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {question.acceptance}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStar(question.id)}
                          className="hover:scale-110 transition-transform duration-200 text-2xl"
                        >
                          <span className={starredQuestions.has(question.id) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}>
                            {starredQuestions.has(question.id) ? '★' : '☆'}
                          </span>
                        </button>
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
            Showing {filteredAndSortedQuestions.length} of {questionsData.length} questions
          </div>
        </div>
      </main>
     </div>    
  );
}

export default CompanyQuestions;