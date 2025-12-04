import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faHome, 
  faCode,
  faSearch,
  faCheck,
  faSort,
  faList,
  faShuffle,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { HiFilter } from 'react-icons/hi';

function CodingProblems() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [starredProblems, setStarredProblems] = useState(new Set());
  const [shuffledProblems, setShuffledProblems] = useState([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('none');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
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

  // Sample problems data
  const problems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      topics: ["Array", "Hash Table"],
      solved: true,
      starred: false,
      acceptanceRate: 47.2,
      companies: ["Google", "Amazon", "Facebook"]
    },
    {
      id: 2,
      title: "Add Two Numbers",
      difficulty: "Medium",
      topics: ["Linked List", "Math"],
      solved: false,
      starred: true,
      acceptanceRate: 35.8,
      companies: ["Microsoft", "Apple"]
    },
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      topics: ["String", "Sliding Window"],
      solved: true,
      starred: false,
      acceptanceRate: 32.4,
      companies: ["Amazon", "Bloomberg"]
    },
    {
      id: 4,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      topics: ["Array", "Binary Search"],
      solved: false,
      starred: true,
      acceptanceRate: 29.1,
      companies: ["Google", "Facebook"]
    },
    {
      id: 5,
      title: "Longest Palindromic Substring",
      difficulty: "Medium",
      topics: ["String", "Dynamic Programming"],
      solved: true,
      starred: false,
      acceptanceRate: 31.6,
      companies: ["Amazon", "Microsoft"]
    },
    {
      id: 6,
      title: "ZigZag Conversion",
      difficulty: "Medium",
      topics: ["String"],
      solved: false,
      starred: false,
      acceptanceRate: 39.7,
      companies: ["PayPal"]
    }
  ];

  const difficulties = ['all', 'Easy', 'Medium', 'Hard'];
  const topics = ['all', 'Array', 'String', 'Linked List', 'Hash Table', 'Math', 'Dynamic Programming', 'Binary Search', 'Sliding Window'];

  const toggleStar = (problemId) => {
    const newStarred = new Set(starredProblems);
    if (newStarred.has(problemId)) {
      newStarred.delete(problemId);
    } else {
      newStarred.add(problemId);
    }
    setStarredProblems(newStarred);
  };

  const shuffleProblems = () => {
    const shuffled = [...problems].sort(() => Math.random() - 0.5);
    setShuffledProblems(shuffled);
    setIsShuffled(true);
  };

  const resetShuffle = () => {
    setShuffledProblems([]);
    setIsShuffled(false);
  };

  const sortProblems = (problems) => {
    if (sortBy === 'none') return problems;
    
    return [...problems].sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'acceptanceRate':
          aValue = a.acceptanceRate;
          bValue = b.acceptanceRate;
          break;
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          aValue = difficultyOrder[a.difficulty];
          bValue = difficultyOrder[b.difficulty];
          break;
        case 'submitted':
          // Using id as proxy for submission order
          aValue = a.id;
          bValue = b.id;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  const clearFilters = () => {
    setSelectedDifficulty('all');
    setSelectedTopic('all');
    setSearchTerm('');
  };

  const clearSort = () => {
    setSortBy('none');
    setSortOrder('asc');
  };

  const currentProblems = isShuffled ? shuffledProblems : problems;
  const filteredProblems = currentProblems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'all' || problem.topics.includes(selectedTopic);
    return matchesSearch && matchesDifficulty && matchesTopic;
  });
  
  const sortedProblems = sortProblems(filteredProblems);

  // Calculate solved problems
  const solvedCount = problems.filter(problem => problem.solved).length;
  const totalCount = problems.length;

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

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
        
        .dropdown-enter {
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
        }
        
        .dropdown-enter-active {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition: opacity 200ms ease-out, transform 200ms ease-out;
        }
        
        .dropdown-exit {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .dropdown-exit-active {
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
          transition: opacity 150ms ease-in, transform 150ms ease-in;
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
              All <span className="gradient-text">Coding Problems</span>
            </h1>
            <p className="text-xl text-gray-600">
              Practice from our collection of 500+ coding interview questions
            </p>
          </div>

          {/* Practice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Top Trending 50 Card */}
            <div
              className="relative bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => navigate('/coding/sheet/top-trending-50')}
            >
              <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                HOT
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-purple-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink-200 rounded-full opacity-30"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">Top Trending 50</h3>
                <p className="text-gray-700 mb-4">Most popular interview questions</p>
                <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors font-medium">
                  Start Practice
                </button>
              </div>
            </div>

            {/* Top 30 Frequently Asked Card */}
            <div
              className="relative bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => navigate('/coding/sheet/top-30-frequently-asked')}
            >
              <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                POPULAR
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-red-200 rounded-full opacity-30"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">Top 30 Frequently Asked</h3>
                <p className="text-gray-700 mb-4">Essential coding interview prep</p>
                <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                  Start Learning
                </button>
              </div>
            </div>

            {/* Trees Card */}
            <div
              className="relative bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => navigate('/coding/sheet/trees')}
            >
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                DSA
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-teal-200 rounded-full opacity-30"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">Trees</h3>
                <p className="text-gray-700 mb-4">Binary trees, BST, and more</p>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Explore Trees
                </button>
              </div>
            </div>

            {/* Arrays Card */}
            <div
              className="relative bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => navigate('/coding/sheet/arrays')}
            >
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                BASIC
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-cyan-200 rounded-full opacity-30"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">Arrays</h3>
                <p className="text-gray-700 mb-4">Fundamental array operations</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Learn Arrays
                </button>
              </div>
            </div>

            {/* Graphs Card */}
            <div
              className="relative bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => navigate('/coding/sheet/graphs')}
            >
              <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                ADVANCED
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-200 rounded-full opacity-30"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">Graphs</h3>
                <p className="text-gray-700 mb-4">DFS, BFS, shortest paths</p>
                <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                  Master Graphs
                </button>
              </div>
            </div>

            {/* Dynamic Programming Card */}
            <div
              className="relative bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => navigate('/coding/sheet/dynamic-programming')}
            >
              <div className="absolute top-4 right-4 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                EXPERT
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-purple-200 rounded-full opacity-30"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">Dynamic Programming</h3>
                <p className="text-gray-700 mb-4">Optimization problems solved</p>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Challenge DP
                </button>
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
                          { value: 'acceptanceRate', label: 'Acceptance Rate' },
                          { value: 'difficulty', label: 'Difficulty' },
                          { value: 'submitted', label: 'Submitted' }
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
                        {difficulties.map(difficulty => (
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
                            {difficulty === 'all' ? 'All Difficulties' : difficulty}
                          </button>
                        ))}
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      {/* Topics Section */}
                      <div className="px-4 py-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Topics</h4>
                        <div className="max-h-40 overflow-y-auto scrollbar-hide">
                          {topics.map(topic => (
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

              {/* Right side - Stats and Shuffle */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="text-gray-900 font-medium">{solvedCount}</span>/{totalCount} Solved
                </div>
                <button 
                  onClick={isShuffled ? resetShuffle : shuffleProblems}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                  title={isShuffled ? 'Reset' : 'Shuffle'}
                >
                  <FontAwesomeIcon icon={faShuffle} className="text-lg" />
                </button>
              </div>
            </div>
          </div>

          {/* Problems List */}
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-transparent">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Save</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {sortedProblems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/coding/problem/${problem.id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {problem.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {problem.solved ? (
                          <FontAwesomeIcon icon={faCheck} className="text-green-500 text-lg" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {problem.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {problem.acceptanceRate}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStar(problem.id)}
                          className="hover:scale-110 transition-transform duration-200 text-2xl"
                        >
                          <span className={starredProblems.has(problem.id) || problem.starred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}>
                            {starredProblems.has(problem.id) || problem.starred ? '★' : '☆'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {sortedProblems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No problems found matching your criteria</div>
                <div className="text-gray-400 text-sm mt-2">Try adjusting your filters</div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mt-6 text-center text-gray-600">
            Showing {sortedProblems.length} of {problems.length} problems
          </div>

        </div>
      </main>

    </div>
  );
}

export default CodingProblems;
