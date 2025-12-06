import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: 'Basic',
      price: 'Free!',
      originalPrice: '$1.25',
      features: [
        'AI Resume Builder',
        'ATS-Optimized Templates',
        'Course Roadmap & Skill Gap Analysis',
        'Job Tracker Dashboard',
        'Unlimited Edits'
      ],
      highlighted: true,
      bgColor: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Pro',
      price: 'Free!',
      originalPrice: '$1.50',
      features: [
        'Everything in Basic',
        'AI Code Analysis & Feedback',
        'Application-Level View Generator',
        'Code Quality & Readability Scores',
        'Company Wise Coding Sheets'
      ],
      highlighted: false,
      bgColor: 'from-gray-50 to-white'
    },
    {
      name: 'Premium',
      price: 'Free!',
      originalPrice: '$2.00',
      features: [
        'Everything in Pro',
        'AI Interview Simulator',
        'Real-time Interview Feedback',
        'Technical & HR Round Practice',
        'Job Readiness Analytics'
      ],
      highlighted: false,
      bgColor: 'from-gray-50 to-white'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Choose Your Perfect <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All plans are currently <span className="text-green-600 font-semibold">100% FREE</span> during our launch period!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.highlighted 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 text-xs font-bold rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                <h3 className={`text-2xl font-bold mb-4 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <div className={`text-sm line-through mb-1 ${plan.highlighted ? 'text-blue-200' : 'text-gray-400'}`}>
                    {plan.originalPrice}
                  </div>
                  <div className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-green-500'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/')}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  plan.highlighted 
                    ? 'bg-white text-blue-600 hover:bg-gray-100' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </div>
  );
};

export default PricingPage;
