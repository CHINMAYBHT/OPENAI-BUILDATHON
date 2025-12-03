import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faHome, 
  faCode,
  faPlay,
  faCheck,
  faRotateLeft,
  faCopy,
  faHeart,
  faStar,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faLightbulb,
  faTags,
  faBuilding,
  faSun,
  faMoon
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular, faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

function CodeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [activeTestTab, setActiveTestTab] = useState('sample');
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState(false);

  // Sample problem data - in real app this would come from API
  const problems = [
    {
      id: 1,
      title: "Two Sum",
      number: 1,
      total: 6,
      difficulty: "Easy",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
      inputFormat: `nums: an array of integers
target: an integer`,
      outputFormat: `Return an array of two integers representing the indices`,
      examples: [
        {
          input: `nums = [2,7,11,15], target = 9`,
          output: `[0,1]`,
          explanation: `Because nums[0] + nums[1] == 9, we return [0, 1].`
        },
        {
          input: `nums = [3,2,4], target = 6`,
          output: `[1,2]`,
          explanation: `Because nums[1] + nums[2] == 6, we return [1, 2].`
        },
        {
          input: `nums = [3,3], target = 6`,
          output: `[0,1]`,
          explanation: `Because nums[0] + nums[1] == 6, we return [0, 1].`
        }
      ],
      constraints: [
        `2 <= nums.length <= 10^4`,
        `-10^9 <= nums[i] <= 10^9`,
        `-10^9 <= target <= 10^9`,
        `Only one valid answer exists.`
      ],
      companies: ["Google", "Amazon", "Facebook", "Microsoft", "Apple"],
      topics: ["Array", "Hash Table"],
      hints: [
        "A really brute force way would be to search for all possible pairs of numbers but that would be too slow.",
        "Try using a hash table to store the numbers you've seen so far.",
        "As you iterate through the array, check if target - current number exists in the hash table."
      ],
      testCases: [
        {
          input: "[2,7,11,15]\n9",
          expectedOutput: "[0,1]",
          hidden: false
        },
        {
          input: "[3,2,4]\n6", 
          expectedOutput: "[1,2]",
          hidden: false
        },
        {
          input: "[3,3]\n6",
          expectedOutput: "[0,1]",
          hidden: false
        }
      ]
    },
    {
      id: 2,
      title: "Add Two Numbers",
      number: 2,
      total: 6,
      difficulty: "Medium",
      description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.`,
      inputFormat: `l1: ListNode - head of first linked list
l2: ListNode - head of second linked list`,
      outputFormat: `Return ListNode - head of the sum linked list`,
      examples: [
        {
          input: `l1 = [2,4,3], l2 = [5,6,4]`,
          output: `[7,0,8]`,
          explanation: `342 + 465 = 807.`
        }
      ],
      constraints: [
        `The number of nodes in each linked list is in the range [1, 100].`,
        `0 <= Node.val <= 9`,
        `It is guaranteed that the list represents a number that does not have leading zeros.`
      ],
      companies: ["Microsoft", "Apple", "Amazon"],
      topics: ["Linked List", "Math", "Recursion"],
      hints: [
        "Keep track of the carry using a variable and simulate digits-by-digits sum starting from the head of list, which contains the least-significant digit.",
        "For cases where one list is shorter than the other, or if there is a carry at the end, consider these edge cases."
      ],
      testCases: [
        {
          input: "[2,4,3]\n[5,6,4]",
          expectedOutput: "[7,0,8]",
          hidden: false
        }
      ]
    },
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      number: 3,
      total: 6,
      difficulty: "Medium",
      description: `Given a string s, find the length of the longest substring without repeating characters.`,
      inputFormat: `s: a string`,
      outputFormat: `Return an integer - length of longest substring`,
      examples: [
        {
          input: `s = "abcabcbb"`,
          output: `3`,
          explanation: `The answer is "abc", with the length of 3.`
        },
        {
          input: `s = "bbbbb"`,
          output: `1`,
          explanation: `The answer is "b", with the length of 1.`
        }
      ],
      constraints: [
        `0 <= s.length <= 5 * 10^4`,
        `s consists of English letters, digits, symbols and spaces.`
      ],
      companies: ["Amazon", "Bloomberg", "Facebook"],
      topics: ["Hash Table", "String", "Sliding Window"],
      hints: [
        "Use a sliding window approach with two pointers.",
        "Use a hash set to keep track of characters in the current window."
      ],
      testCases: [
        {
          input: "\"abcabcbb\"",
          expectedOutput: "3",
          hidden: false
        }
      ]
    },
    {
      id: 4,
      title: "Median of Two Sorted Arrays",
      number: 4,
      total: 6,
      difficulty: "Hard",
      description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
      inputFormat: `nums1: array of integers
nums2: array of integers`,
      outputFormat: `Return a double - the median`,
      examples: [
        {
          input: `nums1 = [1,3], nums2 = [2]`,
          output: `2.00000`,
          explanation: `merged array = [1,2,3] and median is 2.`
        }
      ],
      constraints: [
        `nums1.length == m`,
        `nums2.length == n`,
        `0 <= m <= 1000`,
        `0 <= n <= 1000`,
        `1 <= m + n <= 2000`
      ],
      companies: ["Google", "Facebook", "Apple"],
      topics: ["Array", "Binary Search", "Divide and Conquer"],
      hints: [
        "Use binary search to find the partition.",
        "Ensure the partitions are balanced and elements are in correct order."
      ],
      testCases: [
        {
          input: "[1,3]\n[2]",
          expectedOutput: "2.0",
          hidden: false
        }
      ]
    },
    {
      id: 5,
      title: "Longest Palindromic Substring",
      number: 5,
      total: 6,
      difficulty: "Medium",
      description: `Given a string s, return the longest palindromic substring in s.`,
      inputFormat: `s: a string`,
      outputFormat: `Return a string - the longest palindromic substring`,
      examples: [
        {
          input: `s = "babad"`,
          output: `"bab"`,
          explanation: `"aba" is also a valid answer.`
        }
      ],
      constraints: [
        `1 <= s.length <= 1000`,
        `s consist of only digits and English letters.`
      ],
      companies: ["Amazon", "Microsoft", "Google"],
      topics: ["String", "Dynamic Programming"],
      hints: [
        "Expand around centers approach.",
        "Dynamic programming approach with 2D table."
      ],
      testCases: [
        {
          input: "\"babad\"",
          expectedOutput: "\"bab\"",
          hidden: false
        }
      ]
    },
    {
      id: 6,
      title: "ZigZag Conversion",
      number: 6,
      total: 6,
      difficulty: "Medium",
      description: `The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility)

P   A   H   R
A P L S I I G
Y   I   R

And then read line by line: "PAHNAPLSIIGYIR"

Write the code that will take a string and make this conversion given a number of rows.`,
      inputFormat: `s: string to convert
numRows: number of rows`,
      outputFormat: `Return a string - the converted string`,
      examples: [
        {
          input: `s = "PAYPALISHIRING", numRows = 3`,
          output: `"PAHNAPLSIIGYIR"`,
          explanation: `The string is arranged in zigzag pattern.`
        }
      ],
      constraints: [
        `1 <= s.length <= 1000`,
        `s consists of English letters (lower-case and upper-case), ',' and '.'.`,
        `1 <= numRows <= 1000`
      ],
      companies: ["PayPal", "Amazon"],
      topics: ["String"],
      hints: [
        "Visit the characters in the same order as reading the zigzag pattern line by line.",
        "Find the pattern in indices."
      ],
      testCases: [
        {
          input: "\"PAYPALISHIRING\"\n3",
          expectedOutput: "\"PAHNAPLSIIGYIR\"",
          hidden: false
        }
      ]
    }
    // Add more problems here
  ];

  const currentProblem = problems.find(p => p.id === parseInt(id)) || problems[0];

  const languages = {
    javascript: {
      name: 'JavaScript',
      template: `function twoSum(nums, target) {
    // Write your solution here
    
}`
    },
    python: {
      name: 'Python',
      template: `def twoSum(nums, target):
    # Write your solution here
    pass`
    },
    cpp: {
      name: 'C++',
      template: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        
    }
};`
    },
    java: {
      name: 'Java',
      template: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`
    }
  };

  useEffect(() => {
    setCode(languages[selectedLanguage].template);
  }, [selectedLanguage]);

  // Load solved problems from localStorage on component mount
  useEffect(() => {
    // Scroll to top when component mounts to ensure header is visible
    window.scrollTo(0, 0);
    
    const savedSolvedProblems = localStorage.getItem('solvedProblems');
    if (savedSolvedProblems) {
      setSolvedProblems(new Set(JSON.parse(savedSolvedProblems)));
    }
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const runCode = async () => {
    setIsRunning(true);
    setConsoleOutput(['Running code...']);
    
    // Simulate code execution
    setTimeout(() => {
      const results = currentProblem.testCases.filter(tc => !tc.hidden).map((testCase, index) => ({
        id: index + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: testCase.expectedOutput, // Mock - would be actual execution result
        passed: true, // Mock - would be actual comparison
        runtime: Math.floor(Math.random() * 50) + 10 + 'ms'
      }));
      
      setTestResults(results);
      setConsoleOutput(['Code executed successfully!', 'All sample test cases passed.']);
      setIsRunning(false);
    }, 1500);
  };

  const submitCode = async () => {
    setIsSubmitting(true);
    setConsoleOutput(['Submitting code...']);
    
    // Simulate submission
    setTimeout(() => {
      // Simulate successful submission (in real app, this would be based on actual test results)
      const submissionSuccess = true; // This would be determined by running all test cases
      
      if (submissionSuccess) {
        setConsoleOutput(['Submission successful!', 'All test cases passed.', 'Runtime: 92ms', 'Memory: 41.2 MB']);
        
        // Mark the current problem as solved
        const newSolvedProblems = new Set(solvedProblems);
        newSolvedProblems.add(currentProblem.id);
        setSolvedProblems(newSolvedProblems);
        setIsSubmissionSuccessful(true);
        
        // You could also save this to localStorage or send to backend
        localStorage.setItem('solvedProblems', JSON.stringify([...newSolvedProblems]));
      } else {
        setConsoleOutput(['Submission failed!', 'Some test cases did not pass.', 'Please review your solution.']);
        setIsSubmissionSuccessful(false);
      }
      
      setIsSubmitting(false);
    }, 2000);
  };

  const resetCode = () => {
    setCode(languages[selectedLanguage].template);
    setTestResults([]);
    setConsoleOutput([]);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setConsoleOutput([...consoleOutput, 'Code copied to clipboard!']);
  };

  const runCustomInput = () => {
    setCustomOutput('Running with custom input...');
    // Mock custom execution
    setTimeout(() => {
      setCustomOutput('Custom execution completed!\nOutput: [0,1]');
    }, 1000);
  };

  const navigateToProblem = (direction) => {
    const currentIndex = problems.findIndex(p => p.id === parseInt(id));
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % problems.length;
    } else {
      newIndex = currentIndex === 0 ? problems.length - 1 : currentIndex - 1;
    }
    
    navigate(`/coding/problem/${problems[newIndex].id}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add custom styles for responsive design */}
      <style>{`
        @media (max-width: 1024px) {
          .editor-container {
            flex-direction: column;
          }
          .problem-panel {
            height: 50vh;
            max-height: 50vh;
          }
          .editor-panel {
            height: 50vh;
          }
          .monaco-editor-wrapper {
            height: calc(100% - 8rem);
          }
        }
        @media (min-width: 1025px) {
          .editor-container {
            flex-direction: row;
            height: 100vh;
          }
          .problem-panel {
            width: 50%;
            height: 100vh;
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .problem-panel::-webkit-scrollbar {
            display: none;
          }
          .editor-panel {
            width: 50%;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .monaco-editor-wrapper {
            flex: 1;
            min-height: 0;
          }
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm border-b">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <span className="text-lg font-bold text-gray-800">Job Builder</span>
              
              {/* Problem Navigation */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateToProblem('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Previous Problem"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Problem #{currentProblem.number} of {currentProblem.total}
                </span>
                <button
                  onClick={() => navigateToProblem('next')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Next Problem"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Right side navigation */}
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </Link>
              
              <Link 
                to="/coding/problems" 
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faCode} />
                <span>Problems</span>
              </Link>
              
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
      <div className="pt-16 flex editor-container mt-0.5">
        {/* Left Panel - Problem Description */}
        <div className="bg-white border-r border-gray-200 overflow-y-auto problem-panel">
          <div className="p-6">
            {/* Problem Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{currentProblem.id}. {currentProblem.title}</h1>
                  {(solvedProblems.has(currentProblem.id) || isSubmissionSuccessful) && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium flex items-center space-x-1">
                      <FontAwesomeIcon icon={faCheck} className="text-xs" />
                      <span>Solved</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`p-2 rounded-lg transition-colors ${
                      liked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <FontAwesomeIcon icon={liked ? faHeart : faHeartRegular} />
                  </button>
                  <button
                    onClick={() => setStarred(!starred)}
                    className={`p-2 rounded-lg transition-colors ${
                      starred ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                    }`}
                  >
                    <FontAwesomeIcon icon={starred ? faStar : faStarRegular} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentProblem.difficulty)}`}>
                  {currentProblem.difficulty}
                </span>
              </div>
            </div>

            {/* Problem Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <div className="prose text-gray-700 whitespace-pre-line">
                {currentProblem.description}
              </div>
            </div>

            {/* Input/Output Format */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Input Format</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700">{currentProblem.inputFormat}</pre>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Output Format</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700">{currentProblem.outputFormat}</pre>
              </div>
            </div>

            {/* Examples */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Examples</h3>
              {currentProblem.examples.map((example, index) => (
                <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Example {index + 1}:</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Input: </span>
                      <code className="text-sm bg-white px-2 py-1 rounded">{example.input}</code>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Output: </span>
                      <code className="text-sm bg-white px-2 py-1 rounded">{example.output}</code>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Explanation: </span>
                      <span className="text-sm text-gray-600">{example.explanation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Constraints</h3>
              <ul className="space-y-1">
                {currentProblem.constraints.map((constraint, index) => (
                  <li key={index} className="text-sm text-gray-700">• {constraint}</li>
                ))}
              </ul>
            </div>

            {/* Hints */}
            <div className="mb-6">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-3"
              >
                <FontAwesomeIcon icon={faLightbulb} className="text-sm" />
                <span className="font-medium">Show Hints ({currentProblem.hints.length})</span>
                <FontAwesomeIcon icon={faChevronDown} className={`text-sm transition-transform ${showHints ? 'rotate-180' : ''}`} />
              </button>
              
              {showHints && (
                <div className="space-y-2">
                  {currentProblem.hints.map((hint, index) => (
                    <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                      <span className="font-medium text-yellow-800">Hint {index + 1}: </span>
                      <span className="text-yellow-700">{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Topics */}
            <div className="mb-6">
              <button
                onClick={() => setShowTags(!showTags)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-3"
              >
                <FontAwesomeIcon icon={faTags} className="text-sm" />
                <span className="font-medium">Show Topics ({currentProblem.topics.length})</span>
                <FontAwesomeIcon icon={faChevronDown} className={`text-sm transition-transform ${showTags ? 'rotate-180' : ''}`} />
              </button>
              
              {showTags && (
                <div className="flex flex-wrap gap-2">
                  {currentProblem.topics.map((topic, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Companies */}
            <div className="mb-6">
              <button
                onClick={() => setShowCompanies(!showCompanies)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-3"
              >
                <FontAwesomeIcon icon={faBuilding} className="text-sm" />
                <span className="font-medium">Show Companies ({currentProblem.companies.length})</span>
                <FontAwesomeIcon icon={faChevronDown} className={`text-sm transition-transform ${showCompanies ? 'rotate-180' : ''}`} />
              </button>
              
              {showCompanies && (
                <div className="flex flex-wrap gap-2">
                  {currentProblem.companies.map((company, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {company}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex flex-col editor-panel h-full">
          {/* Editor Header */}
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 lg:space-x-4">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 lg:px-3 lg:py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(languages).map(([key, lang]) => (
                    <option key={key} value={key}>{lang.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="hidden lg:flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title={`${isDarkMode ? 'Light' : 'Dark'} Mode`}
                >
                  <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                </button>
              </div>
              
              <div className="flex items-center space-x-1 lg:space-x-2">
                <button
                  onClick={resetCode}
                  className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Reset Code"
                >
                  <FontAwesomeIcon icon={faRotateLeft} />
                </button>
                
                <button
                  onClick={copyCode}
                  className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copy Code"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="monaco-editor-wrapper flex-1" style={{minHeight: '400px'}}>
            <Editor
              height="100%"
              language={selectedLanguage}
              value={code}
              theme={isDarkMode ? 'vs-dark' : 'light'}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </div>

          {/* Test Cases and Output Section */}
          <div className="bg-white border-t border-gray-200 flex flex-col flex-shrink-0" style={{height: '300px'}}>
            {/* Action Buttons */}
            <div className="relative z-10 flex items-center justify-end space-x-2 px-4 lg:px-6 py-3 border-b border-gray-100 bg-white">
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title={isRunning ? 'Running...' : 'Run Code'}
              >
                <FontAwesomeIcon icon={faPlay} />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>
              
              <button
                onClick={submitCode}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title={isSubmitting ? 'Submitting...' : 'Submit Code'}
              >
                <FontAwesomeIcon icon={faCheck} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTestTab('sample')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTestTab === 'sample'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sample Tests
              </button>
              <button
                onClick={() => setActiveTestTab('custom')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTestTab === 'custom'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Custom Input
              </button>
              <button
                onClick={() => setActiveTestTab('console')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTestTab === 'console'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Console
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 lg:p-6 flex-1 overflow-y-auto hide-scrollbar">
              {activeTestTab === 'sample' && (
                <div className="space-y-4">
                  {testResults.length > 0 ? (
                    testResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Test Case {result.id}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {result.passed ? 'Passed' : 'Failed'}
                            </span>
                            <span className="text-xs text-gray-500">{result.runtime}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Input:</span>
                            <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">{result.input}</pre>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Expected:</span>
                            <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">{result.expectedOutput}</pre>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Your Output:</span>
                            <pre className={`p-2 rounded mt-1 text-sm ${
                              result.passed ? 'bg-green-50' : 'bg-red-50'
                            }`}>{result.actualOutput}</pre>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Show test cases before execution
                    <div className="space-y-4">
                      {currentProblem.testCases.filter(tc => !tc.hidden).map((testCase, index) => (
                        <div key={index + 1} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">Test Case {index + 1}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Input:</span>
                              <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">{testCase.input}</pre>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Expected Output:</span>
                              <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">{testCase.expectedOutput}</pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTestTab === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Input
                    </label>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your custom input here..."
                    />
                  </div>
                  
                  <button
                    onClick={runCustomInput}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Run with Custom Input
                  </button>
                  
                  {customOutput && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Output
                      </label>
                      <pre className="bg-gray-50 p-3 rounded-lg text-sm">{customOutput}</pre>
                    </div>
                  )}
                </div>
              )}

              {activeTestTab === 'console' && (
                <div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
                    {consoleOutput.length > 0 ? (
                      consoleOutput.map((line, index) => (
                        <div key={index} className="mb-1">
                          <span className="text-gray-500">$ </span>
                          {line}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">Console output will appear here...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;