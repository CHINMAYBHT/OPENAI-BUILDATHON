import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faCode,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import TestHistory from './components/TestHistory';
import './styles/MockTests.css';

function MockTests() {
  const [previousTests, setPreviousTests] = useState([
    {
      id: 1,
      name: 'Easy Array Problems',
      type: 'Coding',
      company: 'Google',
      topic: 'Arrays',
      date: '2025-11-28',
      score: 85,
      duration: '60 mins',
      questions: 3,
      solved: 3,
      status: 'completed',
      problems: [
        {
          id: 1,
          title: 'Two Sum',
          difficulty: 'Easy',
          status: 'solved',
          userCode: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    if (map.has(target - nums[i])) {\n      return [map.get(target - nums[i]), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
          language: 'javascript'
        },
        {
          id: 2,
          title: 'Reverse Array',
          difficulty: 'Easy',
          status: 'solved',
          userCode: 'function reverseArray(arr) {\n  return arr.reverse();\n}',
          language: 'javascript'
        },
        {
          id: 3,
          title: 'Find Maximum',
          difficulty: 'Easy',
          status: 'solved',
          userCode: 'function findMax(arr) {\n  return Math.max(...arr);\n}',
          language: 'javascript'
        }
      ]
    },
    {
      id: 2,
      name: 'String Manipulation Challenge',
      type: 'Coding',
      company: 'Amazon',
      topic: 'Strings',
      date: '2025-11-25',
      score: 72,
      duration: '60 mins',
      questions: 3,
      solved: 2,
      status: 'completed',
      problems: [
        {
          id: 1,
          title: 'Longest Substring Without Repeating',
          difficulty: 'Medium',
          status: 'solved',
          userCode: 'function lengthOfLongestSubstring(s) {\n  let maxLen = 0;\n  let left = 0;\n  const charIndex = {};\n  for (let right = 0; right < s.length; right++) {\n    if (charIndex[s[right]] >= left) {\n      left = charIndex[s[right]] + 1;\n    }\n    charIndex[s[right]] = right;\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}',
          language: 'javascript'
        },
        {
          id: 2,
          title: 'Palindrome Check',
          difficulty: 'Easy',
          status: 'solved',
          userCode: 'function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}',
          language: 'javascript'
        },
        {
          id: 3,
          title: 'Anagram Check',
          difficulty: 'Easy',
          status: 'unsolved',
          userCode: '',
          language: 'javascript'
        }
      ]
    },
    {
      id: 3,
      name: 'System Design MCQ',
      type: 'MCQ',
      company: 'Meta',
      topic: 'System Design',
      date: '2025-11-22',
      score: 90,
      duration: '45 mins',
      questions: 30,
      solved: 27,
      status: 'completed',
      problems: []
    },
    {
      id: 4,
      name: 'Mixed Test - Apple',
      type: 'Mix',
      company: 'Apple',
      topic: 'Multiple',
      date: '2025-11-20',
      score: 78,
      duration: '90 mins',
      questions: 40,
      solved: 31,
      status: 'completed',
      problems: []
    }
  ]);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              
              {/* Coding Button */}
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Mock <span className="text-primary-600">Test History</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Review your previous test attempts and track your progress
            </p>
            <Link
              to="/new-mock-test"
              className="mt-8 inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300"
            >
              Take a New Test
            </Link>
          </div>

          {/* Test History Component */}
          <TestHistory tests={previousTests} />
        </div>
      </div>
    </div>
  );
}

export default MockTests;
