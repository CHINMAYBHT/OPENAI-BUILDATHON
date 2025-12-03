import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Target, BarChart3, Palette, Brain, Download, Zap } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, 
  faCog,
  faListCheck
} from '@fortawesome/free-solid-svg-icons';

function ResumeLanding() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const features = [
    {
      icon: faFileAlt,
      title: 'Smart Resume Generation',
      description: 'Upload LinkedIn URL or old resume PDF. AI extracts and rewrites your experience with strong action verbs and quantifiable metrics automatically.',
      isLucide: false,
      color: 'blue',
      link: '/resume/builder'
    },
    {
      icon: Target,
      title: 'AI Job-Based Tailoring',
      description: 'Select your target job role. Our AI instantly rewrites your resume to highlight matching skills, remove irrelevant content, and optimize for ATS.',
      isLucide: true,
      color: 'purple',
      link: '/resume/tailor'
    },
    {
      icon: BarChart3,
      title: 'ATS Score & Suggestions',
      description: 'Get an instant ATS compatibility score (0-100) with detailed feedback on missing keywords, weak verbs, and formatting issues.',
      isLucide: true,
      color: 'green',
      link: '/resume/ats-check'
    },
    {
      icon: Palette,
      title: 'Professional Templates',
      description: '5 AI-designed templates: Minimal, Modern, Clean, Professional. Choose light or dark theme with layouts for freshers or experienced professionals.',
      isLucide: true,
      color: 'orange',
      link: '/resume/templates'
    },
    {
      icon: BarChart3,
      title: 'Auto Metric Generation',
      description: 'Turn vague descriptions into impactful achievements. "Worked on project" becomes "Delivered system used by 500+ users, improving efficiency by 45%."',
      isLucide: true,
      color: 'red',
      link: '/resume/builder'
    },
    {
      icon: Brain,
      title: 'Grammar & Tone Enhancement',
      description: 'One-click improvement: better tone, remove filler words, crisp bullets, action-oriented language. Make every word count.',
      isLucide: true,
      color: 'cyan',
      link: '/resume/builder'
    },
    {
      icon: Download,
      title: 'Multi-Format Export',
      description: 'Download as PDF, DOCX, plain text (for ATS), or JSON. Choose the format that works for your application.',
      isLucide: true,
      color: 'pink',
      link: '/resume/builder'
    },
    {
      icon: Zap,
      title: 'Skill Gap Analyzer',
      description: 'Upload any job description. AI suggests missing skills, relevant courses, recommended projects, and certifications to boost your profile.',
      isLucide: true,
      color: 'indigo',
      link: '/resume/skill-gap'
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      
      {/* Home Icon - Top Right */}
      <Link 
        to="/" 
        className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-white  hover:bg-gray-50 transition-all duration-300 text-blue-500 hover:text-blue-600"
        title="Go to Home"
      >
        <Home className="w-6 h-6" />
      </Link>
      
      {/* Main Content */}
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center my-20">
           
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
              Build & Optimize Your <span className="text-blue-600">Perfect Resume</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Generate ATS-optimized resumes from LinkedIn URLs or PDFs. Get AI-powered suggestions, job-specific tailoring, and pass every applicant tracking system.
            </p>
            
            {isLoggedIn && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                <Link 
                  to="/resume/builder"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Start Building Resume
                </Link>
                <Link 
                  to="/resume/ats-check"
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Check ATS Score
                </Link>
              </div>
            )}
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.isLucide ? (
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  ) : (
                    <FontAwesomeIcon 
                      icon={feature.icon} 
                      className="text-2xl text-blue-600"
                    />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                {isLoggedIn && (
                  <Link 
                    to={feature.link}
                    className="text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center"
                  >
                    Explore →
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* How It Works Section */}
          <div className="bg-gray-50 rounded-3xl p-12 mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Upload or Input</h3>
                <p className="text-sm text-gray-600">
                  LinkedIn URL, PDF resume, or fill basic details manually
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-bold text-gray-900 mb-2">AI Enhancement</h3>
                <p className="text-sm text-gray-600">
                  AI rewrites with action verbs, adds metrics, improves tone
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Tailor & Score</h3>
                <p className="text-sm text-gray-600">
                  Tailor to job roles, check ATS score, get suggestions
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Export & Apply</h3>
                <p className="text-sm text-gray-600">
                  Download as PDF, DOCX, text, or JSON and apply
                </p>
              </div>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="bg-blue-600 text-white rounded-3xl p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to build your perfect resume?</h2>
              <p className="text-lg text-blue-100 mb-8">
                Sign up now and get your resume ATS-optimized in minutes
              </p>
              <Link 
                to="/login"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResumeLanding;
