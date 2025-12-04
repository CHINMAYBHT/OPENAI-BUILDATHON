import { useState, useRef } from 'react';
import { ArrowLeft, Upload, LinkedinIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';

function ResumeBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: []
  });

  const [inputMethod, setInputMethod] = useState(null); // 'linkedin', 'pdf', 'manual'
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleLinkedInInput = async () => {
    if (!linkedinUrl.trim()) {
      alert('Please enter a valid LinkedIn URL');
      return;
    }
    setIsProcessing(true);
    try {
      // API call to extract LinkedIn data
      // const response = await extractFromLinkedIn(linkedinUrl);
      // setResumeData(response);
      setTimeout(() => {
        setResumeData({
          ...resumeData,
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+1-234-567-8900',
          location: 'San Francisco, CA',
          summary: 'Experienced software engineer with 5+ years in full-stack development',
          experience: [
            {
              id: 1,
              company: 'Tech Company',
              position: 'Senior Engineer',
              duration: '2021-Present',
              description: 'Led team of 5 developers'
            }
          ],
          education: [
            {
              id: 1,
              school: 'University of Technology',
              degree: 'B.Tech',
              field: 'Computer Science',
              year: '2018'
            }
          ],
          skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
          certifications: [],
          projects: []
        });
        setCurrentStep(1);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      alert('Failed to extract data from LinkedIn. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setIsProcessing(true);
    try {
      // API call to extract from PDF
      // const response = await extractFromPDF(file);
      // setResumeData(response);
      setTimeout(() => {
        setResumeData({
          ...resumeData,
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1-987-654-3210',
          location: 'New York, NY',
          summary: 'Product Manager with background in software engineering',
          experience: [
            {
              id: 1,
              company: 'Innovation Inc',
              position: 'Product Manager',
              duration: '2020-Present',
              description: 'Managed product roadmap for 10+ features'
            }
          ],
          education: [
            {
              id: 1,
              school: 'State University',
              degree: 'Bachelor',
              field: 'Engineering',
              year: '2017'
            }
          ],
          skills: ['Product Strategy', 'Analytics', 'Leadership'],
          certifications: ['Product Management Certification'],
          projects: []
        });
        setCurrentStep(1);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      alert('Failed to extract data from PDF. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleManualEntry = () => {
    setInputMethod('manual');
    setCurrentStep(1);
  };

  const updateResumeField = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        company: '',
        position: '',
        duration: '',
        description: ''
      }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Save resume to backend
    console.log('Resume data:', resumeData);
    // API call to save resume
    alert('Resume saved successfully!');
  };

  // Step 0: Input Method Selection
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Link to="/resume" className="flex items-center text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Resume
          </Link>

          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Resume</h1>
            <p className="text-lg text-gray-600">Choose how you'd like to start building your resume</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* LinkedIn Input */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => setInputMethod('linkedin')}>
              <div className="text-center">
                <FontAwesomeIcon icon={faLinkedin} className="text-5xl text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">LinkedIn URL</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Enter your LinkedIn profile URL and we'll extract all your data automatically
                </p>
                <span className="text-blue-600 font-semibold text-sm">Click to start →</span>
              </div>
            </div>

            {/* PDF Upload */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <div className="text-center">
                <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Upload PDF</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Upload your existing resume PDF and we'll extract and enhance it
                </p>
                <span className="text-blue-600 font-semibold text-sm">Click to upload →</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
            </div>

            {/* Manual Entry */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-400 transition-colors cursor-pointer"
              onClick={handleManualEntry}>
              <div className="text-center">
                <FontAwesomeIcon icon={faStar} className="text-5xl text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Start Fresh</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Create your resume from scratch with our guided form
                </p>
                <span className="text-blue-600 font-semibold text-sm">Click to begin →</span>
              </div>
            </div>
          </div>

          {/* LinkedIn URL Input Modal */}
          {inputMethod === 'linkedin' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter LinkedIn URL</h2>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setInputMethod(null);
                      setLinkedinUrl('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLinkedInInput}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Extract Data'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 1: Basic Information
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Link to="/resume" className="flex items-center text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Resume
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Basic Information</h1>
            <p className="text-gray-600">Step 1 of 4</p>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
              <div className="bg-blue-600 h-2 rounded-full w-1/4 transition-all duration-300"></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={resumeData.fullName}
                onChange={(e) => updateResumeField('fullName', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={resumeData.email}
                onChange={(e) => updateResumeField('email', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={resumeData.phone}
                onChange={(e) => updateResumeField('phone', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Location"
                value={resumeData.location}
                onChange={(e) => updateResumeField('location', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <textarea
              placeholder="Professional Summary (optional)"
              value={resumeData.summary}
              onChange={(e) => updateResumeField('summary', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
          </div>

          <div className="flex justify-between mt-12">
            <button
              onClick={handlePrev}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Experience & Education
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Link to="/resume" className="flex items-center text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Resume
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Experience & Education</h1>
            <p className="text-gray-600">Step 2 of 4</p>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
              <div className="bg-blue-600 h-2 rounded-full w-2/4 transition-all duration-300"></div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Experience Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Experience</h2>
              <div className="space-y-4">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="border border-gray-300 rounded-lg p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Duration (e.g., Jan 2020 - Present)"
                      value={exp.duration}
                      onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Job Description & Achievements"
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                    />
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm"
                    >
                      Remove Experience
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addExperience}
                className="mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
              >
                + Add Experience
              </button>
            </div>
          </div>

          <div className="flex justify-between mt-12">
            <button
              onClick={handlePrev}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Skills & Additional Info
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Link to="/resume" className="flex items-center text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Resume
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills & Additional Info</h1>
            <p className="text-gray-600">Step 3 of 4</p>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
              <div className="bg-blue-600 h-2 rounded-full w-3/4 transition-all duration-300"></div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g., React, Node.js, Python, AWS, Leadership"
                value={resumeData.skills.join(', ')}
                onChange={(e) => updateResumeField('skills', e.target.value.split(',').map(s => s.trim()))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 flex gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Pro Tip:</p>
                <p className="text-sm text-blue-800 mt-1">
                  Add 8-10 relevant skills that match your target job role. We'll optimize them further when you tailor for specific jobs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-12">
            <button
              onClick={handlePrev}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ResumeBuilder;
