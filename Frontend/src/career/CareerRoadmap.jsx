import { useState, useRef } from 'react';
import { jsPDF } from "jspdf";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faSpinner,
  faBook,
  faCheckCircle,
  faExclamationCircle,
  faTrophy,
  faArrowRight,
  faDownload,
  faLightbulb,
  faGraduationCap,
  faFileText,
  faBriefcase,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

function CareerRoadmap() {
  const [step, setStep] = useState('upload');
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing analysis...');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDragOverJob, setIsDragOverJob] = useState(false);
  const [isDragOverResume, setIsDragOverResume] = useState(false);
  const jobFileRef = useRef(null);
  const resumeFileRef = useRef(null);

  // Load PDF.js
  useState(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const extractTextFromPDF = async (file) => {
    try {
      if (!window.pdfjsLib) return '';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
      }
      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      alert('Failed to parse PDF. Please try a text file.');
      return '';
    }
  };

  const processFile = async (file, type) => {
    let text = '';
    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(file);
    } else {
      text = await file.text();
    }

    if (type === 'job') setJobDescription(text);
    else setResume(text);
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    if (type === 'job') setIsDragOverJob(true);
    else setIsDragOverResume(true);
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    if (type === 'job') setIsDragOverJob(false);
    else setIsDragOverResume(false);
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    if (type === 'job') setIsDragOverJob(false);
    else setIsDragOverResume(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file, type);
    }
  };

  const handleJobFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file, 'job');
    }
  };

  const handleResumeFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file, 'resume');
    }
  };

  const handleTextInput = (type, text) => {
    if (type === 'job') setJobDescription(text);
    else setResume(text);
  };

  const analyzeWithAI = async () => {
    if (!jobDescription.trim() || !resume.trim()) {
      alert('Please provide both job description and resume');
      return;
    }

    setLoading(true);
    setStep('analyzing');

    // Simulate progress steps
    const steps = [
      'Reading Job Description...',
      'Analyzing Resume Structure...',
      'Identifying Skill Gaps...',
      'Searching for Courses...',
      'Generating Role Recommendations...',
      'Finalizing Report...'
    ];
    let stepIndex = 0;
    setLoadingText(steps[0]);

    const intervalId = setInterval(() => {
      // Loop through first 3 steps
      if (stepIndex < steps.length - 2) {
        stepIndex++;
        setLoadingText(steps[stepIndex]);
      } else if (stepIndex === steps.length - 2) {
        // Stay on "Searching for Courses..." until almost done
        // We won't advance to "Finalizing" until we get a response or just before
      }
    }, 2000);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased timeout for AI

      const response = await fetch('http://localhost:5002/api/gemini/analyze-skill-gap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          resume
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      clearInterval(intervalId); // Stop cycling steps

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.analysis) {
        // Set final loading text before showing results
        setLoadingText(steps[steps.length - 1]); // "Finalizing Report..."

        // Small delay to let user see "Finalizing"
        setTimeout(() => {
          setAnalysisResult(data.analysis);
          setStep('results');
        }, 800);
      } else {
        const errorMsg = data.error || 'Unknown error';
        alert('Failed to analyze: ' + errorMsg);
        setStep('upload');
      }
    } catch (error) {
      clearInterval(intervalId);
      console.error('Error:', error);
      let errorMessage = '';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. The analysis is taking longer than expected.';
      } else {
        errorMessage = error.message || 'An error occurred';
      }
      alert('Error: ' + errorMessage);
      setStep('upload');
    }

    setLoading(false);
  };

  const downloadReportAsText = () => {
    let content = `SKILL GAP ANALYSIS REPORT\n`;
    content += `======================================\n\n`;
    content += `Job Match: ${analysisResult.matchPercentage}%\n`;
    content += `Summary: ${analysisResult.summary}\n\n`;

    if (analysisResult.recommendedRoles && analysisResult.recommendedRoles.length > 0) {
      content += `RECOMMENDED ROLES:\n`;
      content += `--------------------------------------\n`;
      analysisResult.recommendedRoles.forEach(role => {
        content += `• ${role.role} (${role.match} Match) - ${role.reason}\n`;
      });
      content += `\n`;
    }

    if (analysisResult.skillBreakdown?.matched && analysisResult.skillBreakdown.matched.length > 0) {
      content += `YOUR STRENGTHS:\n`;
      content += `--------------------------------------\n`;
      analysisResult.skillBreakdown.matched.forEach(skill => {
        content += `✓ ${skill.skill} (${skill.category}) - ${skill.proficiency}\n`;
      });
      content += `\n`;
    }

    if (analysisResult.skillBreakdown?.gaps && analysisResult.skillBreakdown.gaps.length > 0) {
      content += `SKILLS TO DEVELOP:\n`;
      content += `--------------------------------------\n`;
      analysisResult.skillBreakdown.gaps.forEach(gap => {
        content += `• ${gap.skill} [${gap.priority}] - ${gap.estimatedHours}+ hours\n`;
      });
      content += `\n`;
    }

    content += `Estimated Timeline: ${analysisResult.estimatedTimeline}\n`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'skill-gap-report.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadReportAsPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102);
    doc.text("Skill Gap Analysis Report", 20, 20);

    // Meta Info
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Job Match Score: ${analysisResult.matchPercentage}%`, 20, 38);

    let yPos = 50;

    // Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Summary", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(analysisResult.summary, 170);
    doc.text(splitSummary, 20, yPos);
    doc.text(splitSummary, 20, yPos);
    yPos += splitSummary.length * 5 + 10;

    // Roles
    if (analysisResult.recommendedRoles && analysisResult.recommendedRoles.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("Role Recommendations", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(0);

      analysisResult.recommendedRoles.forEach(role => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.setFont(undefined, 'bold');
        doc.text(`• ${role.role}`, 25, yPos);
        doc.setFont(undefined, 'normal');

        // Add link text
        doc.setFontSize(9);
        doc.setTextColor(100);
        const matchText = `Match: ${role.match} | ${role.reason}`;
        doc.text(matchText, 25, yPos + 5);

        // Job Links
        doc.setTextColor(0, 119, 181); // LinkedIn Blue
        doc.textWithLink("LinkedIn Jobs", 25, yPos + 10, { url: role.linkedinUrl });

        doc.setTextColor(33, 100, 243); // Indeed Blue
        doc.textWithLink("Indeed Jobs", 55, yPos + 10, { url: role.indeedUrl });

        yPos += 18;
        doc.setTextColor(0);
        doc.setFontSize(10);
      });
      yPos += 5;
    }

    // Strengths
    if (analysisResult.skillBreakdown?.matched && analysisResult.skillBreakdown.matched.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 100, 0); // Green
      doc.text("Your Strengths", 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0);
      analysisResult.skillBreakdown.matched.forEach(skill => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.text(`• ${skill.skill} (${skill.proficiency})`, 25, yPos);
        yPos += 6;
      });
      yPos += 10;
    }

    // Gaps - Compact
    if (analysisResult.skillBreakdown?.gaps && analysisResult.skillBreakdown.gaps.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(150, 0, 0); // Red
      doc.text("Skills to Develop", 20, yPos);
      yPos += 8;
      doc.setFontSize(9); // Smaller font
      doc.setTextColor(0);
      analysisResult.skillBreakdown.gaps.forEach(gap => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        // Compact single line format
        doc.text(`• ${gap.skill} [${gap.priority}] - ${gap.estimatedHours}h`, 25, yPos);
        yPos += 5; // Tighter spacing
      });
      yPos += 8;
    }

    // Recommended Courses
    if (analysisResult.recommendedCourses && analysisResult.recommendedCourses.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("Recommended Courses", 20, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 255); // Blue for links

      analysisResult.recommendedCourses.forEach(course => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.textWithLink(`• ${course.name} (${course.platform})`, 25, yPos, { url: course.url });
        yPos += 6;
      });
      doc.setTextColor(0); // Reset
    }

    doc.save("skill-gap-report.pdf");
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Skill Gap Analyzer</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Get personalized skill gap analysis, job role recommendations, and curated course suggestions.
                Discover which skills employers are looking for in your target role and create a learning path to acquire them.
              </p>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto mb-12">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <FontAwesomeIcon icon={faTrophy} className="text-xl text-blue-600 mb-2" />
                  <h3 className="font-bold text-gray-900 text-sm">Skill Gap Analysis</h3>
                  <p className="text-xs text-gray-600">Identify missing skills from your resume</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <FontAwesomeIcon icon={faLightbulb} className="text-xl text-yellow-500 mb-2" />
                  <h3 className="font-bold text-gray-900 text-sm">Role Recommendations</h3>
                  <p className="text-xs text-gray-600">Get insights for your target job role</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <FontAwesomeIcon icon={faBook} className="text-xl text-purple-600 mb-2" />
                  <h3 className="font-bold text-gray-900 text-sm">Curated Courses</h3>
                  <p className="text-xs text-gray-600">Best resources to bridge your gaps</p>
                </div>
              </div>
            </div>

            {/* Step 1: Upload */}
            {step === 'upload' && (
              <div className="animate-fadeIn">
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {/* Job Description Upload */}
                  <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <FontAwesomeIcon icon={faFileText} className="text-2xl text-blue-500" />
                      <h2 className="text-2xl font-bold text-gray-800">Job Description</h2>
                    </div>

                    <div
                      className="mb-6"
                      onDragOver={(e) => handleDragOver(e, 'job')}
                      onDragLeave={(e) => handleDragLeave(e, 'job')}
                      onDrop={(e) => handleDrop(e, 'job')}
                    >
                      <div
                        className={`block w-full p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragOverJob ? 'border-blue-600 bg-blue-50' : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                        onClick={() => jobFileRef.current?.click()}
                      >
                        <FontAwesomeIcon icon={faUpload} className={`text-3xl mb-3 ${isDragOverJob ? 'text-blue-600' : 'text-blue-500'}`} />
                        <p className="text-sm text-gray-600 font-semibold">
                          {isDragOverJob ? 'Drop to Upload' : 'Click to upload or drag and drop'}
                        </p>
                        <input
                          ref={jobFileRef}
                          type="file"
                          accept=".txt,.pdf,.doc,.docx"
                          onChange={handleJobFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 font-semibold mb-2">Or paste below:</p>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => handleTextInput('job', e.target.value)}
                        placeholder="Paste your job description here..."
                        className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {jobDescription && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Job description uploaded ({jobDescription.length} characters)</span>
                      </div>
                    )}
                  </div>

                  {/* Resume Upload */}
                  <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <FontAwesomeIcon icon={faFileText} className="text-2xl text-green-500" />
                      <h2 className="text-2xl font-bold text-gray-800">Your Resume</h2>
                    </div>

                    <div
                      className="mb-6"
                      onDragOver={(e) => handleDragOver(e, 'resume')}
                      onDragLeave={(e) => handleDragLeave(e, 'resume')}
                      onDrop={(e) => handleDrop(e, 'resume')}
                    >
                      <div
                        className={`block w-full p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragOverResume ? 'border-green-600 bg-green-50' : 'border-green-300 hover:border-green-500 hover:bg-green-50'
                          }`}
                        onClick={() => resumeFileRef.current?.click()}
                      >
                        <FontAwesomeIcon icon={faUpload} className={`text-3xl mb-3 ${isDragOverResume ? 'text-green-600' : 'text-green-500'}`} />
                        <p className="text-sm text-gray-600 font-semibold">
                          {isDragOverResume ? 'Drop to Upload' : 'Click to upload or drag and drop'}
                        </p>
                        <input
                          ref={resumeFileRef}
                          type="file"
                          accept=".txt,.pdf,.doc,.docx"
                          onChange={handleResumeFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 font-semibold mb-2">Or paste below:</p>
                      <textarea
                        value={resume}
                        onChange={(e) => handleTextInput('resume', e.target.value)}
                        placeholder="Paste your resume here..."
                        className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      />
                    </div>

                    {resume && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Resume uploaded ({resume.length} characters)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <button
                    onClick={analyzeWithAI}
                    disabled={!jobDescription.trim() || !resume.trim() || loading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faLightbulb} />
                        Analyze Skill Gaps
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Analyzing */}
            {step === 'analyzing' && (
              <div className="animate-fadeIn text-center">
                <div className="bg-white rounded-2xl p-12 shadow-lg max-w-2xl mx-auto">
                  <FontAwesomeIcon icon={faSpinner} className="text-6xl text-blue-500 animate-spin mb-6" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{loadingText}</h2>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4 max-w-sm mx-auto overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded-full animate-pulse w-full"></div>
                  </div>
                  <p className="text-gray-500 mt-4 text-sm">This usually takes about 10-15 seconds</p>
                </div>
              </div>
            )}

            {/* Step 3: Results */}
            {step === 'results' && analysisResult && (
              <div className="animate-fadeIn">
                {/* Summary Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border-2 border-blue-200">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Job Match Score</p>
                      <div className="text-5xl font-bold text-blue-600">{analysisResult.matchPercentage}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analysisResult.matchPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Skills Matched</p>
                      <div className="text-5xl font-bold text-green-600">
                        {analysisResult.statistics?.skillsMatched || 0} / {analysisResult.statistics?.totalRequiredSkills || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-4">Out of required skills</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Learning Timeline</p>
                      <div className="text-lg font-bold text-green-600 mt-4">{analysisResult.estimatedTimeline}</div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <p className="text-gray-700">{analysisResult.summary}</p>
                  </div>
                </div>

                {/* Recommended Roles */}
                {analysisResult.recommendedRoles && analysisResult.recommendedRoles.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <FontAwesomeIcon icon={faBriefcase} className="text-2xl text-blue-600" />
                      <h2 className="text-3xl font-bold text-gray-800">Recommended Roles</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {analysisResult.recommendedRoles.map((role, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{role.role}</h3>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-3 ${role.match === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {role.match} Match
                          </span>
                          <p className="text-sm text-gray-600 mb-4">{role.reason}</p>

                          <div className="flex gap-2">
                            <a href={role.linkedinUrl} target="_blank" rel="noopener noreferrer"
                              className="flex-1 text-center py-2 bg-[#0077b5] text-white rounded text-sm font-semibold hover:opacity-90">
                              LinkedIn
                            </a>
                            <a href={role.indeedUrl} target="_blank" rel="noopener noreferrer"
                              className="flex-1 text-center py-2 bg-[#2164f3] text-white rounded text-sm font-semibold hover:opacity-90">
                              Indeed
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Skills */}
                {analysisResult.skillBreakdown?.matched && analysisResult.skillBreakdown.matched.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <FontAwesomeIcon icon={faTrophy} className="text-2xl text-green-500" />
                      <h2 className="text-3xl font-bold text-gray-800">Your Strengths</h2>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                      <ul className="space-y-3">
                        {analysisResult.skillBreakdown.matched.map((skill, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 flex-shrink-0 mt-1" />
                            <span className="font-semibold">
                              {skill.skill} <span className="text-sm text-gray-600">({skill.category}) - {skill.proficiency}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Skill Gaps */}
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <FontAwesomeIcon icon={faExclamationCircle} className="text-2xl text-red-500" />
                    <h2 className="text-3xl font-bold text-gray-800">Skills to Develop</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {analysisResult.skillBreakdown?.gaps && analysisResult.skillBreakdown.gaps.map((skillGap, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-800 text-sm">{skillGap.skill}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${skillGap.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                            skillGap.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {skillGap.priority}
                          </span>
                        </div>

                        <div className="text-xs text-gray-600 mb-2 flex flex-wrap gap-2">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">Category: {skillGap.category}</span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Est: {skillGap.estimatedHours}h</span>
                        </div>

                        {/* Recommended Practice Problems */}
                        {skillGap.recommendedProblems && skillGap.recommendedProblems.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Practice:</p>
                            <div className="space-y-1">
                              {skillGap.recommendedProblems.slice(0, 2).map((prob, pIdx) => (
                                <a
                                  key={pIdx}
                                  href={prob.url}
                                  className="flex items-center justify-between p-1.5 rounded bg-gray-50 hover:bg-blue-50 text-xs transition-colors group"
                                >
                                  <span className="text-blue-600 font-medium truncate max-w-[150px] group-hover:underline">{prob.name}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${prob.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                    prob.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                    {prob.difficulty}
                                  </span>
                                </a>
                              ))}
                              {skillGap.recommendedProblems.length > 2 && (
                                <p className="text-[10px] text-gray-400 text-center">+ {skillGap.recommendedProblems.length - 2} more</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Courses */}
                {analysisResult.recommendedCourses && analysisResult.recommendedCourses.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <FontAwesomeIcon icon={faBook} className="text-2xl text-blue-500" />
                      <h2 className="text-3xl font-bold text-gray-800">Recommended Courses</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {analysisResult.recommendedCourses.map((course, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-100 hover:border-blue-300 transition-all flex flex-col justify-between h-full">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {course.platform}
                              </span>
                              {course.skill && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {course.skill}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2" title={course.name}>
                              {course.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                              <span>⏱️ {course.hours || 'Self-paced'}</span>
                              <span className="text-gray-300">|</span>
                              <span>{course.type || 'Course'}</span>
                            </div>
                          </div>

                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center bg-white border-2 border-blue-500 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors mt-auto"
                          >
                            View Resource <FontAwesomeIcon icon={faArrowRight} className="ml-1 text-sm" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mt-12">
                  <button
                    onClick={downloadReportAsText}
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFileText} />
                    Download Text
                  </button>
                  <button
                    onClick={downloadReportAsPDF}
                    className="px-6 py-3 bg-white border-2 border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      setJobDescription('');
                      setResume('');
                      setAnalysisResult(null);
                      setStep('upload');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                    Analyze Another Job
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default CareerRoadmap;
