import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCode,
  faBuilding,
  faUser,
  faListCheck,
  faBullseye,
  faClock,
  faHome
} from '@fortawesome/free-solid-svg-icons';

function CodingLanding() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: faCode,
      title: 'All Coding Problems',
      description: 'Browse 500+ coding questions with advanced filters by difficulty, topic, and company.',
      color: 'blue',
      link: '/coding/problems'
    },
    {
      icon: faBuilding,
      title: 'Company-wise Questions',
      description: 'View interview questions asked by specific companies including FAANG and top tech firms.',
      color: 'purple',
      link: '/coding/companies'
    },
    {
      icon: faUser,
      title: 'Coding Profile',
      description: 'Track your progress with detailed stats: problems solved, attempts, streaks, and topic mastery.',
      color: 'green',
      link: '/coding/profile'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative">

      {/* Home Icon - Top Right */}
      <Link
        to="/"
        className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-white  hover:bg-gray-50 transition-all duration-300 text-blue-500 hover:text-blue-600"
        title="Go to Home"
      >
        <FontAwesomeIcon icon={faHome} className="text-xl" />
      </Link>

      {/* Main Content */}
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-800">
              Master <span className="gradient-text">Coding Interviews</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Practice coding problems, track your progress, and ace your technical interviews with AI-powered guidance
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2"
              >
                <div className="w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="text-4xl text-blue-500"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 transition-colors">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <Link
                  to={feature.link}
                  className="w-[70%] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-3xl font-semibold text-sm transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <span>{feature.buttonText || (feature.title.includes('Profile') ? 'View Profile' :
                    feature.title.includes('Problems') ? 'Browse Problems' :
                      feature.title.includes('Company') ? 'View Companies' :
                        feature.title.includes('Sheets') ? 'Explore Sheets' :
                          feature.title.includes('Recommendations') ? 'Get Recommendations' :
                            feature.title.includes('Mock') ? 'Take Mock Test' :
                              'Start Mock Test')}</span>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </main>

    </div>
  );
}

export default CodingLanding;
