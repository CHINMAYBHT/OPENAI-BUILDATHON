import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faPlay,
  faCheck,
  faFlag,
  faArrowRight,
  faArrowLeft,
  faRotateLeft,
  faCopy,
  faVolumeUp,
  faChevronDown,
  faChevronUp,
  faCheckCircle,
  faTimesCircle,
  faBars,
  faTimes,
  faQuestion,
  faSun,
  faMoon,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus
} from '@fortawesome/free-solid-svg-icons';

function TestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { testConfig, isViewOnly = false } = location.state || {};
  const editorRef = useRef(null);

  // Test Questions - Mock data
  const testQuestions = [
    {
      id: 1,
      type: 'coding',
      title: 'Two Sum',
      difficulty: 'Easy',
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
      examples: [
        {
          input: `nums = [2,7,11,15], target = 9`,
          output: `[0,1]`,
          explanation: `Because nums[0] + nums[1] == 9, we return [0, 1].`
        }
      ],
      testCases: [
        { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
        { input: '[3,2,4]\n6', expectedOutput: '[1,2]' }
      ]
    },
    {
      id: 2,
      type: 'coding',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      description: `Given a string s, find the length of the longest substring without repeating characters.

A substring is a contiguous sequence of characters within a string.`,
      examples: [
        {
          input: `s = "abcabcbb"`,
          output: `3`,
          explanation: `The answer is "abc", with the length of 3.`
        }
      ],
      testCases: [
        { input: '"abcabcbb"', expectedOutput: '3' },
        { input: '"bbbbb"', expectedOutput: '1' }
      ]
    }
  ];

  // State Management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(testConfig?.duration * 60 || 3600); // in seconds
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [activeTestTab, setActiveTestTab] = useState('sample');
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [problemPanelWidth,setProblemPanelWidth]=useState(25);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editorZoom, setEditorZoom] = useState(120);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);

  const currentQuestion = testQuestions[currentQuestionIndex];

  const languages = {
    javascript: { name: 'JavaScript', template: 'function solution(nums, target) {\n    // Write your solution here\n}' },
    python: { name: 'Python', template: 'def solution(nums, target):\n    # Write your solution here\n    pass' },
    java: { name: 'Java', template: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[0];\n    }\n}' },
    cpp: { name: 'C++', template: '#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}' }
  };

  // Timer useEffect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleTestSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Initialize code with template
  useEffect(() => {
    setCode(answers[currentQuestion.id] || languages[selectedLanguage].template);
  }, [currentQuestionIndex, selectedLanguage]);

  // Save answer when code changes
  const handleCodeChange = (value) => {
    setCode(value);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  // Handle panel resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (newWidth > 20 && newWidth < 80) {
        setProblemPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    if (isDraggingRef.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, []);

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
  };

  const handleResizeMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    if (newWidth > 20 && newWidth < 80) {
      setProblemPanelWidth(newWidth);
    }
  };

  const handleResizeMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
  };

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  // Run code
  const runCode = async () => {
    setIsRunning(true);
    setConsoleOutput(['Running code...']);
    
    // Simulate code execution
    setTimeout(() => {
      const mockResults = currentQuestion.testCases.map((tc, idx) => ({
        id: idx + 1,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: tc.expectedOutput, // Mock
        passed: true
      }));
      
      setTestResults(prev => ({
        ...prev,
        [currentQuestion.id]: mockResults
      }));
      setConsoleOutput(['✓ Code executed successfully!', 'Sample test cases passed.']);
      setIsRunning(false);
    }, 1500);
  };

  // Submit test
  const handleTestSubmit = () => {
    setShowSubmitConfirm(true);
  };

  // Confirm final submission
  const confirmSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      const results = {
        totalQuestions: testQuestions.length,
        solvedCorrectly: testQuestions.length - 1,
        score: 75,
        timeSpent: testConfig?.duration * 60 - timeLeft,
        testType: testConfig?.type,
        difficulty: testConfig?.difficulty,
        timestamp: new Date().toISOString()
      };

      // Save results to localStorage
      const allResults = JSON.parse(localStorage.getItem('testResults') || '[]');
      allResults.push(results);
      localStorage.setItem('testResults', JSON.stringify(allResults));

      navigate('/test-results', { state: { results } });
    }, 2000);
  };

  // Navigate questions
  const goToQuestion = (index) => {
    if (index >= 0 && index < testQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const goToPrevious = () => {
    goToQuestion(currentQuestionIndex - 1);
  };

  const goToNext = () => {
    goToQuestion(currentQuestionIndex + 1);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQuestionStatus = (qId) => {
    if (answers[qId]) return 'answered';
    if (selectedAnswers[qId]) return 'flagged';
    return 'unanswered';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-100 border-green-300 text-green-700';
      case 'flagged': return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const statusIcon = (status, index) => {
    switch (status) {
      case 'answered': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />;
      case 'flagged': return <FontAwesomeIcon icon={faFlag} className="text-yellow-600" />;
      default: return <span className="text-sm font-bold text-gray-600">{index + 1}</span>;
    }
  };

  // Get time warning color
  const getTimeColor = () => {
    if (timeLeft <= 300) return 'text-red-600 bg-red-100';
    if (timeLeft <= 900) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Questions List */}
      <div className={`${
        sidebarOpen ? 'w-60' : 'w-0'
      } transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden flex flex-col`}>
        {/* Sidebar Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 p-4 mt-6">
          <h2 className="text-lg font-bold text-gray-800">Questions</h2>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {testQuestions.map((question, index) => {
            const status = getQuestionStatus(question.id);
            return (
              <button
                key={question.id}
                onClick={() => {
                  goToQuestion(index);
                }}
                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  index === currentQuestionIndex
                    ? 'border-blue-500 bg-white'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {statusIcon(status, index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 mt-1 truncate">
                      {question.title}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>


      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FontAwesomeIcon icon={sidebarOpen ? faArrowLeft : faBars} />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Question {currentQuestionIndex + 1} of {testQuestions.length}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{testConfig?.type || 'Coding'} Test</p>
            </div>
          </div>

          {/* Timer and Actions */}
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg font-mono font-bold ${getTimeColor()}`}>
              {formatTime(timeLeft)}
            </div>
            
            <button
              onClick={() => setSelectedAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: !selectedAnswers[currentQuestion.id]
              }))}
              className={`p-3 rounded-lg transition-colors ${
                selectedAnswers[currentQuestion.id]
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Flag for review"
            >
              <FontAwesomeIcon icon={faFlag} />
            </button>
            
            <button
              onClick={handleTestSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              title="Submit Test"
            >
              <span className="hidden sm:inline">Finish Test</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden" ref={containerRef}>
          {/* Left - Problem Description */}
          <div className="transition-all duration-300 border-r border-gray-200 overflow-hidden hidden lg:flex flex-col bg-white" style={{width: `${problemPanelWidth}%`}}>
            {/* Panel Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Problem</h2>
            </div>

            {/* Panel Content */}
            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-6">
                {/* Problem Title */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">{currentQuestion.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div className="prose text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                    {currentQuestion.description}
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Examples</h3>
                  <div className="space-y-3">
                    {currentQuestion.examples.map((example, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">Input: </span>
                          <code className="text-sm text-gray-900">{example.input}</code>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">Output: </span>
                          <code className="text-sm text-gray-900">{example.output}</code>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Explanation: </span>
                          <p className="text-sm text-gray-600">{example.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resize Handle */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="w-1.5 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 hover:shadow-lg"
            title="Drag to resize"
          />

          {/* Right - Code Editor */}
          <div className="flex-1 flex flex-col" style={{width: `${100 - problemPanelWidth}%`}}>
            {/* Editor Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  disabled={isViewOnly}
                  className="pl-3 pr-7 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {Object.entries(languages).map(([key, lang]) => (
                    <option key={key} value={key}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCode(languages[selectedLanguage].template)}
                  disabled={isViewOnly}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Reset Code"
                >
                  <FontAwesomeIcon icon={faRotateLeft} />
                </button>

                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                  title={`${isDarkMode ? 'Light' : 'Dark'} Mode`}
                >
                  <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                </button>

                <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
                  <button
                    onClick={() => setEditorZoom(Math.max(80, editorZoom - 10))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    title="Zoom Out"
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
                  </button>
                  <span className="text-xs font-medium text-gray-600 min-w-[30px] text-center">{editorZoom}%</span>
                  <button
                    onClick={() => setEditorZoom(Math.min(150, editorZoom + 10))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    title="Zoom In"
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                  </button>
                </div>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-[60vh]">
              <Editor
                height="100%"
                language={selectedLanguage}
                value={code}
                onChange={isViewOnly ? undefined : handleCodeChange}
                theme={isDarkMode ? 'vs-dark' : 'vs-light'}
                options={{
                  minimap: { enabled: true },
                  fontSize: 13 * (editorZoom / 100),
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  readOnly: isViewOnly
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-white border-t border-gray-200 px-4 py-3 flex justify-end gap-2">
              <button
                onClick={runCode}
                disabled={isRunning || isViewOnly}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <FontAwesomeIcon icon={faPlay} />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>

              <button
                onClick={handleTestSubmit}
                disabled={isSubmitting || isViewOnly}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <FontAwesomeIcon icon={faCheck} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>

            {/* View-Only Notice */}
            {isViewOnly && (
              <div className="bg-blue-50 border-t border-blue-200 px-4 py-3">
                <p className="text-blue-800 text-sm font-medium">
                  📋 View Mode: This test has been submitted and cannot be modified. You can review your solution here.
                </p>
              </div>
            )}

            {/* Test Results Tab */}
            <div className="bg-white border-t border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  className="flex-1 px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
                >
                  Test Cases
                </button>
              </div>

              <div className="p-4 max-h-48 overflow-y-auto">
                <div className="space-y-3 text-sm">
                  {testResults[currentQuestion.id] ? (
                    testResults[currentQuestion.id].map((result) => (
                      <div key={result.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Test Case {result.id}</span>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {result.passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-50 p-2 rounded text-xs">
                            <span className="font-medium text-gray-700">Input:</span>
                            <pre className="text-gray-600 mt-1 whitespace-pre-wrap break-words text-xs">{result.input}</pre>
                          </div>
                          <div className="bg-gray-50 p-2 rounded text-xs">
                            <span className="font-medium text-gray-700">Expected:</span>
                            <pre className="text-gray-600 mt-1 whitespace-pre-wrap break-words text-xs">{result.expected}</pre>
                          </div>
                          <div className={`p-2 rounded text-xs ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                            <span className="font-medium text-gray-700">Your Output:</span>
                            <pre className={`mt-1 whitespace-pre-wrap break-words text-xs ${result.passed ? 'text-green-600' : 'text-red-600'}`}>{result.actual}</pre>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      {currentQuestion.testCases.map((testCase, index) => (
                        <div key={index + 1} className="border border-gray-200 rounded-lg p-3">
                          <div className="mb-2">
                            <span className="font-medium text-gray-900">Test Case {index + 1}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 p-2 rounded text-xs">
                              <span className="font-medium text-gray-700">Input:</span>
                              <pre className="text-gray-600 mt-1 whitespace-pre-wrap break-words text-xs">{testCase.input}</pre>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-xs">
                              <span className="font-medium text-gray-700">Expected:</span>
                              <pre className="text-gray-600 mt-1 whitespace-pre-wrap break-words text-xs">{testCase.expectedOutput}</pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Submit Test?</h3>
              <p className="text-gray-600 mt-2">
                You have answered {Object.keys(answers).length} out of {testQuestions.length} questions.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Once submitted, you cannot change your answers. Make sure you've reviewed all questions.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestPage;
