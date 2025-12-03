import { useState } from 'react';
import { ArrowLeft, Download, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

function ResumeTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [darkMode, setDarkMode] = useState(false);
  const [resumeData] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1-234-567-8900',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer with 5+ years in full-stack development',
    experience: [
      {
        company: 'Tech Company',
        position: 'Senior Engineer',
        duration: '2021-Present',
        description: 'Led team of 5 developers, delivered 20+ features'
      }
    ],
    education: [
      {
        school: 'University of Technology',
        degree: 'B.Tech',
        field: 'Computer Science',
        year: '2018'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS']
  });

  const templates = [
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple' },
    { id: 'modern', name: 'Modern', description: 'Contemporary design' },
    { id: 'clean', name: 'Clean', description: 'Professional and organized' },
    { id: 'professional', name: 'Professional', description: 'Corporate style' },
    { id: 'creative', name: 'Creative', description: 'Unique and modern' }
  ];

  // Minimal Template
  const MinimalTemplate = () => (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-12 rounded-lg font-serif`}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="border-b-2 border-gray-300 pb-6">
          <h1 className="text-3xl font-bold">{resumeData.fullName}</h1>
          <p className="text-sm mt-2">{resumeData.email} | {resumeData.phone} | {resumeData.location}</p>
        </div>

        <div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{resumeData.summary}</p>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3 border-b border-gray-300 pb-2">EXPERIENCE</h2>
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between">
                <strong>{exp.position}</strong>
                <span className="text-sm">{exp.duration}</span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{exp.company}</p>
              <p className="text-sm mt-1">{exp.description}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3 border-b border-gray-300 pb-2">EDUCATION</h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx}>
              <div className="flex justify-between">
                <strong>{edu.degree} in {edu.field}</strong>
                <span className="text-sm">{edu.year}</span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{edu.school}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3 border-b border-gray-300 pb-2">SKILLS</h2>
          <p className="text-sm">{resumeData.skills.join(' • ')}</p>
        </div>
      </div>
    </div>
  );

  // Modern Template
  const ModernTemplate = () => (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} p-12 rounded-lg`}>
      <div className={`${darkMode ? 'bg-blue-900 text-white' : 'bg-blue-50 text-gray-900'} rounded-lg p-8 mb-8`}>
        <h1 className="text-4xl font-bold">{resumeData.fullName}</h1>
        <div className="flex gap-4 text-sm mt-3">
          <span>{resumeData.email}</span>
          <span>•</span>
          <span>{resumeData.phone}</span>
          <span>•</span>
          <span>{resumeData.location}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{resumeData.summary}</p>
        </div>

        <div>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Experience</h2>
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className={`mb-4 pb-4 ${idx !== resumeData.experience.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{exp.position}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{exp.company}</p>
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{exp.duration}</span>
              </div>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{exp.description}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Education</h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx}>
              <p className="font-bold">{edu.degree} in {edu.field}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{edu.school}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, idx) => (
              <span key={idx} className={`${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'} px-3 py-1 rounded-full text-sm`}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render based on selection
  const getTemplate = () => {
    switch (selectedTemplate) {
      case 'minimal':
        return <MinimalTemplate />;
      case 'modern':
        return <ModernTemplate />;
      default:
        return <ModernTemplate />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Link to="/resume" className="flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Resume
        </Link>

        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Templates</h1>
            <p className="text-lg text-gray-600">
              Choose from professionally designed templates. Pick a style that matches your industry.
            </p>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 mb-12">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedTemplate === template.id
                  ? 'border-2 border-blue-600 bg-blue-50'
                  : 'border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="font-bold text-gray-900">{template.name}</p>
              <p className="text-sm text-gray-600">{template.description}</p>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl overflow-hidden shadow-lg`}>
              {getTemplate()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 sticky top-20">
              <h3 className="font-bold text-gray-900 mb-4">Template Features</h3>
              <ul className="space-y-3">
                <li className="flex gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>ATS-optimized formatting</span>
                </li>
                <li className="flex gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Light & dark theme support</span>
                </li>
                <li className="flex gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Mobile-responsive design</span>
                </li>
                <li className="flex gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Professional fonts & spacing</span>
                </li>
                <li className="flex gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Easy to customize</span>
                </li>
              </ul>

              <button className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download as PDF
              </button>

              <button className="w-full mt-3 px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold">
                Download as DOCX
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Recommended For</h3>
              <p className="text-sm text-gray-700 mb-3">
                {selectedTemplate === 'minimal' && 'Academic roles, cleaners, professionals in traditional industries'}
                {selectedTemplate === 'modern' && 'Tech companies, startups, creative roles, fresh graduates'}
                {selectedTemplate === 'clean' && 'Corporate roles, management, consulting, finance'}
                {selectedTemplate === 'professional' && 'Enterprise roles, senior positions, traditional companies'}
                {selectedTemplate === 'creative' && 'Design, marketing, creative agencies, freelancers'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeTemplates;
