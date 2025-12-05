import { useState, useEffect, useRef, useCallback } from 'react';
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
  faMoon,
  faSearchPlus,
  faSearchMinus,
  faClock,
  faPause,
  faRotateRight
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular, faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

function CodeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const chatRef = useRef(null);
  const isDraggingRef = useRef(false);

  const [languages, setLanguages] = useState({
    javascript: { name: 'JavaScript' },
    python: { name: 'Python' },
    cpp: { name: 'C++' },
    java: { name: 'Java' }
  });
  const [boilerplatesLoaded, setBoilerplatesLoaded] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return (saved && languages[saved]) ? saved : 'javascript';
  });
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [activeTestTab, setActiveTestTab] = useState('sample');
  // Removed custom input feature per request
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);
  const [showTags, setShowTags] = useState(false);
  // Hints and companies are shown by default (toggle buttons removed)
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [fontSize, setFontSize] = useState(16.8);
  const [viewMode, setViewMode] = useState('normal'); // 'normal' or 'application'
  const [applicationData, setApplicationData] = useState(null);
  const [generatingApplicationData, setGeneratingApplicationData] = useState(false);
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);

  // AI Chatbot states
  const [showChat, setShowChat] = useState(false);
  const [chatPosition, setChatPosition] = useState(() => ({
    x: window.innerWidth - 400, // Position from right edge
    y: 100
  }));
  const [isChatDragging, setIsChatDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const chatInitialPositionRef = useRef({ x: 100, y: 100 });
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  // API base (backend) - during dev set VITE_API_BASE or VITE_BACKEND_URL, otherwise default to localhost:5000
  const apiBase = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')
    : 'http://localhost:5000';

  // Problem data fetched from DB (by slug)
  const [problemData, setProblemData] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [problemError, setProblemError] = useState(null);

  // Timer states
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(60); // Default 60 minutes
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [timerInputMinutes, setTimerInputMinutes] = useState('60'); // User input for timer

  // Timer useEffect - now counts down
  useEffect(() => {
    let interval;
    if (isTimerRunning && !isTimerPaused && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isTimerPaused, timerSeconds]);

  // Timer functions
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    setIsTimerPaused(false);
  };

  const pauseTimer = () => {
    setIsTimerPaused(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setIsTimerPaused(false);
  };

  const resetTimer = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setIsTimerPaused(false);
  };

  // currentProblem: Always use the fetched DB data. If not loaded yet, use an empty structure.
  const currentProblem = problemData || {
    id: null,
    title: 'Loading...',
    number: 0,
    total: 0,
    difficulty: '',
    description: 'Loading problem data...',
    inputFormat: '',
    outputFormat: '',
    constraints: [],
    examples: [],
    topics: [],
    companies: [],
    hints: [],
    testCases: []
  };

  // Load problem data and AI chats from DB
  useEffect(() => {
    let mounted = true;
    const loadProblemAndChats = async () => {
      setLoadingProblem(true);
      setProblemError(null);
      setProblemData(null);
      setMessages([]); // Reset chats

      // If `id` looks numeric, we may be using legacy numeric ids (local fallback)
      // In that case we still try to treat it as a slug first and fall back to numeric behavior.
      const slug = String(id || '').trim();
      if (!slug) {
        setLoadingProblem(false);
        return;
      }

      try {
        const { supabase } = await import('../utils/supabase');

        // Select problem and its testcases
        const { data: problemData, error: problemError } = await supabase
          .from('problems')
          .select('id, problem_number, slug, title, description, input_format, output_format, constraints, examples, difficulty, topics, testcases(id, input, expected_output, is_hidden)')
          .eq('slug', slug)
          .maybeSingle();

        if (problemError) throw problemError;
        if (!mounted) return;

        let mappedProblem = null;
        if (problemData) {
          // Map DB fields to the component's expected shape
          mappedProblem = {
            id: problemData.id,
            slug: problemData.slug,
            title: problemData.title || 'Untitled',
            number: problemData.problem_number ?? 0,
            total: 100,
            difficulty: problemData.difficulty ? String(problemData.difficulty).charAt(0).toUpperCase() + String(problemData.difficulty).slice(1) : 'Medium',
            description: problemData.description || '',
            appDescription: problemData.app_description || '',
            inputFormat: problemData.input_format || '',
            outputFormat: problemData.output_format || '',
            constraints: Array.isArray(problemData.constraints) ? problemData.constraints : (problemData.constraints ? (typeof problemData.constraints === 'string' ? [problemData.constraints] : problemData.constraints) : []),
            examples: Array.isArray(problemData.examples) ? problemData.examples : (problemData.examples ? problemData.examples : []),
            topics: Array.isArray(problemData.topics) ? problemData.topics : (problemData.topics ? problemData.topics : []),
            companies: [],
            hints: [],
            testCases: (problemData.testcases || []).map(tc => ({ input: tc.input, expectedOutput: tc.expected_output, hidden: tc.is_hidden }))
          };

          setProblemData(mappedProblem);
        }

        // Load AI chat history for this problem
        if (mappedProblem?.id) {
          const { data: chatData, error: chatError } = await supabase
            .from('problem_ai_chats')
            .select('role, message, created_at')
            .eq('problem_id', mappedProblem.id)
            .eq('user_id', supabase.auth.user()?.id)
            .order('created_at', { ascending: true });

          if (!chatError && chatData && mounted) {
            const chatMessages = chatData.map((chat, index) => ({
              id: Date.now() + index, // Use unique ids
              text: chat.message,
              isUser: chat.role === 'user'
            }));
            setMessages(chatMessages);
          }
        } else {
          // No problem found for slug - keep null so fallback runs
          setProblemData(null);
        }
      } catch (err) {
        setProblemError(err.message || String(err));
      } finally {
        setLoadingProblem(false);
      }
    };

    loadProblemAndChats();
    return () => { mounted = false; };
  }, [id]);

  // Application-level view (interview-style) - hardcoded for now, will be AI-generated later
  // No hardcoded applicationLevelData - always use real DB or AI-generated data

  // Function to generate application-level problem description
  const generateApplicationView = async () => {
    if (applicationData && viewMode === 'application') {
      // If we already have application data for this problem, just switch mode
      setViewMode('application');
      return;
    }

    // Check if we already have a cached application description for this problem
    if (currentProblem.appDescription) {
      setApplicationData(currentProblem.appDescription);
      setViewMode('application');
      return;
    }

    // Check localStorage for cached application description
    const problemId = currentProblem?.id || currentProblem?.slug || id;
    const cacheKey = `app-description-${problemId}`;
    const cachedDescription = localStorage.getItem(cacheKey);

    if (cachedDescription) {
      console.log('Using cached application description from localStorage');
      setApplicationData(cachedDescription);
      setViewMode('application');
      return;
    }

    setGeneratingApplicationData(true);
    try {
      console.log('Generating new application description from API');
      const res = await fetch(`${apiBase}/api/gemini/application-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problemId,
          description: currentProblem.description
        })
      });

      const data = await res.json();
      if (data.applicationDescription) {
        // Store in localStorage for future use
        localStorage.setItem(cacheKey, data.applicationDescription);
        setApplicationData(data.applicationDescription);
        setViewMode('application');
      } else if (data.error) {
        console.error('Error generating application description:', data.error);
        // Fallback to hardcoded data
        const fallback = applicationLevelData[currentProblem.number]?.description || currentProblem.description;
        setApplicationData(fallback);
        setViewMode('application');
      }
    } catch (e) {
      console.error('Failed to generate application view:', e);
      // Fallback to hardcoded data
      const fallback = applicationLevelData[currentProblem.number]?.description || currentProblem.description;
      setApplicationData(fallback);
      setViewMode('application');
    } finally {
      setGeneratingApplicationData(false);
    }
  };

  // Function to reset/clear cached application description and regenerate
  const resetApplicationDescription = async () => {
    const problemId = currentProblem?.id || currentProblem?.slug || id;
    const cacheKey = `app-description-${problemId}`;

    // Clear the cached description from localStorage
    localStorage.removeItem(cacheKey);
    console.log('Cleared cached application description from localStorage');

    // Clear current application data
    setApplicationData(null);

    // Regenerate by calling the API again
    await generateApplicationView();
  };

  // Get the current view data based on viewMode
  // Always use real DB data or AI-generated data, no hardcoded fallbacks
  const currentViewData = viewMode === 'application'
    ? {
      ...currentProblem,
      // Prefer the DB `app_description`, then generated AI data, finally original description
      description: currentProblem.appDescription || applicationData || currentProblem.description,
      inputFormat: currentProblem.inputFormat,
      outputFormat: currentProblem.outputFormat,
      examples: currentProblem.examples
    }
    : currentProblem;

  // Load stored code when problem or language changes (after boilerplates are loaded)
  useEffect(() => {
    // Only load code after boilerplates are available
    if (!boilerplatesLoaded) {
      return;
    }

  const problemId = currentProblem?.id || currentProblem?.slug || id;
  const storageKey = `code-${problemId}-${selectedLanguage}`;
  const storedCode = localStorage.getItem(storageKey);

  // Prefer stored user progress over fresh DB boilerplate
  // Only use template if no stored code exists
  const dbTemplate = languages[selectedLanguage]?.template || '';

  if (storedCode) {
    // Load user's saved code when available
    console.log(`Loading stored code for ${selectedLanguage}:`, storedCode.substring(0, 100) + '...');
    setCode(storedCode);
  } else if (dbTemplate) {
    // Fallback to DB boilerplate if no stored code
    console.log(`No stored code found. Loading DB boilerplate for ${selectedLanguage}:`, dbTemplate.substring(0, 100) + '...');
    setCode(dbTemplate);
  } else {
    // Nothing available - start empty
    console.log(`No stored code or boilerplate found for ${selectedLanguage}, starting with empty code`);
    setCode('');
  }
  }, [selectedLanguage, languages, currentProblem, id, boilerplatesLoaded]);

  // Load language-specific boilerplates from DB on component mount
  useEffect(() => {
    let mounted = true;
    const loadBoilerplates = async () => {
      try {
        const { supabase } = await import('../utils/supabase');
        const { data, error } = await supabase
          .from('problem_boilerplates')
          .select('boilerplate_code, languages(slug)')
          .order('id'); // Just get all records

        if (error) throw error;
        if (!mounted) return;

        console.log('Loaded boilerplates:', data);

        if (Array.isArray(data) && data.length > 0) {
          const updates = {};
          data.forEach(row => {
            const slug = row.languages?.slug || '';
            let key = slug.toLowerCase();
            // Normalize common slugs to our language keys
            if (key === 'js' || key === 'javascript') key = 'javascript';
            else if (key === 'py' || key === 'python') key = 'python';
            else if (key === 'java') key = 'java';
            else if (key === 'cpp' || key === 'c++') key = 'cpp';
            else if (key === 'go' || key === 'golang') key = 'go';
            else if (key === 'rust') key = 'rust';

            const code = row.boilerplate_code || '';
            if (key && Object.keys(languages).includes(key)) {
              updates[key] = {
                name: key.charAt(0).toUpperCase() + key.slice(1),
                template: code
              };
              console.log(`Updated template for ${key}:`, code.substring(0, 100) + '...');
            }
          });

          // Update languages with DB templates (fallback to built-in templates)
          if (Object.keys(updates).length > 0) {
            setLanguages(prev => ({
              ...prev,
              ...updates
            }));
            console.log('Updated languages with DB templates:', Object.keys(updates));
          }
        }
        // Mark boilerplates as loaded (success or empty data)
        setBoilerplatesLoaded(true);
      } catch (err) {
        console.warn('Failed to load boilerplates', err);
        // Mark as loaded even on error so code editor doesn't stay empty forever
        setBoilerplatesLoaded(true);
      }
    };

    loadBoilerplates();
    return () => { mounted = false; };
  }, []); // Only run once on mount, not when problemData changes

  // Load solved problems and language preference from localStorage on component mount
  useEffect(() => {
    // Scroll to top when component mounts to ensure header is visible
    window.scrollTo(0, 0);

    const savedSolvedProblems = localStorage.getItem('solvedProblems');
    if (savedSolvedProblems) {
      setSolvedProblems(new Set(JSON.parse(savedSolvedProblems)));
    }

    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && languages[savedLanguage]) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  // Save language preference whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
  }, [selectedLanguage]);

  // Load problem-specific AI chats from Supabase when problemData becomes available
  useEffect(() => {
    let mounted = true;
    const loadChats = async () => {
      if (!problemData || !problemData.id) return;
      try {
        const { supabase } = await import('../utils/supabase');

        // Fetch chats for this problem for the current authenticated user
        const { data, error } = await supabase
          .from('problem_ai_chats')
          .select('id, role, message, created_at')
          .eq('problem_id', problemData.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (!mounted) return;

        if (Array.isArray(data)) {
          // Map to local message shape (isUser boolean, text, id)
          const mapped = data.map(row => ({ id: row.id, text: row.message, isUser: row.role === 'user', created_at: row.created_at }));
          setMessages(mapped);
        }
      } catch (err) {
        // If fetch fails (e.g., unauthenticated), keep existing local messages
        console.warn('Failed to load AI chats:', err);
      }
    };

    loadChats();
    return () => { mounted = false; };
  }, [problemData]);

  const handleEditorChange = (value) => {
    setCode(value);
    // Save to localStorage whenever code changes
    const problemId = currentProblem?.id || currentProblem?.slug || id;
    const storageKey = `code-${problemId}-${selectedLanguage}`;
    localStorage.setItem(storageKey, value);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // AI Hint Generator based on test results
  const generateAIHint = (testResults, problem) => {
    const failedTests = testResults.filter(test => !test.passed);
    const passedTests = testResults.filter(test => test.passed);

    if (failedTests.length === 0) {
      let message = "🎉 Excellent! All test cases are passing. Your solution is correct!\n\n";

      // Problem-specific feedback for Two Sum when successful
      if (problem.id === 1) {
        message += "Performance Analysis:\n";
        if (testResults.length >= 3) {
          const avgRuntime = testResults.reduce((sum, r) => sum + parseInt(r.runtime), 0) / testResults.length;
          message += `• Average runtime: ${avgRuntime.toFixed(1)}ms\n`;
          message += `• All test cases executed successfully\n\n`;
        }

        message += "What makes your solution work:\n";
        message += `• You correctly identified pairs that sum to the target\n`;
        message += `• You avoided reusing the same element twice\n`;
        message += `• Array indices are returned in the correct format\n\n`;

        message += "Next Steps:\n";
        message += `• Try optimizing your solution using a hash table for O(n) time complexity\n`;
        message += `• Consider the space vs time tradeoff in different approaches\n`;
        message += `• Ready to move to the next problem?`;
      } else {
        message += "Well done!\n";
        message += `• Your algorithm handles all edge cases correctly\n`;
        message += `• Time and space complexity are optimal\n\n`;
        message += "Keep practicing! Try more problems in this difficulty range.";
      }

      return message;
    }

    let hint = `I see you're having trouble with some test cases. Let's analyze what might be wrong:

Failed tests: ${failedTests.length}/${testResults.length}
Passed tests: ${passedTests.length}/${testResults.length}

`;

    // Problem-specific hints for Two Sum
    if (problem.id === 1) {
      if (failedTests.length === testResults.length) {
        hint += `Common issues with Two Sum:

1. Array Iteration: Make sure you're checking each element against every other element (nested loops).
2. No Re-use: Each element in the array can only be used once (don't use the same index twice).
3. Return Indices: Return the actual indices [i, j], not the values.

Try this approach:
\`\`\`javascript
function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return []; // No solution found
}
\`\`\``;
      } else if (failedTests.length > 0 && passedTests.length > 0) {
        hint += `Some tests are passing, which is good!

Possible issues:
1. Edge cases: You might be missing edge cases like [3,3] with target 6 (same value, different indices).
2. Array bounds: Make sure you're not going out of bounds with your indices.
3. Multiple solutions: There might be multiple pairs that sum to target - return any valid pair.

Debug tip: Try running your code manually with the failing test case inputs to see what's happening.`;
      }
    } else {
      // Generic hint for other problems
      hint += `General debugging tips:
1. Check your algorithm logic step by step
2. Handle edge cases (empty arrays, single elements, etc.)
3. Verify your input/output format matches the requirements
4. Test with simple cases first

Try going through the problem requirements again and see if you're missing anything.`;
    }

    return hint;
  };

  const runCode = async () => {
    setIsRunning(true);

    try {
      const { supabase } = await import('../utils/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      // Step 1: Check for compilation errors first
      console.log('Checking code for compilation/syntax errors...');
      const compilationError = checkForCompilationErrors(code, selectedLanguage);

      if (compilationError) {
        // Display compilation error in console and switch to console tab
        setConsoleOutput([
          'Compilation Error Detected!',
          '',
          'Error Details:',
          compilationError,
          '',
          'Please fix the compilation error before running tests.'
        ]);

        // Switch to console tab to show error
        setActiveTestTab('console');

        // Request AI analysis for compilation error
        callAssistant(compilationError);

        setIsRunning(false);
        return;
      }

      setConsoleOutput(['Running code...']);

      // Prepare test cases (non-hidden only for run)
      const testCasesToRun = currentProblem.testCases.filter(tc => !tc.hidden).map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput
      }));

      if (testCasesToRun.length === 0) {
        setConsoleOutput(['No test cases available to run.']);
        setIsRunning(false);
        return;
      }

      // Call backend to execute with Judge0
      console.log('Sending request to Judge0 via backend...');
      const response = await fetch(`${apiBase}/api/gemini/run-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          language: selectedLanguage,
          testCases: testCasesToRun
        })
      });

      const data = await response.json();
      console.log('Judge0 response received:', data);

      if (!response.ok || !data.success) {
        setConsoleOutput([
          'Code execution failed.',
          data.error || 'Unknown error occurred',
          ...(data.details ? [data.details] : [])
        ]);
        setIsRunning(false);
        return;
      }

      // Check if there are any compilation errors
      const hasCompilationErrors = data.results.some(result => result.compilationError);

      // Format results for display - remove compilation errors from test results display
      const results = data.results.map((result, index) => ({
        id: index + 1,
        input: result.input,
        expectedOutput: result.expectedOutput,
        actualOutput: result.actualOutput,
        passed: result.passed,
        runtime: result.runtime,
        stderr: result.stderr,
        compilationError: null, // Remove from test results display
        statusDescription: result.statusDescription
      }));

      setTestResults(results);

      // Build console output
      const summary = data.summary;
      const consoleMsg = [
        `Code execution completed: ${summary.passedTests}/${summary.totalTests} tests passed`
      ];

      // If there are compilation errors, show them in console
      if (hasCompilationErrors) {
        const compilationErrors = data.results
          .filter(result => result.compilationError)
          .map((result, index) => `Test ${index + 1}: ${result.compilationError}`)
          .join('\n');

        consoleMsg.push(
          '',
          'Compilation Errors Found:',
          compilationErrors,
          '',
          'Some test cases failed. Check details below.'
        );
      } else if (!summary.allPassed) {
        // Only show test failure message if no compilation errors
        consoleMsg.push('Some test cases failed. Check details below.');
      } else {
        consoleMsg.push('All test cases passed! ✓');
      }

      setConsoleOutput(consoleMsg);

      // Send compilation errors to AI analysis
      const compilationErrorToSend = hasCompilationErrors
        ? data.results
          .filter(result => result.compilationError)
          .map(result => result.compilationError)
          .join('\n')
        : null;

      // Request AI analysis from server-side assistant proxy
      callAssistant(compilationErrorToSend);

      // Enable button immediately - AI analysis runs in background
      setIsRunning(false);

      // Switch to console tab if there are compilation errors
      if (hasCompilationErrors) {
        setActiveTestTab('console');
      }

    } catch (err) {
      console.error('Error running code:', err);
      setConsoleOutput([
        'Failed to run code.',
        err.message
      ]);
      setActiveTestTab('console'); // Switch to console to show error
      setIsRunning(false);
    } finally {
      // Save run to database (non-critical, don't block)
      try {
        const { supabase } = await import('../utils/supabase');
        const { data: { user } } = await supabase.auth.getUser();

        if (user && currentProblem.id) {
          fetch(`${apiBase}/api/gemini/save-run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              problem_id: currentProblem.id,
              user_id: user.id,
              language: selectedLanguage,
              code: code,
              run_output: consoleOutput.join('\n')
            })
          }).catch(err => console.warn('Save run failed:', err));
        }
      } catch (err) {
        console.warn('Failed to save run:', err);
      }
    }
  };

  // Function to check for basic compilation/syntax errors
  const checkForCompilationErrors = (code, language) => {
    if (!code || code.trim() === '') {
      return 'Error: Code is empty. Please write some code before running.';
    }

    // Basic JavaScript syntax checking
    if (language === 'javascript') {
      try {
        // Try to parse the code
        new Function(code);
      } catch (e) {
        const errorMessage = e.message;
        const lineMatch = errorMessage.match(/line (\d+)/);
        const lineInfo = lineMatch ? ` at line ${lineMatch[1]}` : '';
        return `Syntax Error${lineInfo}: ${errorMessage}`;
      }
    }

    // Basic Python syntax checking (simple checks)
    if (language === 'python') {
      // Check for common Python syntax issues
      const lines = code.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check for basic indentation issues (simple check)
        if (line.length > 0 && !line.startsWith(' ') && !line.startsWith('\t') && i > 0) {
          const prevLine = lines[i - 1]?.trim();
          if (prevLine && (prevLine.endsWith(':') || prevLine.match(/\b(?:if|for|while|def|class|with|try)\b[^:]*$/))) {
            return `Syntax Error at line ${i + 1}: Expected indented block after '${prevLine}'`;
          }
        }
      }
    }

    // Check for incomplete code structures
    const bracketCount = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
    if (bracketCount > 0) {
      return `Syntax Error: Missing closing brace '}'. Open braces: ${bracketCount}`;
    }
    if (bracketCount < 0) {
      return `Syntax Error: Extra closing brace '}'. Unmatched braces: ${Math.abs(bracketCount)}`;
    }

    const parenCount = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
    if (parenCount > 0) {
      return `Syntax Error: Missing closing parenthesis ')'. Open parentheses: ${parenCount}`;
    }
    if (parenCount < 0) {
      return `Syntax Error: Extra closing parenthesis ')'. Unmatched parentheses: ${Math.abs(parenCount)}`;
    }

    // For other languages, we could add more checks or just return null for now
    // In a real implementation, you'd integrate with a language server or compiler

    return null; // No compilation error detected
  };

  const submitCode = async () => {
    setIsSubmitting(true);
    setConsoleOutput(['Submitting code...']);

    try {
      const { supabase } = await import('../utils/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      // Simulate submission
      setTimeout(async () => {
        // Simulate test results (in real app, this would be based on actual test execution)
        const mockTestResults = currentProblem.testCases.filter(tc => !tc.hidden).map((testCase, index) => ({
          id: index + 1,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: testCase.expectedOutput, // Simulate passing
          passed: true, // Simulate success
          runtime: Math.floor(Math.random() * 50) + 10 + 'ms'
        }));

        // Calculate test pass rate and success
        const testCasesPassed = mockTestResults.filter(r => r.passed).length;
        const totalTestCases = mockTestResults.length;
        const success = testCasesPassed === totalTestCases;

        // Prepare results data for navigation
        const submissionData = {
          success: success,
          testCasesPassed: testCasesPassed,
          totalTestCases: totalTestCases,
          timeTaken: timerTotalSeconds - timerSeconds, // Time used
          totalTime: timerTotalSeconds,
          code: code,
          problemId: currentProblem.id
        };

        if (success) {
          setConsoleOutput(['Submission successful!', 'All test cases passed.', 'Runtime: 92ms', 'Memory: 41.2 MB']);

          // SAVE SUBMISSION TO DATABASE BEFORE NAVIGATING WITH AI REVIEW
          if (user && currentProblem.id) {
            const saveSubmissionData = {
              problem_id: currentProblem.id,
              user_id: user.id,
              language: selectedLanguage,
              code: code,
              final_status: 'passed',
              passed_count: testCasesPassed,
              total_tests: totalTestCases,
              test_results: mockTestResults.map((result, index) => ({
                testcase_id: null, // We'll set this later when we have proper testcases
                passed: result.passed,
                actual_output: result.actualOutput,
                expected_output: result.expectedOutput,
                time_ms: parseInt(result.runtime) || 0
              })),
              problem_description: currentProblem.description,
              test_cases: currentProblem.testCases
            };

            try {
              const saveResponse = await fetch(`${apiBase}/api/gemini/save-submission-with-review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saveSubmissionData)
              });

              const saveData = await saveResponse.json();
              if (saveData.success) {
                console.log('✅ Submission with AI review saved to database:', saveData.submissionId);
                // Update navigation state with AI review data
                submissionData.aiReview = saveData.aiReview;
                submissionData.readability_score = saveData.aiReview?.readability_score || null;
                submissionData.maintainability_score = saveData.aiReview?.maintainability_score || null;
              } else {
                console.error('❌ Failed to save submission:', saveData.error);
              }
            } catch (saveErr) {
              console.error('❌ Error saving submission to database:', saveErr);
            }
          }

          // Mark the current problem as solved
          const newSolvedProblems = new Set(solvedProblems);
          newSolvedProblems.add(currentProblem.id);
          setSolvedProblems(newSolvedProblems);
          setIsSubmissionSuccessful(true);

          // Save to localStorage
          localStorage.setItem('solvedProblems', JSON.stringify([...newSolvedProblems]));

          // Navigate to results page
          navigate('/submission-results', { state: submissionData });
        } else {
          setConsoleOutput(['Submission failed!', 'Some test cases did not pass.', 'Please review your solution.']);
          setIsSubmissionSuccessful(false);
        }

        setIsSubmitting(false);
      }, 2000);

    } finally {
      // Note: setIsSubmitting(false) is now inside the setTimeout
    }
  };

  const resetCode = () => {
    const confirmed = window.confirm('Are you sure you want to reset your code to the default template? This will overwrite your current changes.');
    if (confirmed) {
      // Clear localStorage to prevent showing old code on reload
      const problemId = currentProblem?.id || currentProblem?.slug || id;
      const storageKey = `code-${problemId}-${selectedLanguage}`;
      localStorage.removeItem(storageKey);

      // Reset to template
      setCode(languages[selectedLanguage].template);
      setTestResults([]);
      setConsoleOutput([]);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setShowCopiedPopup(true);
      // Auto-hide popup after 2 seconds
      setTimeout(() => setShowCopiedPopup(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      setConsoleOutput([...consoleOutput, 'Failed to copy code to clipboard']);
    }
  };

  // custom input removed

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
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Safely render values that may be objects (JSON) or strings
  const renderValue = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    try {
      return JSON.stringify(v, null, 2);
    } catch (e) {
      return String(v);
    }
  };

  // Draggable divider handlers
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Chat dragging handlers
  const handleChatMouseDown = (e) => {
    setIsChatDragging(true);
    if (chatRef.current) {
      const rect = chatRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      chatInitialPositionRef.current = { x: rect.left, y: rect.top };
      chatRef.current.style.transition = 'none'; // Disable transitions during drag
    }
    e.preventDefault();
  };

  const handleChatMouseMove = useCallback((e) => {
    if (!isChatDragging || !chatRef.current) return;

    const newX = e.clientX - dragOffsetRef.current.x;
    const newY = e.clientY - dragOffsetRef.current.y;

    // Direct DOM manipulation for smooth dragging (no React state delays)
    chatRef.current.style.left = `${newX}px`;
    chatRef.current.style.top = `${newY}px`;

    // Update the final position for React state
    chatInitialPositionRef.current = { x: newX, y: newY };
  }, [isChatDragging]);

  const handleChatMouseUp = useCallback(() => {
    setIsChatDragging(false);
  }, []);

  useEffect(() => {
    if (isChatDragging) {
      document.addEventListener('mousemove', handleChatMouseMove);
      document.addEventListener('mouseup', handleChatMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleChatMouseMove);
      document.removeEventListener('mouseup', handleChatMouseUp);
    };
  }, [isChatDragging, handleChatMouseMove, handleChatMouseUp]);

  // Send message function
  const sendMessage = async () => {
    // Prevent sending while AI is still responding
    if (isThinking) return;
    if (!chatInput.trim()) return;
    const userMessage = { id: Date.now(), text: chatInput, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsThinking(true);

    // Persist user message to Supabase (if authenticated). If persistence fails, continue gracefully.
    try {
      const { supabase } = await import('../utils/supabase');
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user && problemData && problemData.id) {
        const { error: insertError } = await supabase.from('problem_ai_chats').insert([
          {
            user_id: user.id,
            problem_id: problemData.id,
            role: 'user',
            message: chatInput
          }
        ]);
        if (insertError) console.warn('Failed to persist user chat:', insertError);
      }
    } catch (err) {
      console.warn('Error persisting user chat:', err);
    }

    // Try calling the server assistant with the chat query; fallback to mock on error
    try {
      const payload = {
        code,
        // Send the full problem description from the currently selected view
        problem: currentViewData?.description || currentProblem?.description || '',
        // Also send the user's chat message as a separate field the server can use as a query
        query: chatInput,
        input: currentViewData.inputFormat,
        output: currentViewData.outputFormat,
        language: selectedLanguage
      };

      const res = await fetch(`${apiBase}/api/gemini/assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      let aiResponse;
      if (data && data.assistantResponse) {
        aiResponse = typeof data.assistantResponse === 'string' ? data.assistantResponse : JSON.stringify(data.assistantResponse, null, 2);
      } else if (data && data.error) {
        aiResponse = `Assistant error: ${data.error}`;
      } else {
        aiResponse = "No response from assistant";
      }

      const aiMessage = { id: Date.now() + 1, text: aiResponse, isUser: false };
      setMessages(prev => [...prev, aiMessage]);

      // Persist assistant message to Supabase as well (so conversation is restorable)
      try {
        const { supabase } = await import('../utils/supabase');
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;

        if (user && problemData && problemData.id) {
          const { error: insertError } = await supabase.from('problem_ai_chats').insert([
            {
              user_id: user.id,
              problem_id: problemData.id,
              role: 'assistant',
              message: aiResponse
            }
          ]);
          if (insertError) console.warn('Failed to persist assistant chat:', insertError);
        }
      } catch (err) {
        console.warn('Error persisting assistant chat:', err);
      }
    } catch (e) {
      // No live assistant available — surface a helpful message instead of a mock
      console.warn('Assistant proxy failed:', e);
      const aiResponse = "Assistant unavailable: server call failed. Please configure GEMINI_API_KEY and GEMINI_API_URL in the backend and restart the server.";
      const aiMessage = { id: Date.now() + 1, text: aiResponse, isUser: false };
      setMessages(prev => [...prev, aiMessage]);

      // Optionally persist the failure response as assistant text
      try {
        const { supabase } = await import('../utils/supabase');
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (user && problemData && problemData.id) {
          await supabase.from('problem_ai_chats').insert([
            { user_id: user.id, problem_id: problemData.id, role: 'assistant', message: aiResponse }
          ]);
        }
      } catch (err) {
        // ignore
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Call server-side assistant proxy with code + problem details
  const callAssistant = async (compilationError = null) => {
    setIsThinking(true);
    try {
      // Build error context from compilation errors and test results
      let errorContext = '';

      // Add compilation error if present
      if (compilationError) {
        errorContext += `\n\nCompilation Error:\n${compilationError}\n\nPlease help me fix this compilation error first.`;
      }

      // Add test execution results if available
      if (!compilationError && testResults && testResults.length > 0) {
        const failedTests = testResults.filter(r => !r.passed);
        if (failedTests.length > 0) {
          errorContext = '\n\nTest Execution Results:\n';
          failedTests.forEach((test, idx) => {
            errorContext += `Failed Test ${idx + 1}:\n`;
            if (test.compilationError) {
              errorContext += `Compilation Error: ${test.compilationError}\n`;
            }
            if (test.stderr) {
              errorContext += `Runtime Error: ${test.stderr}\n`;
            }
            if (test.expectedOutput && test.actualOutput !== test.expectedOutput) {
              errorContext += `Expected: ${test.expectedOutput}\nActual: ${test.actualOutput}\n`;
            }
          });
        }
      }

      const query = compilationError
        ? 'Please help me fix this compilation error so I can run my tests.'
        : 'Please analyze my code and help me fix the failing test cases.';

      const payload = {
        code,
        problem: currentViewData.description + errorContext,
        input: currentViewData.inputFormat,
        output: currentViewData.outputFormat,
        language: selectedLanguage,
        query: query
      };

      const res = await fetch(`${apiBase}/api/gemini/assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.error) {
        setAiAnalysis(`Assistant error: ${data.error}`);
      } else if (data.assistantResponse) {
        // Format assistantResponse for display
        const resp = typeof data.assistantResponse === 'string'
          ? data.assistantResponse
          : JSON.stringify(data.assistantResponse, null, 2);
        setAiAnalysis(resp);

        // AI analysis is temporary and not saved to database
      } else {
        setAiAnalysis('No response from assistant');
      }
    } catch (e) {
      setAiAnalysis('Assistant call failed: ' + String(e));
    } finally {
      setIsThinking(false);
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
          
          .editor-panel {
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
        .resize-handle {
          cursor: col-resize;
          user-select: none;
        }
        .resize-handle:hover {
          background-color: #3b82f6;
        }
        @keyframes blink-red {
          0%, 100% { color: #dc2626; /* red-600 */ }
          50% { color: #fbbf24; /* yellow-400 */ }
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm border-b">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <span className="text-lg font-bold text-gray-800">Job Builder</span>

              {/* Problem Navigation removed: previous/next buttons disabled */}
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600">Problem #{currentProblem.number}</span>
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
        <div className="bg-white  border-r border-gray-200  problem-panel" style={{ width: `${leftPanelWidth}%` }}>
          <div className="p-6">
            {/* View Mode Toggle */}
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('normal')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${viewMode === 'normal'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    Normal Problem View
                  </button>
                  <button
                    onClick={() => generateApplicationView()}
                    disabled={generatingApplicationData}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${viewMode === 'application'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      } ${generatingApplicationData ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {generatingApplicationData ? 'Generating...' : 'Application-Level View'}
                  </button>
                </div>

                {/* Reset Application Description Icon - only visible in application view */}
                {viewMode === 'application' && !generatingApplicationData && (
                  <button
                    onClick={() => resetApplicationDescription()}
                    className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Generate new application description"
                  >
                    <FontAwesomeIcon icon={faRotateRight} className="text-sm" />
                  </button>
                )}
              </div>
            </div>

            {/* Problem Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{currentProblem.number || currentProblem.id}. {currentProblem.title}</h1>
                  {(solvedProblems.has(currentProblem.number) || solvedProblems.has(currentProblem.id) || isSubmissionSuccessful) && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium flex items-center space-x-1">
                      <FontAwesomeIcon icon={faCheck} className="text-xs" />
                      <span>Solved</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`p-2 rounded-lg transition-colors ${liked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                  >
                    <FontAwesomeIcon icon={liked ? faHeart : faHeartRegular} />
                  </button>
                  <button
                    onClick={() => setStarred(!starred)}
                    className={`p-2 rounded-lg transition-colors ${starred ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
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
                {currentViewData.description}
              </div>
            </div>

            {/* Input/Output Format */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Input Format</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{renderValue(currentViewData.inputFormat)}</pre>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Output Format</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{renderValue(currentViewData.outputFormat)}</pre>
              </div>
            </div>

            {/* Examples */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Examples</h3>
              {currentViewData.examples.map((example, index) => (
                <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Example {index + 1}:</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Input: </span>
                      <code className="text-sm bg-white px-2 py-1 rounded">{renderValue(example.input)}</code>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Output: </span>
                      <code className="text-sm bg-white px-2 py-1 rounded">{renderValue(example.output)}</code>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Explanation: </span>
                      <span className="text-sm text-gray-600">{renderValue(example.explanation)}</span>
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
                  <li key={index} className="text-sm text-gray-700">• {renderValue(constraint)}</li>
                ))}
              </ul>
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
                      {renderValue(topic)}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Draggable Divider */}
        <div
          className="resize-handle bg-gray-200  hover:bg-blue-500 transition-colors hidden lg:block"
          style={{ width: '4px', cursor: 'col-resize' }}
          onMouseDown={handleMouseDown}
        ></div>

        {/* Right Panel - Code Editor */}
        <div className="flex flex-col editor-panel h-full" style={{ width: `${100 - leftPanelWidth}%` }}>
          {/* Editor Header - Tabs Style */}
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-2">
              {/* Left side - Language selector as tab */}
              <div className="flex items-center space-x-1">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="border border-gray-300 rounded bg-transparent text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer px-3 py-1 pr-8 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2rem'
                  }}
                >
                  {Object.entries(languages).map(([key, lang]) => (
                    <option key={key} value={key}>{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Center - Timer */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={timerInputMinutes}
                    onChange={(e) => {
                      setTimerInputMinutes(e.target.value);
                      const minutes = parseInt(e.target.value) || 0;
                      const seconds = minutes * 60;
                      setTimerTotalSeconds(seconds);
                      if (!isTimerRunning) {
                        setTimerSeconds(seconds);
                      }
                    }}
                    className="w-12 px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Min"
                    min="1"
                    max="300"
                    title="Set timer duration in minutes"
                  />
                  <span className="text-xs text-gray-600">min</span>
                </div>
                <FontAwesomeIcon icon={faClock} className="text-gray-600" />
                <span className={`font-mono text-lg font-bold ${timerSeconds === 0
                  ? 'text-red-600 animate-pulse'
                  : timerSeconds <= 300
                    ? 'text-red-600'
                    : timerSeconds <= 600
                      ? 'text-yellow-600'
                      : 'text-gray-800'
                  } ${timerSeconds === 0 ? 'animate-ping' : ''}`}
                  style={timerSeconds === 0 ? {
                    animation: 'blink-red 1s infinite'
                  } : {}}
                >
                  {formatTime(timerSeconds)}
                </span>
                <div className="flex items-center space-x-1">
                  {isTimerRunning ? (
                    isTimerPaused ? (
                      <button
                        onClick={startTimer}
                        className="flex items-center justify-center w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                        title="Resume Timer"
                      >
                        <FontAwesomeIcon icon={faPlay} className="text-xs" />
                      </button>
                    ) : (
                      <button
                        onClick={pauseTimer}
                        className="flex items-center justify-center w-6 h-6 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                        title="Pause Timer"
                      >
                        <FontAwesomeIcon icon={faPause} className="text-xs" />
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        setTimerSeconds(timerTotalSeconds);
                        startTimer();
                      }}
                      className="flex items-center justify-center w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                      title="Start Timer"
                    >
                      <FontAwesomeIcon icon={faPlay} className="text-xs" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setTimerSeconds(timerTotalSeconds);
                      resetTimer();
                    }}
                    className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    title="Reset Timer"
                  >
                    <FontAwesomeIcon icon={faRotateRight} className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Right side - Icons */}
              <div className="flex items-center space-x-2">
                {/* Reset Code Button */}
                <button
                  onClick={resetCode}
                  className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Reset Code"
                >
                  <FontAwesomeIcon icon={faRotateLeft} className="text-sm" />
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title={`${isDarkMode ? 'Light' : 'Dark'} Mode`}
                >
                  <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-sm" />
                </button>

                {/* Zoom Control - LeetCode Style */}
                <div className="flex items-center space-x-1">
                  {/* Zoom Out Button */}
                  <button
                    onClick={() => setFontSize(prev => Math.max(10, prev - 1.4))}
                    className="flex items-center justify-center w-6 h-6 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom Out"
                  >
                    <FontAwesomeIcon icon={faSearchMinus} className="text-sm" />
                  </button>

                  {/* Zoom Percentage Display */}
                  <span className="text-sm text-gray-600 font-medium min-w-[3rem] text-center">
                    {Math.round((fontSize / 14) * 100)}%
                  </span>

                  {/* Zoom In Button */}
                  <button
                    onClick={() => setFontSize(prev => Math.min(24, prev + 1.4))}
                    className="flex items-center justify-center w-6 h-6 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom In"
                  >
                    <FontAwesomeIcon icon={faSearchPlus} className="text-sm" />
                  </button>

                </div>

                {/* Copy Code Button */}
                <div className="relative">
                  <button
                    onClick={copyCode}
                    className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Copy Code"
                  >
                    <FontAwesomeIcon icon={faCopy} className="text-sm" />
                  </button>

                  {/* Copied Popup */}
                  {showCopiedPopup && (
                    <div className="absolute -top-10 -left-12 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-30 transition-opacity duration-300 animate-in fade-in-0 zoom-in-95">
                      Copied
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="monaco-editor-wrapper flex-1" style={{ minHeight: '500px' }}>
            <Editor
              height="100%"
              language={selectedLanguage}
              value={code}
              theme={isDarkMode ? 'vs-dark' : 'light'}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                fontSize: fontSize,
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
          <div className="bg-white border-t border-gray-200 flex flex-col flex-shrink-0">
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
                className={`px-6 py-3 text-sm font-medium ${activeTestTab === 'sample'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Sample Tests
              </button>
              {/* Custom Input tab removed */}
              <button
                onClick={() => setActiveTestTab('console')}
                className={`px-6 py-3 text-sm font-medium ${activeTestTab === 'console'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Console
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 lg:p-6 flex-1">
              {activeTestTab === 'sample' && (
                <div className="space-y-4">
                  {testResults.length > 0 ? (
                    testResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Test Case {result.id}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {result.passed ? 'Passed' : 'Failed'}
                            </span>
                            <span className="text-xs text-gray-500">{result.runtime}</span>
                          </div>
                        </div>

                        {/* Show runtime error if present */}
                        {result.stderr && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                            <div className="text-sm font-medium text-yellow-900 mb-1">Runtime Error:</div>
                            <pre className="text-xs text-yellow-700 overflow-x-auto">{result.stderr}</pre>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-gray-700">Raw Input:</span>
                                <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">{renderValue(result.input)}</pre>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Stdin Format:</span>
                                <pre className="bg-blue-50 p-2 rounded mt-1 text-sm font-mono">{result.input}</pre>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-gray-700">Expected Output:</span>
                                <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">{renderValue(result.expectedOutput)}</pre>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Your Output:</span>
                                <pre className={`p-2 rounded mt-1 text-sm overflow-x-auto ${result.passed ? 'bg-green-50' : 'bg-red-50'
                                  }`}>{result.actualOutput !== undefined && result.actualOutput !== null ? renderValue(result.actualOutput) : 'No output produced'}</pre>
                              </div>
                            </div>
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
                              <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">{renderValue(testCase.input)}</pre>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Expected Output:</span>
                              <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">{renderValue(testCase.expectedOutput)}</pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Custom input section removed */}

              {activeTestTab === 'console' && (
                <div>
                  <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
                    {consoleOutput.length > 0 ? (
                      consoleOutput.map((line, index) => {
                        // Style compilation error messages differently (LeetCode-style warning)
                        const isCompilationError = line.includes('Compilation Error') ||
                          line.includes('Compilation Errors Found:');
                        const isWarning = line.includes('Failed') || line.includes('error');
                        const isSuccess = line.includes('passed!') || line.includes('Passed');

                        let lineClass = "text-green-400"; // default

                        if (isCompilationError) {
                          // LeetCode-style bright orange/red for compilation errors
                          lineClass = "text-orange-300 font-semibold";
                        } else if (isWarning && !isSuccess) {
                          // Red for warnings/failures
                          lineClass = "text-red-400";
                        } else if (isSuccess) {
                          // Bright green for success
                          lineClass = "text-green-400";
                        }

                        return (
                          <div key={index} className={`mb-1 ${isCompilationError ? 'bg-red-900/20 p-1 rounded' : ''}`}>
                            <span className="text-gray-500">$ </span>
                            <span className={lineClass}>{line}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 text-green-400">Console output will appear here...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis Section - Outside Test Case Container */}
          {aiAnalysis && (
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FontAwesomeIcon icon={faLightbulb} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-h-[3rem]">
                <div className="whitespace-pre-line text-sm text-gray-800">
                  {aiAnalysis}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Button */}
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-5 right-5 z-50 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-3xl w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
          title="Open AI Assistant"
        >
          AI
        </button>

        {/* AI Chat Popup */}
        {showChat && (
          <div
            ref={chatRef}
            style={{
              position: 'fixed',
              left: `${chatPosition.x}px`,
              top: `${chatPosition.y}px`,
              width: '380px',
              height: '480px',
              zIndex: 1000
            }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-300 flex flex-col hover:shadow-xl transition-all duration-300"
          >
            {/* Header */}
            <div
              onMouseDown={handleChatMouseDown}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center cursor-move select-none"
            >
              <div className="flex items-center space-x-2">
                <span className="font-semibold">AI Assistant</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-white hover:text-gray-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
              {messages.length === 0 && (
                <div className="text-center text-gray-600 text-sm py-8">
                  <div className="mb-2">💡</div>
                  <p>How can I help you with this coding problem?</p>
                  <p className="text-xs mt-1">Ask me about algorithms, debugging, best practices...</p>
                </div>
              )}
              {messages.map(message => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs break-words px-4 py-3 rounded-2xl ${message.isUser
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-800">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isThinking && chatInput.trim() && sendMessage()}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || isThinking}
                  className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
                >
                  {isThinking ? 'Thinking...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeEditor;
