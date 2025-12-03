// Company data service
export const companyService = {
  // All available companies
  companies: [
    {
      id: 'amazon',
      name: 'Amazon',
      logo: '🟠',
      tagline: 'Leadership Principles & System Design',
      category: 'faang',
      size: 'large',
      totalQuestions: 145,
      difficulty: { easy: 35, medium: 85, hard: 25 },
      popularTags: ['Arrays', 'Trees', 'Dynamic Programming', 'System Design'],
      interviewTypes: ['SDE', 'SWE', 'Backend', 'Frontend'],
      description: 'Amazon focuses heavily on behavioral interviews based on their Leadership Principles, along with strong system design and algorithmic thinking.',
      popularTopics: ['Arrays', 'Trees', 'Dynamic Programming', 'System Design', 'Graphs', 'Strings', 'Linked Lists', 'Recursion'],
      tags: ['SWE', 'SDE', 'Backend', 'Frontend', 'Intern'],
      interviewFocus: ['Leadership Principles', 'System Design', 'Algorithms', 'Problem Solving'],
      averageSalary: '$150,000',
      hiringLevel: 'High'
    },
    {
      id: 'google',
      name: 'Google',
      logo: '🔴',
      tagline: 'Algorithm Excellence & Innovation',
      category: 'faang',
      size: 'large',
      totalQuestions: 162,
      difficulty: { easy: 28, medium: 95, hard: 39 },
      popularTags: ['Graphs', 'Dynamic Programming', 'Math', 'Strings'],
      interviewTypes: ['SWE', 'SDE', 'ML Engineer', 'Frontend'],
      description: 'Google emphasizes algorithmic excellence, problem-solving creativity, and innovative thinking in their technical interviews.',
      popularTopics: ['Graphs', 'Dynamic Programming', 'Math', 'Strings', 'Trees', 'Arrays', 'Backtracking', 'Binary Search'],
      tags: ['SWE', 'SDE', 'ML Engineer', 'Frontend'],
      interviewFocus: ['Algorithms', 'Data Structures', 'System Design', 'Innovation'],
      averageSalary: '$165,000',
      hiringLevel: 'Very High'
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      logo: '🔵',
      tagline: 'Product Focus & Technical Depth',
      category: 'faang',
      size: 'large',
      totalQuestions: 128,
      difficulty: { easy: 42, medium: 72, hard: 14 },
      popularTags: ['Arrays', 'Linked Lists', 'Trees', 'Recursion'],
      interviewTypes: ['SDE', 'SWE', 'PM Tech', 'Frontend'],
      description: 'Microsoft combines technical depth with product thinking, emphasizing practical problem-solving and code quality.',
      popularTopics: ['Arrays', 'Linked Lists', 'Trees', 'Recursion', 'Strings', 'Dynamic Programming', 'Math', 'Graphs'],
      tags: ['SDE', 'SWE', 'PM Tech', 'Frontend'],
      interviewFocus: ['Product Thinking', 'Code Quality', 'Problem Solving', 'Collaboration'],
      averageSalary: '$145,000',
      hiringLevel: 'High'
    },
    {
      id: 'meta',
      name: 'Meta',
      logo: '🟦',
      tagline: 'Scale & User Experience',
      category: 'faang',
      size: 'large',
      totalQuestions: 134,
      difficulty: { easy: 31, medium: 88, hard: 15 },
      popularTags: ['Graphs', 'BFS/DFS', 'Dynamic Programming', 'Design'],
      interviewTypes: ['SWE', 'Frontend', 'Backend', 'Mobile'],
      description: 'Meta focuses on scalable solutions and user-centered thinking, with emphasis on system design and user experience.',
      popularTopics: ['Graphs', 'BFS/DFS', 'Dynamic Programming', 'Design', 'Arrays', 'Trees', 'Hash Tables', 'Strings'],
      tags: ['SWE', 'Frontend', 'Backend', 'Mobile'],
      interviewFocus: ['Scale', 'User Experience', 'System Design', 'Impact'],
      averageSalary: '$160,000',
      hiringLevel: 'Very High'
    },
    {
      id: 'netflix',
      name: 'Netflix',
      logo: '🔴',
      tagline: 'Performance & Scalability',
      category: 'faang',
      size: 'large',
      totalQuestions: 68,
      difficulty: { easy: 15, medium: 38, hard: 15 },
      popularTags: ['System Design', 'Algorithms', 'Data Structures'],
      interviewTypes: ['Senior SWE', 'Staff Engineer', 'Backend'],
      description: 'Netflix emphasizes performance, scalability, and senior-level engineering practices.',
      popularTopics: ['System Design', 'Algorithms', 'Data Structures', 'Scalability', 'Performance'],
      tags: ['Senior SWE', 'Staff Engineer', 'Backend'],
      interviewFocus: ['Performance', 'Scalability', 'Senior Engineering', 'Architecture'],
      averageSalary: '$180,000',
      hiringLevel: 'Medium'
    },
    {
      id: 'adobe',
      name: 'Adobe',
      logo: '🔴',
      tagline: 'Creative Technology Solutions',
      category: 'tech',
      size: 'large',
      totalQuestions: 89,
      difficulty: { easy: 25, medium: 52, hard: 12 },
      popularTags: ['Arrays', 'Strings', 'Design Patterns', 'UI/UX'],
      interviewTypes: ['SDE', 'Frontend', 'Creative Engineer'],
      description: 'Adobe combines creative problem-solving with technical excellence in their interview process.',
      popularTopics: ['Arrays', 'Strings', 'Design Patterns', 'UI/UX', 'Graphics', 'Algorithms'],
      tags: ['SDE', 'Frontend', 'Creative Engineer'],
      interviewFocus: ['Creative Problem Solving', 'Design', 'Frontend', 'User Experience'],
      averageSalary: '$130,000',
      hiringLevel: 'Medium'
    },
    {
      id: 'goldman-sachs',
      name: 'Goldman Sachs',
      logo: '🟡',
      tagline: 'Financial Technology Excellence',
      category: 'finance',
      size: 'large',
      totalQuestions: 76,
      difficulty: { easy: 28, medium: 38, hard: 10 },
      popularTags: ['Math', 'Algorithms', 'Data Analysis', 'Trading Systems'],
      interviewTypes: ['Technology Analyst', 'SDE', 'Quant Developer'],
      description: 'Goldman Sachs focuses on financial technology, algorithmic trading, and quantitative analysis.',
      popularTopics: ['Math', 'Algorithms', 'Data Analysis', 'Trading Systems', 'Probability', 'Statistics'],
      tags: ['Technology Analyst', 'SDE', 'Quant Developer'],
      interviewFocus: ['Financial Technology', 'Algorithms', 'Math', 'Problem Solving'],
      averageSalary: '$140,000',
      hiringLevel: 'High'
    },
    {
      id: 'bloomberg',
      name: 'Bloomberg',
      logo: '🟠',
      tagline: 'Real-time Financial Data',
      category: 'finance',
      size: 'large',
      totalQuestions: 64,
      difficulty: { easy: 22, medium: 32, hard: 10 },
      popularTags: ['Data Structures', 'Algorithms', 'Real-time Systems'],
      interviewTypes: ['Software Engineer', 'Data Engineer'],
      description: 'Bloomberg specializes in real-time financial data processing and trading systems.',
      popularTopics: ['Data Structures', 'Algorithms', 'Real-time Systems', 'Databases', 'Networking'],
      tags: ['Software Engineer', 'Data Engineer'],
      interviewFocus: ['Real-time Systems', 'Data Processing', 'Performance', 'Reliability'],
      averageSalary: '$135,000',
      hiringLevel: 'Medium'
    },
    {
      id: 'infosys',
      name: 'Infosys',
      logo: '🔵',
      tagline: 'Digital Transformation Leader',
      category: 'service',
      size: 'large',
      totalQuestions: 95,
      difficulty: { easy: 45, medium: 42, hard: 8 },
      popularTags: ['Java', 'SQL', 'Web Development', 'Cloud'],
      interviewTypes: ['System Engineer', 'Specialist Programmer', 'Senior Associate'],
      description: 'Infosys focuses on digital transformation, cloud technologies, and enterprise solutions.',
      popularTopics: ['Java', 'SQL', 'Web Development', 'Cloud', 'Enterprise Solutions', 'Digital Transformation'],
      tags: ['System Engineer', 'Specialist Programmer', 'Senior Associate'],
      interviewFocus: ['Enterprise Solutions', 'Cloud', 'Digital Transformation', 'Client Services'],
      averageSalary: '$75,000',
      hiringLevel: 'High'
    },
    {
      id: 'tcs',
      name: 'TCS',
      logo: '🔵',
      tagline: 'Innovation & Excellence',
      category: 'service',
      size: 'large',
      totalQuestions: 112,
      difficulty: { easy: 58, medium: 48, hard: 6 },
      popularTags: ['Programming Fundamentals', 'Database', 'Web Tech', 'Testing'],
      interviewTypes: ['Assistant System Engineer', 'System Engineer', 'Ninja'],
      description: 'TCS emphasizes programming fundamentals, enterprise solutions, and global delivery capabilities.',
      popularTopics: ['Programming Fundamentals', 'Database', 'Web Technologies', 'Testing', 'Enterprise Applications'],
      tags: ['Assistant System Engineer', 'System Engineer', 'Ninja'],
      interviewFocus: ['Programming Fundamentals', 'Problem Solving', 'Communication', 'Team Work'],
      averageSalary: '$65,000',
      hiringLevel: 'Very High'
    },
    {
      id: 'accenture',
      name: 'Accenture',
      logo: '🟣',
      tagline: 'Consulting & Technology Services',
      category: 'service',
      size: 'large',
      totalQuestions: 87,
      difficulty: { easy: 42, medium: 38, hard: 7 },
      popularTags: ['Problem Solving', 'Logic', 'Programming', 'Analytics'],
      interviewTypes: ['Associate Software Engineer', 'Analyst', 'Senior Analyst'],
      description: 'Accenture combines consulting expertise with technology services and digital transformation.',
      popularTopics: ['Problem Solving', 'Logic', 'Programming', 'Analytics', 'Consulting', 'Digital Solutions'],
      tags: ['Associate Software Engineer', 'Analyst', 'Senior Analyst'],
      interviewFocus: ['Consulting', 'Problem Solving', 'Analytics', 'Client Solutions'],
      averageSalary: '$80,000',
      hiringLevel: 'High'
    },
    {
      id: 'wipro',
      name: 'Wipro',
      logo: '🟡',
      tagline: 'Digital Innovation Partner',
      category: 'service',
      size: 'large',
      totalQuestions: 78,
      difficulty: { easy: 38, medium: 32, hard: 8 },
      popularTags: ['Core Programming', 'Data Structures', 'DBMS', 'Aptitude'],
      interviewTypes: ['Project Engineer', 'Senior Software Engineer'],
      description: 'Wipro focuses on digital innovation, enterprise solutions, and global technology services.',
      popularTopics: ['Core Programming', 'Data Structures', 'Database Management', 'Web Technologies'],
      tags: ['Project Engineer', 'Senior Software Engineer'],
      interviewFocus: ['Core Programming', 'Innovation', 'Enterprise Solutions', 'Digital Transformation'],
      averageSalary: '$70,000',
      hiringLevel: 'High'
    },
    {
      id: 'zoho',
      name: 'Zoho',
      logo: '🟠',
      tagline: 'Product-based Innovation',
      category: 'product',
      size: 'medium',
      totalQuestions: 92,
      difficulty: { easy: 25, medium: 55, hard: 12 },
      popularTags: ['Problem Solving', 'Algorithms', 'System Design', 'Product Thinking'],
      interviewTypes: ['Member Technical Staff', 'Software Developer', 'Product Engineer'],
      description: 'Zoho emphasizes product thinking, innovation, and hands-on technical skills.',
      popularTopics: ['Problem Solving', 'Algorithms', 'System Design', 'Product Development', 'Innovation'],
      tags: ['Member Technical Staff', 'Software Developer', 'Product Engineer'],
      interviewFocus: ['Product Thinking', 'Innovation', 'Problem Solving', 'Technical Excellence'],
      averageSalary: '$90,000',
      hiringLevel: 'Medium'
    },
    {
      id: 'flipkart',
      name: 'Flipkart',
      logo: '🔵',
      tagline: 'E-commerce Innovation',
      category: 'product',
      size: 'large',
      totalQuestions: 108,
      difficulty: { easy: 32, medium: 62, hard: 14 },
      popularTags: ['System Design', 'Data Structures', 'Algorithms', 'Scalability'],
      interviewTypes: ['SDE', 'Senior SDE', 'Frontend Engineer', 'Backend Engineer'],
      description: 'Flipkart focuses on e-commerce innovation, scalable systems, and product development.',
      popularTopics: ['System Design', 'Data Structures', 'Algorithms', 'Scalability', 'E-commerce', 'Product Development'],
      tags: ['SDE', 'Senior SDE', 'Frontend Engineer', 'Backend Engineer'],
      interviewFocus: ['E-commerce', 'Scale', 'Product Innovation', 'System Design'],
      averageSalary: '$110,000',
      hiringLevel: 'Medium'
    }
  ],

  // Sample questions database
  questionsDatabase: [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "easy",
      topic: "Arrays",
      frequency: 95,
      lastAsked: "2 days ago",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      acceptance: 89,
      companies: ["amazon", "google", "microsoft", "meta", "adobe"],
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      likes: 1250,
      dislikes: 45,
      status: "solved",
      tags: ["Hash Table", "Array"],
      hints: ["Use a hash map to store the complement", "Check if target - current exists"]
    },
    {
      id: 2,
      title: "Reverse Linked List",
      difficulty: "easy",
      topic: "Linked Lists",
      frequency: 88,
      lastAsked: "1 week ago",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      acceptance: 76,
      companies: ["amazon", "microsoft", "meta", "google"],
      description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
      likes: 980,
      dislikes: 23,
      status: "attempted",
      tags: ["Linked List", "Recursion"],
      hints: ["Use three pointers: prev, current, next", "Can be solved iteratively or recursively"]
    },
    {
      id: 3,
      title: "Valid Parentheses",
      difficulty: "easy",
      topic: "Stack",
      frequency: 82,
      lastAsked: "3 days ago",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      acceptance: 84,
      companies: ["amazon", "google", "microsoft"],
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      likes: 756,
      dislikes: 67,
      status: "unsolved",
      tags: ["Stack", "String"],
      hints: ["Use a stack to keep track of opening brackets", "Map each closing bracket to its opening bracket"]
    },
    {
      id: 4,
      title: "Longest Palindromic Substring",
      difficulty: "medium",
      topic: "Dynamic Programming",
      frequency: 91,
      lastAsked: "1 day ago",
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)",
      acceptance: 67,
      companies: ["amazon", "google", "meta", "microsoft"],
      description: "Given a string s, return the longest palindromic substring in s.",
      likes: 1450,
      dislikes: 89,
      status: "solved",
      tags: ["String", "Dynamic Programming"],
      hints: ["Expand around centers", "Consider both odd and even length palindromes"]
    },
    {
      id: 5,
      title: "Merge k Sorted Lists",
      difficulty: "hard",
      topic: "Linked Lists",
      frequency: 75,
      lastAsked: "5 days ago",
      timeComplexity: "O(n log k)",
      spaceComplexity: "O(k)",
      acceptance: 54,
      companies: ["amazon", "google", "microsoft"],
      description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.",
      likes: 892,
      dislikes: 134,
      status: "unsolved",
      tags: ["Linked List", "Divide and Conquer", "Heap"],
      hints: ["Use a min heap to track the smallest elements", "Merge lists pairwise"]
    },
    {
      id: 6,
      title: "Design LRU Cache",
      difficulty: "medium",
      topic: "Design",
      frequency: 89,
      lastAsked: "2 days ago",
      timeComplexity: "O(1)",
      spaceComplexity: "O(capacity)",
      acceptance: 71,
      companies: ["amazon", "microsoft", "google"],
      description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
      likes: 1123,
      dislikes: 78,
      status: "attempted",
      tags: ["Hash Table", "Linked List", "Design"],
      hints: ["Use HashMap + Doubly Linked List", "Keep track of most and least recently used"]
    },
    {
      id: 7,
      title: "Binary Tree Inorder Traversal",
      difficulty: "easy",
      topic: "Trees",
      frequency: 78,
      lastAsked: "1 week ago",
      timeComplexity: "O(n)",
      spaceComplexity: "O(h)",
      acceptance: 82,
      companies: ["amazon", "microsoft", "google", "meta"],
      description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
      likes: 890,
      dislikes: 45,
      status: "solved",
      tags: ["Tree", "Stack", "Recursion"],
      hints: ["Can be solved recursively or iteratively", "Use stack for iterative approach"]
    },
    {
      id: 8,
      title: "Maximum Subarray",
      difficulty: "medium",
      topic: "Dynamic Programming",
      frequency: 85,
      lastAsked: "3 days ago",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      acceptance: 74,
      companies: ["amazon", "google", "microsoft"],
      description: "Given an integer array nums, find the contiguous subarray with the largest sum, and return its sum.",
      likes: 1200,
      dislikes: 67,
      status: "attempted",
      tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
      hints: ["Use Kadane's algorithm", "Keep track of current and global maximum"]
    },
    {
      id: 9,
      title: "3Sum",
      difficulty: "medium",
      topic: "Arrays",
      frequency: 80,
      lastAsked: "4 days ago",
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)",
      acceptance: 68,
      companies: ["amazon", "google", "meta"],
      description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
      likes: 945,
      dislikes: 123,
      status: "unsolved",
      tags: ["Array", "Two Pointers", "Sorting"],
      hints: ["Sort the array first", "Use two pointers technique", "Skip duplicates"]
    },
    {
      id: 10,
      title: "Word Break",
      difficulty: "medium",
      topic: "Dynamic Programming",
      frequency: 72,
      lastAsked: "6 days ago",
      timeComplexity: "O(n²)",
      spaceComplexity: "O(n)",
      acceptance: 65,
      companies: ["amazon", "google", "microsoft"],
      description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
      likes: 834,
      dislikes: 89,
      status: "attempted",
      tags: ["String", "Dynamic Programming", "Trie"],
      hints: ["Use dynamic programming", "Check if substring can be formed by dictionary words"]
    }
    // Add more questions as needed...
  ],

  // Get company by ID
  getCompanyById(id) {
    return this.companies.find(company => company.id === id);
  },

  // Get questions for a specific company
  getQuestionsByCompany(companyId) {
    return this.questionsDatabase.filter(question => 
      question.companies.includes(companyId)
    );
  },

  // Get all companies
  getAllCompanies() {
    return this.companies;
  },

  // Filter companies
  filterCompanies(searchTerm = '', category = 'all', size = 'all') {
    return this.companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.tagline.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || company.category === category;
      const matchesSize = size === 'all' || company.size === size;
      
      return matchesSearch && matchesCategory && matchesSize;
    });
  },

  // Get company statistics
  getCompanyStats(companyId) {
    const company = this.getCompanyById(companyId);
    const questions = this.getQuestionsByCompany(companyId);
    
    if (!company) return null;

    return {
      totalQuestions: questions.length,
      difficulty: company.difficulty,
      averageFrequency: questions.reduce((acc, q) => acc + q.frequency, 0) / questions.length,
      topicsDistribution: this.getTopicsDistribution(questions),
      recentActivity: this.getRecentActivity(questions)
    };
  },

  // Get topics distribution for a company
  getTopicsDistribution(questions) {
    const distribution = {};
    questions.forEach(q => {
      distribution[q.topic] = (distribution[q.topic] || 0) + 1;
    });
    return distribution;
  },

  // Get recent activity
  getRecentActivity(questions) {
    return questions
      .sort((a, b) => new Date(b.lastAsked) - new Date(a.lastAsked))
      .slice(0, 5);
  }
};

export default companyService;