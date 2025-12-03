import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faHome, 
  faCode,
  faArrowRight,
  faArrowLeft,
  faTrophy,
  faMagnifyingGlass,
  faDatabase,
  faSquare,
  faLinesLeaning,
  faCodeBranch,
  faLandmark,
  faArrowDownUpAcrossLine
} from '@fortawesome/free-solid-svg-icons';

function CodingSheets() {
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [pendingScrollPos, setPendingScrollPos] = useState(0);
  const [completedScrollPos, setCompletedScrollPos] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const featuredSheets = [
    {
      id: 1,
      title: "LeetCode 75",
      subtitle: "Ace Coding Interview with 75 Qs",
      description: "Essential coding problems curated for interview success",
      color: "from-blue-600 to-blue-800",
      icon: faTrophy,
      totalProblems: 75,
      topics: ["Array", "String", "LinkedList", "DP"],
      status: "pending"
    },
    {
      id: 2,
      title: "Top Interview 150",
      subtitle: "Must-do List for Interview Prep",
      description: "Comprehensive problem set covering all interview patterns",
      color: "from-teal-500 to-teal-700",
      icon: faTrophy,
      totalProblems: 150,
      topics: ["All Topics"],
      status: "pending"
    },
    {
      id: 3,
      title: "Binary Search",
      subtitle: "8 Patterns, 42 Qs = Master BS",
      description: "Master binary search with pattern-based learning",
      color: "from-purple-600 to-pink-600",
      icon: faMagnifyingGlass,
      totalProblems: 42,
      topics: ["Binary Search", "Patterns"],
      status: "completed"
    },
    {
      id: 4,
      title: "SQL 50",
      subtitle: "Crack SQL Interview in 50 Qs",
      description: "SQL fundamentals and advanced queries for interviews",
      color: "from-cyan-600 to-blue-600",
      icon: faDatabase,
      totalProblems: 50,
      topics: ["SQL", "Database"],
      status: "completed"
    }
  ];

  const allSheets = [
    {
      id: 5,
      title: "Arrays 50",
      subtitle: "Array Fundamentals",
      color: "from-orange-500 to-red-500",
      icon: faSquare,
      totalProblems: 50,
      topics: ["Array"],
      status: "pending"
    },
    {
      id: 6,
      title: "String 50",
      subtitle: "String Manipulation Mastery",
      color: "from-green-500 to-emerald-500",
      icon: faLinesLeaning,
      totalProblems: 50,
      topics: ["String"],
      status: "pending"
    },
    {
      id: 7,
      title: "Linked List 50",
      subtitle: "Master Linked Lists",
      color: "from-indigo-600 to-purple-600",
      icon: faCodeBranch,
      totalProblems: 50,
      topics: ["LinkedList"],
      status: "completed"
    },
    {
      id: 8,
      title: "Trees 50",
      subtitle: "Binary Trees & BST",
      color: "from-yellow-500 to-orange-500",
      icon: faLandmark,
      totalProblems: 50,
      topics: ["Tree", "BST"],
      status: "pending"
    },
    {
      id: 9,
      title: "Graphs 50",
      subtitle: "Graph Algorithms",
      color: "from-pink-500 to-rose-500",
      icon: faCodeBranch,
      totalProblems: 50,
      topics: ["Graph", "DFS", "BFS"],
      status: "pending"
    },
    {
      id: 10,
      title: "DP 50",
      subtitle: "Dynamic Programming",
      color: "from-blue-500 to-cyan-500",
      icon: faArrowDownUpAcrossLine,
      totalProblems: 50,
      topics: ["Dynamic Programming"],
      status: "completed"
    },
    {
      id: 11,
      title: "Hash Map 30",
      subtitle: "Hash & Hashing Techniques",
      color: "from-lime-500 to-green-500",
      icon: faSquare,
      totalProblems: 30,
      topics: ["Hash Map", "Hash Table"],
      status: "pending"
    },
    {
      id: 12,
      title: "Sorting 30",
      subtitle: "Sorting Algorithms",
      color: "from-fuchsia-500 to-purple-500",
      icon: faArrowDownUpAcrossLine,
      totalProblems: 30,
      topics: ["Sorting"],
      status: "completed"
    }
  ];

  // Combine all sheets and filter by status
  const allStudyPlans = [...featuredSheets, ...allSheets];
  const pendingSheets = allStudyPlans.filter(sheet => sheet.status === "pending");
  const completedSheets = allStudyPlans.filter(sheet => sheet.status === "completed");

  const handleScroll = (containerId, direction) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 400;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const SheetCard = ({ sheet, isFeatured = false }) => (
    <Link
      to={`/coding/sheet/${sheet.id}`}
      className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${
        isFeatured ? 'h-80' : 'h-64'
      }`}
    >
      <div className={`bg-gradient-to-br ${sheet.color} h-full p-8 flex flex-col justify-between text-white relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
            <FontAwesomeIcon icon={sheet.icon} className="text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-2">{sheet.title}</h3>
          <p className="text-white/90 text-sm md:text-base">{sheet.subtitle}</p>
        </div>

        {/* Bottom Info */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/20">
          <div className="flex flex-col">
            <span className="text-xs text-white/80">Problems</span>
            <span className="text-lg font-bold">{sheet.totalProblems}</span>
          </div>
          <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-colors">
            <span className="text-sm font-medium">Start</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-lg group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );

  const CompactSheetCard = ({ sheet }) => {
    const progressMap = {
      1: 42, 2: 75, 3: 100, 4: 100, 5: 35, 6: 45, 7: 100, 8: 50, 9: 20, 10: 100, 11: 30, 12: 100
    };
    const solvedProblems = progressMap[sheet.id] || 0;
    const progressPercentage = Math.round((solvedProblems / sheet.totalProblems) * 100);

    return (
      <Link
        to={`/coding/sheet/${sheet.id}`}
        className={`group bg-gradient-to-br ${sheet.color} rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer min-w-max flex flex-col justify-between text-white`}
        style={{ width: '280px' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">
              <FontAwesomeIcon icon={sheet.icon} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {sheet.title}
            </h3>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="bg-white/30 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Progress Text */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/90">{solvedProblems}/{sheet.totalProblems}</span>
            <span className="text-white font-semibold">{progressPercentage}%</span>
          </div>
        </div>

      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50">
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
        <div className="w-full max-w-7xl mx-auto">
          
          {/* Pending Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Pending</h2>
            {pendingSheets.length > 0 ? (
              <div
                id="pending-container"
                className="flex gap-6 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {pendingSheets.map((sheet) => (
                  <CompactSheetCard key={sheet.id} sheet={sheet} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No pending sheets</p>
            )}
          </section>

          {/* Completed Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Completed</h2>
            {completedSheets.length > 0 ? (
              <div
                id="completed-container"
                className="flex gap-6 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {completedSheets.map((sheet) => (
                  <CompactSheetCard key={sheet.id} sheet={sheet} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No completed sheets</p>
            )}
          </section>

          {/* Featured Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredSheets.map((sheet) => (
                <SheetCard key={sheet.id} sheet={sheet} isFeatured={true} />
              ))}
            </div>
          </section>

          {/* All Sheets Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-8">All Study Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allSheets.map((sheet) => (
                <SheetCard key={sheet.id} sheet={sheet} />
              ))}
            </div>
          </section>

        </div>
      </main>

    </div>
  );
}

export default CodingSheets;
