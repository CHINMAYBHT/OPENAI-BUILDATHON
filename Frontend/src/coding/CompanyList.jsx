import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { supabase } from '../utils/supabase';
import {
  faBuilding,
  faArrowLeft,
  faSearch,
  faFilter,
  faBriefcase,
  faGraduationCap,
  faCode,
  faServer,
  faDesktop,
  faStar,
  faHome,
  faUser,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { HiFilter } from 'react-icons/hi';
import companyService from './services/companyService.js';

function CompanyList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('none');
  const [sortOrder, setSortOrder] = useState('asc');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyProgressMap, setCompanyProgressMap] = useState({});

  const filterRef = useRef(null);
  const sortRef = useRef(null);

  const apiBase = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')
    : 'http://localhost:5000';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch companies from database
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBase}/api/companies`);
        const data = await response.json();

        if (data.success) {
          // Transform database data to match expected format
          const transformedCompanies = data.companies.map(company => ({
            id: company.id,
            name: company.name,
            type: company.type || 'tech',
            description: company.description || '',
            totalQuestions: company.total_questions || 0,
            difficulty: typeof company.difficulty === 'string'
              ? JSON.parse(company.difficulty)
              : (company.difficulty || { easy: 0, medium: 0, hard: 0 }),
            popularTopics: typeof company.popular_topics === 'string'
              ? JSON.parse(company.popular_topics)
              : (company.popular_topics || [])
          }));
          setCompanies(transformedCompanies);
        } else {
          setError('Failed to load companies');
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Error loading companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [apiBase]);

  // Fetch user's progress for all companies
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (companies.length === 0) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const userId = session.user.id;

        // Fetch all user_company_progress records for this user
        const { data, error } = await supabase
          .from('user_company_progress')
          .select('*')
          .eq('user_id', userId);

        if (!error && data) {
          const progressMap = {};
          data.forEach(progress => {
            progressMap[progress.company_id] = progress;
          });
          setCompanyProgressMap(progressMap);
        }
      } catch (err) {
        console.error('Error fetching user progress:', err);
      }
    };

    fetchUserProgress();
  }, [companies]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const categories = [
    { id: 'all', label: 'All Companies', icon: faBuilding },
    { id: 'faang', label: 'FAANG', icon: faStar },
    { id: 'tech', label: 'Tech Giants', icon: faCode },
    { id: 'finance', label: 'Finance', icon: faBriefcase },
    { id: 'service', label: 'Service Based', icon: faServer },
    { id: 'product', label: 'Product Based', icon: faDesktop }
  ];

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
  };

  const clearSort = () => {
    setSortBy('none');
    setSortOrder('asc');
  };

  const sortCompanies = (companies) => {
    if (sortBy === 'none') return companies;

    return [...companies].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'totalQuestions':
          aValue = a.totalQuestions;
          bValue = b.totalQuestions;
          break;
        case 'easyQuestions':
          aValue = a.difficulty.easy;
          bValue = b.difficulty.easy;
          break;
        case 'mediumQuestions':
          aValue = a.difficulty.medium;
          bValue = b.difficulty.medium;
          break;
        case 'hardQuestions':
          aValue = a.difficulty.hard;
          bValue = b.difficulty.hard;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          if (sortOrder === 'asc') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
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

  // Filter companies based on search term and category
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(company => company.type === selectedCategory);
    }

    return sortCompanies(filtered);
  }, [companies, searchTerm, selectedCategory, sortBy, sortOrder]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-500 bg-red-50';
      default: return '';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'faang': return 'text-purple-600';
      case 'tech': return 'text-blue-600';
      case 'finance': return 'text-green-600';
      case 'service': return 'text-orange-600';
      case 'product': return 'text-pink-600';
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


          {/* Filters Section */}
          <div className="p-6 mb-8">
            <div className="flex items-center justify-between">
              {/* Left side - Search with Filter button */}
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies..."
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
                          { value: 'totalQuestions', label: 'Total Questions' },
                          { value: 'easyQuestions', label: 'Easy Questions' },
                          { value: 'mediumQuestions', label: 'Medium Questions' },
                          { value: 'hardQuestions', label: 'Hard Questions' },
                          { value: 'name', label: 'Company Name' }
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
                      {/* Category Section */}
                      <div className="px-4 py-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Category</h4>
                        {categories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setShowFilterDropdown(false);
                            }}
                            className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                              }`}
                          >
                            <FontAwesomeIcon icon={category.icon} className="mr-2" />
                            {category.label}
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
                  <span className="text-gray-900 font-medium">{filteredCompanies.length}</span> Companies
                </div>
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Link
                key={company.id}
                to={`/coding/companies/${company.id}`}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 block"
              >
                <div className="p-6">
                  {/* Company Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {company.name}
                      </h3>
                      <span className={`inline-block text-xs font-medium ${getCategoryColor(company.type)}`}>
                        {categories.find(cat => cat.id === company.type)?.label || company.type}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{company.totalQuestions}</div>
                      <div className="text-xs text-gray-500">questions</div>
                    </div>
                  </div>

                  {/* Tagline */}
                  {company.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>
                  )}

                  {/* Difficulty Distribution */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Your Progress</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`px-2 py-1 rounded text-center ${getDifficultyColor('easy')}`}>
                        <div className="text-base font-bold">
                          {companyProgressMap[company.id]?.solved_easy || 0} / {company.difficulty?.easy || 0}
                        </div>
                        <div className="text-sm">Easy</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-center ${getDifficultyColor('medium')}`}>
                        <div className="text-base font-bold">
                          {companyProgressMap[company.id]?.solved_medium || 0} / {company.difficulty?.medium || 0}
                        </div>
                        <div className="text-sm">Medium</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-center ${getDifficultyColor('hard')}`}>
                        <div className="text-base font-bold">
                          {companyProgressMap[company.id]?.solved_hard || 0} / {company.difficulty?.hard || 0}
                        </div>
                        <div className="text-sm">Hard</div>
                      </div>
                    </div>
                  </div>

                  {/* Popular Tags */}
                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-700 mb-2">Popular Topics</div>
                    <div className="flex flex-wrap gap-1">
                      {(company.popularTopics || []).slice(0, 4).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interview Types - Optional field */}
                  {company.interviewTypes && company.interviewTypes.length > 0 && (
                    <div className="mb-6">
                      <div className="text-xs font-medium text-gray-700 mb-2">Interview Types</div>
                      <div className="flex flex-wrap gap-1">
                        {company.interviewTypes.slice(0, 3).map((type, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium"
                          >
                            {type}
                          </span>
                        ))}
                        {company.interviewTypes.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                            +{company.interviewTypes.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}

            {/* Empty State */}
            {filteredCompanies.length === 0 && (
              <div className="col-span-full text-center py-16">
                <FontAwesomeIcon icon={faBuilding} className="text-4xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CompanyList;