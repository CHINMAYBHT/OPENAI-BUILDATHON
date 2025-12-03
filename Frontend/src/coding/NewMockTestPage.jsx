import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCode,
  faQuestionCircle,
  faMagic,
  faCheck,
  faArrowRight,
  faCheckCircle,
  faClock,
  faArrowLeft,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

function NewMockTestPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [difficulty, setDifficulty] = useState('mixed');
  const [duration, setDuration] = useState(60);
  const modalRef = useRef(null);

  const testTypes = [
    {
      id: 'coding',
      name: 'Coding Test',
      icon: faCode,
      description: 'Write and submit code solutions for interview problems',
      color: 'blue',
      details: [
        '2-3 coding problems',
        '60 minutes duration',
        'Real-time code execution',
        'Detailed solutions'
      ]
    },
    {
      id: 'mcq',
      name: 'MCQ Test',
      icon: faQuestionCircle,
      description: 'Multiple choice questions on data structures and algorithms',
      color: 'purple',
      details: [
        '20-30 questions',
        '45 minutes duration',
        'Instant feedback',
        'Topic-wise analysis'
      ]
    },
    {
      id: 'mix',
      name: 'Mixed Test',
      icon: faMagic,
      description: 'Combination of coding problems and MCQ questions',
      color: 'green',
      details: [
        '2 coding + 15 MCQ',
        '90 minutes duration',
        'Comprehensive coverage',
        'Complete assessment'
      ]
    }
  ];

  const topics = [
    'Arrays',
    'Strings',
    'Linked Lists',
    'Stacks & Queues',
    'Trees',
    'Graphs',
    'Dynamic Programming',
    'Sorting & Searching',
    'Hash Maps',
    'Heaps',
    'Greedy',
    'System Design'
  ];

  const companies = [
    'Google',
    'Amazon',
    'Apple',
    'Meta',
    'Microsoft',
    'Tesla',
    'Netflix',
    'LinkedIn',
    'Goldman Sachs',
    'JPMorgan',
    'Uber',
    'Airbnb'
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'mixed', label: 'Mixed' }
  ];

  const durations = [30, 45, 60, 90, 120];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle closing modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  const handleTopicToggle = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleCompanyToggle = (company) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const handleStartTest = () => {
    const testConfig = {
      type: selectedType,
      topics: selectedTopics.length > 0 ? selectedTopics : 'all',
      companies: selectedCompanies.length > 0 ? selectedCompanies : 'all',
      difficulty,
      duration
    };
    console.log('Starting test with config:', testConfig);
    // Navigate to test page with configuration
    navigate('/test', { state: { testConfig } });
  };

  const openModal = (typeId) => {
    setSelectedType(typeId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedType(null);
    // Reset form
    setSelectedTopics([]);
    setSelectedCompanies([]);
    setDifficulty('mixed');
    setDuration(60);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <div className="space-y-8 mt-16">
          {/* Test Type Selection */}
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Test Type</h2>
              <p className="text-gray-600">Select the type of test you want to take</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => openModal(type.id)}
                  className="relative rounded-2xl shadow-lg p-8 cursor-pointer transition-all duration-300 overflow-hidden group bg-white border-2 border-transparent hover:border-gray-300 hover:shadow-xl"
                >
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-16 h-16 flex items-center justify-center mb-4 rounded-xl ${
                      type.color === 'blue' ? 'bg-blue-100' :
                      type.color === 'purple' ? 'bg-purple-100' :
                      'bg-green-100'
                    }`}>
                      <FontAwesomeIcon 
                        icon={type.icon} 
                        className={`text-3xl ${
                          type.color === 'blue' ? 'text-blue-600' :
                          type.color === 'purple' ? 'text-purple-600' :
                          'text-green-600'
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{type.name}</h3>
                    <p className="text-gray-600 text-sm mb-6">{type.description}</p>

                    {/* Details */}
                    <ul className="space-y-2 mb-6">
                      {type.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <FontAwesomeIcon icon={faCheckCircle} className={`flex-shrink-0 ${
                            type.color === 'blue' ? 'text-blue-500' :
                            type.color === 'purple' ? 'text-purple-500' :
                            'text-green-500'
                          }`} />
                          {detail}
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      type.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                      type.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                      'bg-green-500 hover:bg-green-600 text-white'
                    }`}>
                      <span>Select</span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay with Blur Background */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out" 
          onClick={closeModal}
        ></div>
      )}

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div 
            ref={modalRef}
            className="bg-gradient-to-br from-white via-blue-50 to-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto scrollbar-hide shadow-2xl"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Modal Content */}
            <div className="p-8 space-y-6">
              <div className="border-b-2  pb-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Configure Your Test</h2>
              </div>
              {/* Topics Dropdown */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">Select Topics</label>
                <select
                  value={selectedTopics[0] || ''}
                  onChange={(e) => setSelectedTopics(e.target.value ? [e.target.value] : [])}
                  className="w-full p-3 border-1 rounded-[20px] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer appearance-none"
                >
                  <option value="">Choose a topic...</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              {/* Companies Dropdown */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">Select Companies</label>
                <select
                  value={selectedCompanies[0] || ''}
                  onChange={(e) => setSelectedCompanies(e.target.value ? [e.target.value] : [])}
                  className="w-full p-3 border-1 rounded-[20px] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer appearance-none"
                >
                  <option value="">Choose a company...</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Level Dropdown */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">Difficulty Level</label>
                <select
                  value={difficulty || ''}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border-1 rounded-[20px] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer appearance-none"
                >
                  <option value="">Choose difficulty...</option>
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Dropdown */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">Test Duration</label>
                <select
                  value={duration || ''}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full p-3 border-1 rounded-[20px] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer appearance-none"
                >
                  <option value="">Choose duration...</option>
                  {durations.map((dur) => (
                    <option key={dur} value={dur}>
                      {dur} minutes
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-gray-200 p-6 flex gap-4 z-10">
            
              <button
                onClick={handleStartTest}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowRight} />
                Start Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewMockTestPage;


