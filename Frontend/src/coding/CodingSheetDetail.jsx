import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faHome, 
  faCode,
  faCheck,
  faBookmark
} from '@fortawesome/free-solid-svg-icons';

function CodingSheetDetail() {
  const { sheetId } = useParams();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sheetId]);

  // Sheet data mapping
  const sheetsData = {
    1: {
      title: "LeetCode 75",
      subtitle: "Ace Coding Interview with 75 Qs",
      description: "Essential coding problems curated for interview success",
      color: "from-blue-600 to-blue-800",
      totalProblems: 75,
      solvedCount: 32,
      summary: [
        "75 Essential & Trending Problems",
        "Must-do problem list for interview prep",
        "Best for 1-3 month of prep time"
      ]
    },
    2: {
      title: "Top Interview 150",
      subtitle: "Must-do List for Interview Prep",
      description: "Comprehensive problem set covering all interview patterns",
      color: "from-teal-500 to-teal-700",
      totalProblems: 150,
      solvedCount: 65,
      summary: [
        "150 Most Popular Interview Problems",
        "Comprehensive coverage of all topics",
        "Best for 2-3 months of prep time"
      ]
    },
    3: {
      title: "Binary Search",
      subtitle: "8 Patterns, 42 Qs = Master BS",
      description: "Master binary search with pattern-based learning",
      color: "from-purple-600 to-pink-600",
      totalProblems: 42,
      solvedCount: 18,
      summary: [
        "8 Patterns, 42 Questions",
        "Master binary search techniques",
        "Best for 2-4 weeks of prep time"
      ]
    },
    4: {
      title: "SQL 50",
      subtitle: "Crack SQL Interview in 50 Qs",
      description: "SQL fundamentals and advanced queries for interviews",
      color: "from-cyan-600 to-blue-600",
      totalProblems: 50,
      solvedCount: 40,
      summary: [
        "50 SQL Interview Questions",
        "From basics to advanced queries",
        "Best for SQL interview prep"
      ]
    },
    5: {
      title: "Arrays 50",
      subtitle: "Array Fundamentals",
      color: "from-orange-500 to-red-500",
      totalProblems: 50,
      solvedCount: 28
    },
    6: {
      title: "String 50",
      subtitle: "String Manipulation Mastery",
      color: "from-green-500 to-emerald-500",
      totalProblems: 50,
      solvedCount: 35
    },
    7: {
      title: "Linked List 50",
      subtitle: "Master Linked Lists",
      color: "from-indigo-600 to-purple-600",
      totalProblems: 50,
      solvedCount: 22
    },
    8: {
      title: "Trees 50",
      subtitle: "Binary Trees & BST",
      color: "from-yellow-500 to-orange-500",
      totalProblems: 50,
      solvedCount: 30
    },
    // New sheets for practice cards
    "top-trending-50": {
      title: "Top Trending 50",
      subtitle: "Most Popular Interview Questions",
      description: "Top 50 most trending coding questions asked in interviews",
      color: "from-purple-500 to-purple-500",
      totalProblems: 50,
      solvedCount: 15
    },
    "top-30-frequently-asked": {
      title: "Top 30 Frequently Asked",
      subtitle: "Essential Coding Interview Prep",
      description: "The most frequently asked coding problems in technical interviews",
      color: "from-orange-500 to-orange-400",
      totalProblems: 30,
      solvedCount: 8
    },
    "trees": {
      title: "Trees",
      subtitle: "Binary Trees, BST, and More",
      description: "Master tree data structures and algorithms",
      color: "from-green-400 to-green-500",
      totalProblems: 25,
      solvedCount: 6
    },
    "arrays": {
      title: "Arrays",
      subtitle: "Fundamental Array Operations",
      description: "Master array manipulation and algorithms",
      color: "from-blue-400 to-blue-500",
      totalProblems: 30,
      solvedCount: 12
    },
    "graphs": {
      title: "Graphs",
      subtitle: "DFS, BFS, Shortest Paths",
      description: "Graph algorithms and data structures",
      color: "from-yellow-500 to-orange-400",
      totalProblems: 25,
      solvedCount: 3
    },
    "dynamic-programming": {
      title: "Dynamic Programming",
      subtitle: "Optimization Problems Solved",
      description: "Master dynamic programming techniques",
      color: "from-indigo-400 to-indigo-500",
      totalProblems: 20,
      solvedCount: 2
    }
  };

  // Sample problems data
  const allProblems = [
    // Existing problems for numbered sheets
    { id: 1, title: "Two Sum", difficulty: "Easy", solved: true, sheetIds: [1, 2, 5, "arrays"] },
    { id: 2, title: "Add Two Numbers", difficulty: "Medium", solved: false, sheetIds: [2, 7] },
    { id: 3, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", solved: true, sheetIds: [1, 2, 6] },
    { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", solved: false, sheetIds: [2, 3] },
    { id: 5, title: "Longest Palindromic Substring", difficulty: "Medium", solved: true, sheetIds: [1, 2, 6] },
    { id: 6, title: "ZigZag Conversion", difficulty: "Medium", solved: false, sheetIds: [2, 6] },
    { id: 7, title: "Reverse Integer", difficulty: "Medium", solved: true, sheetIds: [1, 5, "top-trending-50"] },
    { id: 8, title: "String to Integer (atoi)", difficulty: "Medium", solved: false, sheetIds: [2, 6, "top-30-frequently-asked"] },
    { id: 9, title: "Palindrome Number", difficulty: "Easy", solved: true, sheetIds: [1, 5, "top-trending-50"] },
    { id: 10, title: "Regular Expression Matching", difficulty: "Hard", solved: false, sheetIds: [2, "dynamic-programming"] },
    { id: 11, title: "Container With Most Water", difficulty: "Medium", solved: true, sheetIds: [1, 2, 5, "arrays"] },
    { id: 12, title: "Integer to Roman", difficulty: "Medium", solved: true, sheetIds: [2] },
    { id: 13, title: "Roman to Integer", difficulty: "Easy", solved: true, sheetIds: [1, 2, "top-30-frequently-asked"] },
    { id: 14, title: "Longest Common Prefix", difficulty: "Easy", solved: true, sheetIds: [1, 2, 6] },
    { id: 15, title: "3Sum", difficulty: "Medium", solved: false, sheetIds: [1, 2, 5, "arrays"] },
    { id: 16, title: "3Sum Closest", difficulty: "Medium", solved: true, sheetIds: [2, 5] },
    { id: 17, title: "Letter Combinations", difficulty: "Medium", solved: false, sheetIds: [2] },
    { id: 18, title: "4Sum", difficulty: "Medium", solved: true, sheetIds: [2, 5] },
    { id: 19, title: "Remove Nth Node", difficulty: "Medium", solved: false, sheetIds: [2, 7] },
    { id: 20, title: "Valid Parentheses", difficulty: "Easy", solved: true, sheetIds: [1, 2, "top-trending-50"] },

    // Top Trending 50 problems (new set)
    { id: 101, title: "Merge Two Sorted Lists", difficulty: "Easy", solved: false, sheetIds: ["top-trending-50"] },
    { id: 102, title: "Climbing Stairs", difficulty: "Easy", solved: true, sheetIds: ["top-trending-50", "dynamic-programming"] },
    { id: 103, title: "Maximum Subarray", difficulty: "Medium", solved: false, sheetIds: ["top-trending-50", "arrays"] },
    { id: 104, title: "Merge Intervals", difficulty: "Medium", solved: true, sheetIds: ["top-trending-50", "arrays"] },
    { id: 105, title: "Rotate Image", difficulty: "Medium", solved: false, sheetIds: ["top-trending-50", "arrays"] },
    { id: 106, title: "Set Matrix Zeroes", difficulty: "Medium", solved: false, sheetIds: ["top-trending-50", "arrays"] },
    { id: 107, title: "Spiral Matrix", difficulty: "Medium", solved: true, sheetIds: ["top-trending-50", "arrays"] },
    { id: 108, title: "Jump Game", difficulty: "Medium", solved: false, sheetIds: ["top-trending-50", "dynamic-programming"] },
    { id: 109, title: "Search a 2D Matrix", difficulty: "Medium", solved: true, sheetIds: ["top-trending-50", "arrays"] },
    { id: 110, title: "Insert Interval", difficulty: "Medium", solved: false, sheetIds: ["top-trending-50", "arrays"] },

    // Top 30 Frequently Asked problems
    { id: 201, title: "Valid Parentheses", difficulty: "Easy", solved: true, sheetIds: ["top-30-frequently-asked"] },
    { id: 202, title: "Merge Two Sorted Lists", difficulty: "Easy", solved: false, sheetIds: ["top-30-frequently-asked"] },
    { id: 203, title: "Maximum Depth of Binary Tree", difficulty: "Easy", solved: false, sheetIds: ["top-30-frequently-asked", "trees"] },
    { id: 204, title: "Same Tree", difficulty: "Easy", solved: true, sheetIds: ["top-30-frequently-asked", "trees"] },
    { id: 205, title: "Invert Binary Tree", difficulty: "Easy", solved: false, sheetIds: ["top-30-frequently-asked", "trees"] },
    { id: 206, title: "Subtree of Another Tree", difficulty: "Easy", solved: true, sheetIds: ["top-30-frequently-asked", "trees"] },
    { id: 207, title: "Two Sum II - Input Array Is Sorted", difficulty: "Medium", solved: false, sheetIds: ["top-30-frequently-asked", "arrays"] },

    // Trees problems
    { id: 301, title: "Maximum Depth of Binary Tree", difficulty: "Easy", solved: false, sheetIds: ["trees"] },
    { id: 302, title: "Same Tree", difficulty: "Easy", solved: true, sheetIds: ["trees"] },
    { id: 303, title: "Invert Binary Tree", difficulty: "Easy", solved: false, sheetIds: ["trees"] },
    { id: 304, title: "Subtree of Another Tree", difficulty: "Easy", solved: true, sheetIds: ["trees"] },
    { id: 305, title: "Lowest Common Ancestor", difficulty: "Medium", solved: false, sheetIds: ["trees"] },
    { id: 306, title: "Binary Tree Maximum Path Sum", difficulty: "Hard", solved: false, sheetIds: ["trees"] },
    { id: 307, title: "Balanced Binary Tree", difficulty: "Easy", solved: true, sheetIds: ["trees"] },
    { id: 308, title: "Diameter of Binary Tree", difficulty: "Easy", solved: false, sheetIds: ["trees"] },
    { id: 309, title: "Validate Binary Search Tree", difficulty: "Medium", solved: false, sheetIds: ["trees"] },
    { id: 310, title: "Binary Tree Inorder Traversal", difficulty: "Easy", solved: true, sheetIds: ["trees"] },

    // Arrays problems
    { id: 401, title: "Find Pivot Index", difficulty: "Easy", solved: false, sheetIds: ["arrays"] },
    { id: 402, title: "Two Sum II - Input Array Is Sorted", difficulty: "Medium", solved: true, sheetIds: ["arrays"] },
    { id: 403, title: "Subarray Sum Equals K", difficulty: "Medium", solved: false, sheetIds: ["arrays"] },
    { id: 404, title: "Insert Interval", difficulty: "Medium", solved: false, sheetIds: ["arrays"] },
    { id: 405, title: "Merge Intervals", difficulty: "Medium", solved: true, sheetIds: ["arrays"] },
    { id: 406, title: "Search Insert Position", difficulty: "Easy", solved: true, sheetIds: ["arrays"] },
    { id: 407, title: "Search a 2D Matrix", difficulty: "Medium", solved: false, sheetIds: ["arrays"] },
    { id: 408, title: "Container With Most Water", difficulty: "Medium", solved: true, sheetIds: ["arrays"] },
    { id: 409, title: "3Sum", difficulty: "Medium", solved: false, sheetIds: ["arrays"] },

    // Graphs problems
    { id: 501, title: "Graph Valid Tree", difficulty: "Medium", solved: false, sheetIds: ["graphs"] },
    { id: 502, title: "Number of Islands", difficulty: "Medium", solved: true, sheetIds: ["graphs"] },
    { id: 503, title: "Clone Graph", difficulty: "Medium", solved: false, sheetIds: ["graphs"] },
    { id: 504, title: "Course Schedule", difficulty: "Medium", solved: false, sheetIds: ["graphs"] },
    { id: 505, title: "Course Schedule II", difficulty: "Medium", solved: true, sheetIds: ["graphs"] },
    { id: 506, title: "Surrounded Regions", difficulty: "Medium", solved: false, sheetIds: ["graphs"] },
    { id: 507, title: "Pacific Atlantic Water Flow", difficulty: "Medium", solved: true, sheetIds: ["graphs"] },

    // Dynamic Programming problems
    { id: 601, title: "Climbing Stairs", difficulty: "Easy", solved: true, sheetIds: ["dynamic-programming"] },
    { id: 602, title: "House Robber", difficulty: "Medium", solved: false, sheetIds: ["dynamic-programming"] },
    { id: 603, title: "House Robber II", difficulty: "Medium", solved: false, sheetIds: ["dynamic-programming"] },
    { id: 604, title: "Jump Game", difficulty: "Medium", solved: true, sheetIds: ["dynamic-programming"] },
    { id: 605, title: "Jump Game II", difficulty: "Medium", solved: false, sheetIds: ["dynamic-programming"] },
    { id: 606, title: "Unique Paths", difficulty: "Medium", solved: false, sheetIds: ["dynamic-programming"] },
    { id: 607, title: "Unique Paths II", difficulty: "Medium", solved: true, sheetIds: ["dynamic-programming"] },
    { id: 608, title: "Longest Palindromic Substring", difficulty: "Medium", solved: false, sheetIds: ["dynamic-programming"] }
  ];

  const sheet = sheetsData[sheetId] || sheetsData[1];
  const sheetProblems = allProblems.filter(p =>
    p.sheetIds.includes(sheetId) ||
    p.sheetIds.includes(parseInt(sheetId)) ||
    p.sheetIds.includes(Number(sheetId))
  );

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const solvedCount = sheetProblems.filter(p => p.solved).length;
  const progressPercentage = Math.round((solvedCount / sheetProblems.length) * 100);

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white shadow-sm">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-800">Job Builder</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </Link>
              
              <Link 
                to="/coding/sheets" 
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faCode} />
                <span>Sheets</span>
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
      <main className="pt-24 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="w-full max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {/* Left Side - Header Card & Problems */}
            <div className="lg:col-span-1">
              {/* Header Card */}
              <div className={`bg-gradient-to-br ${sheet.color} rounded-3xl p-8 mb-8 text-white overflow-hidden relative`}>
                {/* Background decoration */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                      {sheet.title}
                      <span className='text-7xl'>🎯</span>
                    </h1>
                    <button
                      onClick={() => setIsSaved(!isSaved)}
                      className="p-3 rounded-lg  transition-colors"
                    >
                      <FontAwesomeIcon 
                        icon={faBookmark} 
                        className={`text-2xl ${isSaved ? 'text-yellow-300' : 'text-white hover:text-gray-200'}`} 
                      />
                    </button>
                  </div>
                  <p className="text-lg text-white/90 mb-6">{sheet.subtitle}</p>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                    <div>
                      <p className="text-white/80 text-sm mb-1">Progress</p>
                      <p className="text-2xl font-bold">{progressPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm mb-1">Solved</p>
                      <p className="text-2xl font-bold">{solvedCount}/{sheetProblems.length}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm mb-1">Remaining</p>
                      <p className="text-2xl font-bold">{sheetProblems.length - solvedCount}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6 bg-white/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Problems List */}
              <div className="space-y-2">
                {sheetProblems.map((problem) => (
                  <Link
                    key={problem.id}
                    to={`/coding/problem/${problem.id}`}
                    className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-500 rounded-lg p-4 transition-all duration-200 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Status */}
                      <div className="flex-shrink-0">
                        {problem.solved ? (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faCheck} className="text-green-600 text-sm" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>

                      {/* Problem Name */}
                      <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                        {problem.title}
                      </span>
                    </div>

                    {/* Difficulty */}
                    <span className={`text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}

export default CodingSheetDetail;
