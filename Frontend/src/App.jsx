import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { supabase } from './utils/supabase';
import {
  faFileAlt,
  faBullseye,
  faBrain,
  faCode,
  faComments,
  faChartLine,
  faShieldAlt,
  faBolt,
  faCommentDots
} from '@fortawesome/free-solid-svg-icons';
import homeworkSvg from './assets/homework.svg';
import screeningSvg from './assets/screening.svg';
import myresumePng from './assets/myresume.png';
import aiResponsePng from './assets/ai_response.png';
import referrelPng from './assets/referrel.png';
import sharedPng from './assets/shared.png';
import workPng from './assets/work.png';
import './App.css';
function App() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const localUser = localStorage.getItem('user');

      if (session?.user || localUser) {
        setIsLoggedIn(true);
        if (session?.user) {
          localStorage.setItem('user', JSON.stringify(session.user));
        }
      } else {
        navigate('/login');
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        if (session?.user) {
          localStorage.setItem('user', JSON.stringify(session.user));
          setIsLoggedIn(true);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        navigate('/login');
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase (handles OAuth and regular auth)
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }

      // Clear local storage
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Supabase logout fails, clear local data
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      navigate('/login');
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 2);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 2) % 2);
  };

  const features = [
    {
      icon: faFileAlt,
      image: myresumePng,
      title: "AI Resume Builder",
      description: "Create polished, ATS-friendly resumes with real achievements and measurable impact tailored to your target role. Our AI analyzes your experience and suggests powerful action verbs and quantifiable metrics.",
      link: "/resume"
    },
    {
      icon: faBrain,
      image: homeworkSvg,
      title: "Course Roadmap",
      description: "Get personalized skill gap analysis, job role recommendations, and curated course suggestions. Discover which skills employers are looking for in your target role and create a learning path to acquire them."
    },
    {
      icon: faCode,
      image: workPng,
      title: "Coding Practice",
      description: "Daily coding challenges, timed tests, and AI-powered feedback to sharpen your technical skills. Practice with real interview questions from top tech companies and get instant feedback on your solutions."
    },
    {
      icon: faComments,
      image: aiResponsePng,
      title: "Interview Simulator",
      description: "Practice technical and HR rounds with AI-driven simulations and receive instant, actionable feedback. Experience realistic interview scenarios and learn how to articulate your thoughts clearly under pressure."
    },
    // {
    //   icon: faChartLine,
    //   image: sharedPng,
    //   title: "Job Tracker",
    //   description: "Discover relevant jobs, track applications, organize resumes, and view your job readiness analytics. Never lose track of where you applied or when to follow up with our intelligent application management system."
    // }
  ];

  const problems = [
    {
      title: "ATS Rejections",
      description: "Most resumes never reach humans due to poor formatting or missing keywords"
    },
    {
      title: "Company Ghosting",
      description: "No updates after applying or interviewing leads to frustration and uncertainty"
    },
    {
      title: "Skill Gaps",
      description: "Unclear which skills to learn, courses to take, or roles you're eligible for"
    },
    {
      title: "Untargeted Applications",
      description: "Generic resumes and poor job-role targeting reduce your selection chances"
    },
    {
      title: "Fragmented Tools",
      description: "Using multiple platforms for resume, coding, interviews, and job search is inefficient"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-800">Job Builder</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Home</a>
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Features</a>
              <a href="#problems" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Solutions</a>
              <a href="#market-demand" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Market</a>
              <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Pricing</Link>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 inline-flex items-center"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 inline-flex items-center"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#home" className="block text-gray-600 hover:text-gray-900 transition-colors font-medium py-2">Home</a>
              <a href="#features" className="block text-gray-600 hover:text-gray-900 transition-colors font-medium py-2">Features</a>
              <a href="#problems" className="block text-gray-600 hover:text-gray-900 transition-colors font-medium py-2">Solutions</a>
              <a href="#market-demand" className="block text-gray-600 hover:text-gray-900 transition-colors font-medium py-2">Market</a>
              <Link to="/pricing" className="block text-gray-600 hover:text-gray-900 transition-colors font-medium py-2">Pricing</Link>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold block text-center"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold block text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Carousel */}
      <section className={`pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-[85vh] flex items-center relative overflow-hidden transition-colors duration-500 ${currentSlide === 1 ? 'bg-gray-150' : 'bg-gray-100'}`}>
        <div className="max-w-full mx-auto w-full ">
          <div className="relative overflow-hidden">
            {/* Slide 1 */}
            <div className={`grid lg:grid-cols-2 gap-8 items-center transition-transform duration-500 ease-in-out ${currentSlide === 0 ? 'translate-x-0' : currentSlide === 1 ? '-translate-x-full' : 'translate-x-full'}`}>
              {/* Left Content */}
              <div className="space-y-6 flex flex-col justify-center ml-24">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-800">
                  AI-Powered Career Platform{' '}
                  <span className="gradient-text">From Resume to Hired</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-xl">
                  Your complete job search companion powered by OpenAI. Build resumes, practice interviews, track applications, and land your dream job.
                </p>
                <div className="pt-4">
                  <a href="#features" className="bg-primary-500 hover:bg-primary-600 text-white px-7 py-3 rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-300 inline-flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Right Illustration */}
              <div className="relative flex justify-center lg:justify-start ml-28">
                <img
                  src="/hero-illustration.png"
                  alt="Job Builder Platform Illustration"
                  className="w-full max-w-lg h-auto"
                />
              </div>
            </div>

            {/* Slide 2 */}
            <div className={`grid lg:grid-cols-2 gap-16 items-center transition-transform duration-500 ease-in-out absolute inset-0 ${currentSlide === 1 ? 'translate-x-0' : currentSlide === 0 ? 'translate-x-full' : '-translate-x-full'}`}>
              {/* Left Content - Image */}
              <div className="relative flex justify-center lg:justify-start ml-20 ">
                <img
                  src="/resume-builder.png"
                  alt="Resume Builder AI"
                  className="w-full max-w-lg h-auto"
                />
              </div>

              {/* Right Content - Text */}
              <div className="space-y-6 flex flex-col justify-center mr-10">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-800">
                  Smart Resume Builder{' '}
                  <span className="gradient-text">ATS-Optimized</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-xl">
                  Create professional, ATS-friendly resumes with AI-powered suggestions. Match job descriptions perfectly and get past automated filters.
                </p>
                <div className="pt-4">
                  <Link to="/ai-resume" className="bg-primary-500 hover:bg-primary-600 text-white px-7 py-3 rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-300 inline-flex items-center">
                    Build Resume
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>



            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300 z-20"
              aria-label="Previous slide"
            >
              <ArrowRight className="w-5 h-5 text-gray-700 rotate-180" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300 z-20"
              aria-label="Next slide"
            >
              <ArrowRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center items-center space-x-2 mt-5">
            <button
              onClick={() => setCurrentSlide(0)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === 0 ? 'bg-primary-500 w-8' : 'bg-gray-300'}`}
              aria-label="Go to slide 1"
            />
            <button
              onClick={() => setCurrentSlide(1)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === 1 ? 'bg-primary-500 w-8' : 'bg-gray-300'}`}
              aria-label="Go to slide 2"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to accelerate your career journey in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className="w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="text-3xl text-blue-500"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-4 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Learn More Button */}
                {feature.title === "Coding Practice" ? (
                  <Link to="/coding" className="w-[70%] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-3xl font-semibold text-sm transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg">
                    <span>{feature.title}</span>
                  </Link>
                )
                  : feature.title === "Interview Simulator" ? (
                    <Link to="/interview" className="w-[70%] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-3xl font-semibold text-sm transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg">
                      <span>{feature.title}</span>
                    </Link>
                  ) : feature.title === "AI Resume Builder" ? (
                    <Link to="/AI-resume" className="w-[70%] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-3xl font-semibold text-sm transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg">
                      <span>{feature.title}</span>
                    </Link>
                  ) : feature.title === "Course Roadmap" ? (
                    <Link to="/career-roadmap" className="w-[70%] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-3xl font-semibold text-sm transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg">
                      <span>{feature.title}</span>
                    </Link>
                  ) : (
                    <button className="w-[70%] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-3xl font-semibold text-sm transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg">
                      <span>{feature.title}</span>
                    </button>
                  )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems & Solutions Section */}
      <section id="problems" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Problems vs <span className="gradient-text">Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how Job Builder solves every major job search challenge
            </p>
          </div>

          <div className="space-y-4 max-w-5xl mx-auto">
            {[
              {
                problem: "Manual Resume Creation",
                problemDesc: "Creating professional resumes is time-consuming and requires design skills",
                solution: "AI Resume Builder",
                solutionDesc: "Upload your details and instantly generate ATS-optimized, professional resumes"
              },
              {
                problem: "No Coding Feedback",
                problemDesc: "Practice platforms don't explain why your code fails or how to improve",
                solution: "AI Code Analysis on Every Run",
                solutionDesc: "Get instant AI analysis comparing expected vs actual output with detailed feedback on every test run"
              },
              {
                problem: "Theory vs Real-World Gap",
                problemDesc: "Online assessment questions are application-level while practice problems are basic theory",
                solution: "Application-Level View Generator",
                solutionDesc: "Transform any coding problem into real-world application scenarios and modify questions to match interview standards"
              },
              {
                problem: "No Code Quality Feedback",
                problemDesc: "Platforms only check if code works, not if it's maintainable or readable",
                solution: "AI Code Review After Submission",
                solutionDesc: "Receive readability and maintainability scores with detailed feedback on code quality and best practices"
              },
              {
                problem: "Skill Gaps",
                problemDesc: "Unclear which skills to learn, courses to take, or roles you're eligible for",
                solution: "AI Career Roadmap",
                solutionDesc: "Personalized skill gap analysis with curated course recommendations"
              }
            ].map((item, index) => (
              <div key={index} className="glass-effect rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="grid md:grid-cols-2">
                  {/* Problem Side - Left */}
                  <div className="p-6 bg-red-50 border-r-2 border-red-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{item.problem}</h3>
                        <p className="text-sm text-gray-600">{item.problemDesc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Solution Side - Right */}
                  <div className="p-6 bg-green-50">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{item.solution}</h3>
                        <p className="text-sm text-gray-600">{item.solutionDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Future Work Section */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Future <span className="gradient-text">Enhancements</span>
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Upcoming features to further revolutionize your job search
              </p>
            </div>

            <div className="space-y-4 max-w-5xl mx-auto">
              {[
                {
                  problem: "Company Ghosting",
                  problemDesc: "No updates after applying or interviewing leads to frustration",
                  solution: "Anti-Ghosting System",
                  solutionDesc: "Automatic follow-ups and ethical employer transparency scores"
                },
                {
                  problem: "Untargeted Applications",
                  problemDesc: "Generic resumes and poor job-role targeting reduce selection chances",
                  solution: "Smart Job Matching",
                  solutionDesc: "AI analyzes your profile and suggests perfect-fit job opportunities"
                }
              ].map((item, index) => (
                <div key={index} className="glass-effect rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="grid md:grid-cols-2">
                    {/* Problem Side - Left */}
                    <div className="p-6 bg-red-50 border-r-2 border-red-200">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{item.problem}</h3>
                          <p className="text-sm text-gray-600">{item.problemDesc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Solution Side - Right */}
                    <div className="p-6 bg-green-50">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{item.solution}</h3>
                          <p className="text-sm text-gray-600">{item.solutionDesc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Market Demand Section */}
      <section id="market-demand" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Market <span className="gradient-text">Demand</span></h2>
          <p className="text-base text-gray-600 max-w-3xl mx-auto mb-12">These market signals show the real need for a tool like Job Builder.</p>

          <div className="space-y-12">
            {/* Global Market - Image Left */}
            <div className="flex flex-col lg:flex-row items-center bg-[#f3f5f7e6] rounded-2xl overflow-hidden min-h-[500px]">
              <div className="lg:w-1/2 p-8 lg:p-3">
                <img
                  src="/market-growth.png"
                  alt="Global Market Growth"
                  className="w-full h-48 lg:h-[50vh] object-contain rounded-xl"
                />
              </div>
              <div className="lg:w-1/2 p-8 lg:p-16 text-left flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Global Market</h3>
                <p className="text-lg text-gray-500 leading-relaxed">The global resume-building and career services market is experiencing unprecedented growth, projected to reach <span className="font-semibold text-primary-500">$11B by 2029</span>. This explosive expansion validates the massive demand for professional resume and career advancement tools. Companies like LinkedIn, Indeed, and ZipRecruiter have built billion-dollar businesses around career services, while millions of professionals worldwide seek better ways to optimize their job search process and stand out in increasingly competitive markets.</p>
              </div>
            </div>

            {/* Talent Gap - Image Right */}
            <div className="flex flex-col lg:flex-row-reverse items-center bg-[#f4f9ff] rounded-2xl overflow-hidden min-h-[400px]">
              <div className="lg:w-1/2 p-8 lg:p-16">
                <img
                  src="/talent-gap.png"
                  alt="Talent Gap Challenge"
                  className="w-full h-48 lg:h-[50vh] object-contain rounded-xl"
                />
              </div>
              <div className="lg:w-1/2 p-8 lg:p-16 text-left flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Talent Gap</h3>
                <p className="text-lg text-gray-500 leading-relaxed">Over <span className="font-semibold text-primary-500">42% of graduates in India</span> are considered not employable by industry standards, highlighting massive skill gaps that employers face globally. This crisis extends beyond India - similar trends are observed in developing economies worldwide where traditional education fails to keep pace with rapidly evolving job requirements. Companies spend billions annually on training new hires, while millions of qualified candidates remain unemployed simply due to presentation and skill-matching issues that AI-powered platforms can solve.</p>
              </div>
            </div>

            {/* ATS Challenges - Image Left */}
            <div className="flex flex-col lg:flex-row items-center bg-[#edf3f9] rounded-2xl overflow-hidden min-h-[400px]">
              <div className="lg:w-1/2 p-8 lg:p-16">
                <img
                  src="/ats-challenges.png"
                  alt="ATS Filter Challenges"
                  className="w-full h-48 lg:h-[50vh] object-contain rounded-xl"
                />
              </div>
              <div className="lg:w-1/2 p-8 lg:p-16 text-left flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">ATS Challenges</h3>
                <p className="text-lg text-gray-500 leading-relaxed">Approximately <span className="font-semibold text-primary-500">70% of resumes fail</span> ATS (Applicant Tracking System) filters before ever reaching human recruiters. This technological barrier means that many qualified candidates are automatically rejected due to poor keyword optimization, incorrect formatting, or incompatible file types. Fortune 500 companies receive thousands of applications daily, making ATS systems essential but creating a massive bottleneck that prevents talent discovery. Job Builder's AI optimization ensures your resume passes these digital gatekeepers.</p>
              </div>
            </div>

            {/* AI Adoption - Image Right */}
            <div className="flex flex-col lg:flex-row-reverse items-center bg-[#edf4f9] rounded-2xl overflow-hidden min-h-[400px]">
              <div className="lg:w-1/2 p-8 lg:p-16">
                <img
                  src="/ai-adoption.png"
                  alt="AI Adoption in Career Tools"
                  className="w-full h-48 lg:h-[50vh] object-contain rounded-xl"
                />
              </div>
              <div className="lg:w-1/2 p-8 lg:p-16 text-left flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">AI Adoption</h3>
                <p className="text-lg text-gray-500 leading-relaxed">Demand for <span className="font-semibold text-primary-500">AI-guided career tools</span> is exploding as both candidates and employers seek faster, fairer hiring processes. Leading companies like Google, Microsoft, and Amazon are investing heavily in AI-powered recruitment tools, while job seekers increasingly turn to AI for resume optimization, interview preparation, and career guidance. The COVID-19 pandemic accelerated digital transformation in hiring, with remote interviews and AI screening becoming standard practice. This creates a perfect opportunity for comprehensive AI-powered career platforms.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Job Builder Section */}
      <section id="why" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
              Why Choose <span className="gradient-text">Job Builder</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The difference between landing your dream job and getting lost in the crowd
            </p>
          </div>

          {/* Main Comparison */}
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            {/* Without Job Builder */}
            <div className="bg-red-50 rounded-3xl p-8 border-2 border-red-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-red-800 mb-2">Without Job Builder</h3>
                <p className="text-sm text-red-600">The traditional job search struggle</p>
              </div>
              <div className="space-y-4">
                {[
                  "Juggling 5-7 different tools and platforms",
                  "70% of resumes rejected by ATS filters",
                  "No realistic interview practice or feedback",
                  "Months of trial-and-error learning",
                  "Generic applications with low success rates",
                  "No feedback on interview performance"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* With Job Builder */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                RECOMMENDED
              </div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">With Job Builder</h3>
                <p className="text-sm text-green-600">The intelligent career acceleration platform</p>
              </div>
              <div className="space-y-4">
                {[
                  "All-in-one platform replaces multiple tools",
                  "AI-optimized resumes that beat ATS filters",
                  "AI-powered interview simulator with real-time feedback",
                  "Personalized learning paths and mentorship",
                  "Targeted applications with 3x higher success",
                  "Real-time AI feedback and improvement suggestions"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col md:flex-row justify-evenly gap-8 mb-8">
            <div className="flex-1 flex flex-col justify-center mx-12">
              <div className="mb-4">
                <span className="text-xl font-bold text-white">Job Builder</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered career platform helping you go from resume to hired.
              </p>
            </div>
            <div className="flex-1 text-center">
              <h4 className="font-semibold text-white mb-4">Navigate</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-primary-400 transition-colors cursor-pointer">Home</a></li>
                <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div className="flex-1 text-center">
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/interview" className="hover:text-primary-400 transition-colors">Interview</Link></li>
                <li><Link to="/coding" className="hover:text-primary-400 transition-colors">Coding</Link></li>
                <li><Link to="/career-roadmap" className="hover:text-primary-400 transition-colors">Course</Link></li>
              </ul>
            </div>
            <div className="flex-1 text-center">
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/legal#privacy" className="hover:text-primary-400 transition-colors">Privacy</Link></li>
                <li><Link to="/legal#terms" className="hover:text-primary-400 transition-colors">Terms</Link></li>
                <li><Link to="/legal#security" className="hover:text-primary-400 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Job Builder. All rights reserved. Powered by OpenAI x NextWave.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
