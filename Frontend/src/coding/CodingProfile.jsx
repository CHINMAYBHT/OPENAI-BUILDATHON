import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { supabase } from '../utils/supabase';
import {
  faUser,
  faHome,
  faCode,
  faBuilding,
  faChevronLeft,
  faChevronRight,
  faCheck,
  faFire
} from '@fortawesome/free-solid-svg-icons';

function CodingProfile() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState(null);
  const [starredProblems, setStarredProblems] = useState(new Set([2, 4]));
  const [userLanguages, setUserLanguages] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userStreaks, setUserStreaks] = useState(null);
  const [companyProgress, setCompanyProgress] = useState([]);
  const [username, setUsername] = useState('User');
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [attemptedProblems, setAttemptedProblems] = useState([]);
  const [likedProblems, setLikedProblems] = useState([]);
  const [starredProblemsList, setStarredProblemsList] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const apiBase = typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')
      : 'http://localhost:5000';

    // Fetch all user data
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const userId = session.user.id;

        // Extract username from auth.users
        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.name ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.username ||
          userEmail?.split('@')[0] ||
          'User';
        setUsername(userName);

        // Fetch user languages
        const langResponse = await fetch(`${apiBase}/api/user-languages/${userId}`);
        const langData = await langResponse.json();
        if (langData.success && langData.languages) {
          setUserLanguages(langData.languages);
        }

        // Fetch user stats (total solved, by difficulty, topics)
        const statsResponse = await fetch(`${apiBase}/api/user-stats/${userId}`);
        const statsData = await statsResponse.json();
        if (statsData.success && statsData.stats) {
          setUserStats(statsData.stats);
          if (statsData.stats.topics) {
            setTopics(statsData.stats.topics);
          }
        }

        // Fetch user streaks
        const streaksResponse = await fetch(`${apiBase}/api/user-streaks/${userId}`);
        const streaksData = await streaksResponse.json();
        if (streaksData.success && streaksData.streak) {
          setUserStreaks(streaksData.streak);
        }

        // Fetch calendar data
        const calendarResponse = await fetch(`${apiBase}/api/user-streaks/${userId}/calendar`);
        const calData = await calendarResponse.json();
        if (calData.success && calData.calendar) {
          setCalendarData(calData.calendar);
        }

        // Fetch company progress
        const { data: companyProgressData } = await supabase
          .from('user_company_progress')
          .select('*, companies(name)')
          .eq('user_id', userId)
          .order('solved_total', { ascending: false })
          .limit(6);

        if (companyProgressData) {
          setCompanyProgress(companyProgressData);
        }

        // Fetch solved problems
        const solvedResponse = await fetch(`${apiBase}/api/user-stats/${userId}/solved`);
        const solvedData = await solvedResponse.json();
        if (solvedData.success && solvedData.problems) {
          setSolvedProblems(solvedData.problems);
        }

        // Fetch attempted problems
        const attemptedResponse = await fetch(`${apiBase}/api/user-stats/${userId}/attempted`);
        const attemptedData = await attemptedResponse.json();
        if (attemptedData.success && attemptedData.problems) {
          setAttemptedProblems(attemptedData.problems);
        }

        // Fetch liked problems
        const likedResponse = await fetch(`${apiBase}/api/user-stats/${userId}/liked`);
        const likedData = await likedResponse.json();
        if (likedData.success && likedData.problems) {
          setLikedProblems(likedData.problems);
        }

        // Fetch starred problems
        const starredResponse = await fetch(`${apiBase}/api/user-stats/${userId}/starred`);
        const starredData = await starredResponse.json();
        if (starredData.success && starredData.problems) {
          setStarredProblemsList(starredData.problems);
          setStarredProblems(new Set(starredData.problems.map(p => p.id)));
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  // Mock data for sheets (keeping this as it's a separate feature)
  const savedSheets = [
    { id: 1, title: "Arrays 50", problems: 50, completed: 35 },
    { id: 2, title: "Strings 30", problems: 30, completed: 22 },
    { id: 3, title: "Trees 40", problems: 40, completed: 28 }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const toggleStar = (problemId) => {
    const newStarred = new Set(starredProblems);
    if (newStarred.has(problemId)) {
      newStarred.delete(problemId);
    } else {
      newStarred.add(problemId);
    }
    setStarredProblems(newStarred);
  };

  // Calendar functionality
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const renderCalendarDays = () => {
    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${prevMonthDays - i}`} className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm">
          {prevMonthDays - i}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasSolved = calendarData[dateStr] > 0;

      let bgClass = 'text-gray-700';
      let content = day;

      if (isToday) {
        bgClass = 'bg-blue-500 text-white font-bold';
      } else if (hasSolved) {
        bgClass = 'bg-green-500 text-white font-semibold';
        content = <FontAwesomeIcon icon={faCheck} />;
      }

      days.push(
        <div
          key={day}
          className={`w-8 h-8 flex items-center justify-center text-sm cursor-pointer rounded ${bgClass}`}
          title={hasSolved ? `${calendarData[dateStr]} problem(s) solved` : ''}
        >
          {content}
        </div>
      );
    }

    // Next month's leading days
    const totalCells = Math.ceil((firstDayWeekday + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDayWeekday + daysInMonth);

    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm">
          {day}
        </div>
      );
    }

    return days;
  };

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

              {/* Companies Button */}
              <Link
                to="/coding/companies"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faBuilding} />
                <span>Companies</span>
              </Link>

              {/* Submissions Button */}
              <Link
                to="/coding/submissions"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
                title="View my submissions"
              >
                <FontAwesomeIcon icon={faCheck} />
                <span>Submissions</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column - User Stats */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                {/* User Info */}
                <div className="p-6 flex flex-col items-start border-b border-gray-200">
                  <div className="w-40 h-40 bg-teal-500 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-9xl font-bold text-white">{username.charAt(0).toUpperCase()}</span>
                  </div>
                  <h2 className="text-lg ml-2 font-bold text-gray-900">{username}</h2>
                </div>

                {/* Languages Stats */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
                  <div className="space-y-3">
                    {userLanguages.length > 0 ? (
                      userLanguages.map((language, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">{language.language}</span>
                          <span className="text-sm text-gray-500">{language.solved_count} solved</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No languages data yet</div>
                    )}
                  </div>
                </div>

                {/* Topics Stats */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics</h3>
                  <div className="space-y-3">
                    {topics && topics.length > 0 ? (
                      topics.slice(0, 6).map((topic, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">{topic.topic}</span>
                          <span className="text-sm text-gray-500">
                            {topic.solved_count || topic.count || 0}/{topic.total_count || 0}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No topics data yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Problem Overview & Calendar */}
            <div className="lg:col-span-2 space-y-6">

              {/* Problem Solving Overview */}
              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Problem Solving Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Difficulty Stats */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-green-600 font-semibold text-sm">Easy</div>
                      <div className="text-xl font-bold text-green-700">{userStats?.easy || 0}/<span className="font-normal text-lg">{userStats?.totalEasy || 0}</span></div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-yellow-600 font-semibold text-sm">Med.</div>
                      <div className="text-xl font-bold text-yellow-700">{userStats?.medium || 0}/<span className="font-normal text-lg">{userStats?.totalMedium || 0}</span></div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-red-600 font-semibold text-sm">Hard</div>
                      <div className="text-xl font-bold text-red-700">{userStats?.hard || 0}/<span className="font-normal text-lg">{userStats?.totalHard || 0}</span></div>
                    </div>
                  </div>

                  {/* Circular Progress */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48">
                      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="10"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="10"
                          strokeDasharray={`${((userStats?.totalSolved || 0) / (userStats?.totalProblems || 1000)) * 314} 314`}
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">{userStats?.totalSolved || 0}</span>
                        <span className="text-base text-gray-600">/<span className="font-normal">{userStats?.totalProblems || 0}</span></span>
                        <span className="text-xs text-gray-500">Solved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {currentDate.getFullYear()} {monthNames[month]}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-4">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarDays()}
                  </div>
                </div>

                {/* Streak Info */}
                <div className="mt-6 flex justify-between items-center">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Current {userStreaks?.current_streak || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Best {userStreaks?.longest_streak || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards Section */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div
                  onClick={() => setActiveTab(activeTab === 'sheets' ? null : 'sheets')}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${activeTab === 'sheets' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-blue-200 border border-blue-300 hover:shadow-lg'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{savedSheets.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Saved Sheets</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab(activeTab === 'solved' ? null : 'solved')}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${activeTab === 'solved' ? 'bg-green-100 border-2 border-green-500' : 'bg-green-200 border border-green-300 hover:shadow-lg'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{solvedProblems.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Solved Problems</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab(activeTab === 'attempted' ? null : 'attempted')}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${activeTab === 'attempted' ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-yellow-200 border border-yellow-300 hover:shadow-lg'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{attemptedProblems.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Attempted Problems</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab(activeTab === 'liked' ? null : 'liked')}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${activeTab === 'liked' ? 'bg-red-100 border-2 border-red-500' : 'bg-red-200 border border-red-300 hover:shadow-lg'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{likedProblems.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Liked Problems</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab(activeTab === 'starred' ? null : 'starred')}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${activeTab === 'starred' ? 'bg-purple-100 border-2 border-purple-500' : 'bg-purple-200 border border-purple-300 hover:shadow-lg'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{starredProblemsList.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Starred Problems</div>
                  </div>
                </div>
              </div>

              {/* Saved Sheets Cards Section */}
              {activeTab === 'sheets' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {savedSheets.map((sheet, index) => (
                    <div
                      key={sheet.id}
                      onClick={() => console.log(`Clicked sheet: ${sheet.title}`)}
                      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{sheet.title}</h3>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Problems</span>
                          <span className="text-sm font-semibold text-gray-900">{sheet.problems}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Completed</span>
                          <span className="text-sm font-semibold text-green-600">{sheet.completed}</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${(sheet.completed / sheet.problems) * 100}%` }}
                          ></div>
                        </div>

                        <div className="text-xs text-gray-500 text-right mt-2">
                          {Math.round((sheet.completed / sheet.problems) * 100)}% Complete
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Table Section */}
              {activeTab && activeTab !== 'sheets' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 mt-6 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="bg-transparent">
                        {activeTab === 'solved' && solvedProblems.map((problem, index) => (
                          <tr
                            key={problem.id}
                            onClick={() => navigate(`/coding/problem/${problem.id}`)}
                            className="hover:bg-gray-50 transition-colors border-b border-gray-200 cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-blue-600">
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <FontAwesomeIcon icon={faCheck} className="text-green-500 text-lg" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{problem.title}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-900">{problem.acceptanceRate}%</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(problem.id);
                                }}
                                className="hover:scale-110 transition-transform duration-200 text-xl"
                              >
                                <span className={starredProblems.has(problem.id) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}>
                                  {starredProblems.has(problem.id) ? '★' : '☆'}
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {activeTab === 'attempted' && attemptedProblems.map((problem, index) => (
                          <tr
                            key={problem.id}
                            onClick={() => navigate(`/coding/problems/${problem.id}`)}
                            className="hover:bg-gray-50 transition-colors border-b border-gray-200 cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-blue-600">
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{problem.title}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-900">{problem.acceptanceRate}%</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(problem.id);
                                }}
                                className="hover:scale-110 transition-transform duration-200 text-xl"
                              >
                                <span className={starredProblems.has(problem.id) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}>
                                  {starredProblems.has(problem.id) ? '★' : '☆'}
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {activeTab === 'liked' && likedProblems.map((problem, index) => (
                          <tr
                            key={problem.id}
                            onClick={() => navigate(`/coding/problems/${problem.id}`)}
                            className="hover:bg-gray-50 transition-colors border-b border-gray-200 cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-blue-600">
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <FontAwesomeIcon icon={faCheck} className="text-green-500 text-lg" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{problem.title}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-900">{problem.acceptanceRate}%</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(problem.id);
                                }}
                                className="hover:scale-110 transition-transform duration-200 text-xl"
                              >
                                <span className={starredProblems.has(problem.id) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}>
                                  {starredProblems.has(problem.id) ? '★' : '☆'}
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {activeTab === 'starred' && starredProblemsList.map((problem, index) => (
                          <tr
                            key={problem.id}
                            onClick={() => navigate(`/coding/problems/${problem.id}`)}
                            className="hover:bg-gray-50 transition-colors border-b border-gray-200 cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-blue-600">
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{problem.title}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-900">{problem.acceptanceRate}%</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(problem.id);
                                }}
                                className="hover:scale-110 transition-transform duration-200 text-xl"
                              >
                                <span className={starredProblems.has(problem.id) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}>
                                  {starredProblems.has(problem.id) ? '★' : '☆'}
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CodingProfile;
