import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faTrophy,
  faArrowRight,
  faHome,
  faChartBar,
  faClock,
  faFire,
  faMedal,
  faCode,
  faUser
} from '@fortawesome/free-solid-svg-icons';

function TestResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || {};

  useEffect(() => {
    if (!results) {
      navigate('/new-mock-test');
      return;
    }
    window.scrollTo(0, 0);
  }, [results, navigate]);

  if (!results) {
    return null;
  }

  // Calculate score percentage
  const scorePercentage = Math.round((results.solvedCorrectly / results.totalQuestions) * 100);
  
  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  // Determine performance level
  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { level: 'Outstanding', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 75) return { level: 'Great', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 60) return { level: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const performance = getPerformanceLevel(scorePercentage);

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
              
              {/* Test Page Button */}
              <Link 
                to="/coding/mock-tests" 
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faCode} />
                <span>Tests</span>
              </Link>
              
              {/* User Profile Icon */}
              <Link 
                to="/coding/profile" 
                className="p-3 rounded-lg bg-primary-100 hover:bg-primary-200 transition-colors"
              >
                <FontAwesomeIcon icon={faUser} className="text-primary-600" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6 sm:px-8 lg:px-12 w-full">
        <div className="w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center animate-pulse">
                <FontAwesomeIcon icon={faTrophy} className="text-6xl text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Complete!</h1>
          <p className="text-gray-600">Great job on completing your test. Here's your performance summary.</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-3xl overflow-hidden mb-8 border border-gray-200/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_12px_48px_0_rgba(31,38,135,0.25)] transition-all duration-300">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-12 text-center text-white">
            <div className="mb-6">
              <div className="text-6xl font-bold mb-2">{scorePercentage}%</div>
              <div className={`text-2xl font-semibold`}>
                {performance.level}
              </div>
            </div>
            
            <p className="text-blue-100">
              You solved {results.solvedCorrectly} out of {results.totalQuestions} problems correctly
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className={`w-14 h-14 rounded-full ${performance.bgColor} flex items-center justify-center`}>
                  <FontAwesomeIcon icon={faCheckCircle} className={`text-2xl ${performance.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{results.solvedCorrectly}</div>
              <div className="text-gray-600 text-sm">Correct Answers</div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faTimesCircle} className="text-2xl text-red-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{results.totalQuestions - results.solvedCorrectly}</div>
              <div className="text-gray-600 text-sm">Incorrect Answers</div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faClock} className="text-2xl text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{formatTime(results.timeSpent)}</div>
              <div className="text-gray-600 text-sm">Time Spent</div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faMedal} className="text-2xl text-orange-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{results.score}</div>
              <div className="text-gray-600 text-sm">Score Points</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default TestResults;
