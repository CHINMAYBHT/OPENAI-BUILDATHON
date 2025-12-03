import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faChartBar,
  faCheckCircle,
  faExclamationCircle,
  faStar,
  faDownload
} from '@fortawesome/free-solid-svg-icons';

function TestReports({ reports }) {
  const [selectedReport, setSelectedReport] = useState(reports[0] || null);

  if (!selectedReport) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <p className="text-gray-600 text-lg">No test reports available yet. Start a test to generate reports!</p>
      </div>
    );
  }

  const calculateGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'green' };
    if (score >= 80) return { grade: 'A', color: 'green' };
    if (score >= 70) return { grade: 'B', color: 'yellow' };
    if (score >= 60) return { grade: 'C', color: 'orange' };
    return { grade: 'D', color: 'red' };
  };

  const grade = calculateGrade(selectedReport.score);

  return (
    <div className="space-y-8">
      {/* Report Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Select a Report</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                selectedReport.id === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-gray-800 text-sm">{report.testName}</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{report.score}%</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Report */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{selectedReport.testName}</h2>
            <p className="text-gray-600 mt-2">Detailed Performance Analysis</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300">
            <FontAwesomeIcon icon={faDownload} />
            Download Report
          </button>
        </div>

        {/* Overall Score & Grade */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Score Section */}
          <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
            <div className="text-center">
              <p className="text-gray-600 text-lg font-medium mb-4">Overall Score</p>
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="12"
                    strokeDasharray={`${(selectedReport.score / 100) * 565.48} 565.48`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <p className="text-5xl font-bold text-blue-600">{selectedReport.score}</p>
                  <p className="text-gray-600 text-sm">/ {selectedReport.totalScore}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grade Section */}
          <div className="space-y-6">
            {/* Grade Card */}
            <div className={`bg-${grade.color}-50 rounded-2xl p-8 border-2 border-${grade.color}-200`}>
              <p className="text-gray-600 text-lg font-medium mb-4">Grade</p>
              <div className="text-6xl font-bold mb-4">
                <span className={`text-${grade.color}-600`}>{grade.grade}</span>
              </div>
              <p className={`text-${grade.color}-700 font-medium`}>
                {grade.grade === 'A+' && 'Excellent Performance! Keep it up!'}
                {grade.grade === 'A' && 'Great job! You are well prepared!'}
                {grade.grade === 'B' && 'Good effort. More practice needed in some areas.'}
                {grade.grade === 'C' && 'You need more practice. Focus on weak topics.'}
                {grade.grade === 'D' && 'Significant improvement needed. Start from basics.'}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-800">{selectedReport.completion}%</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-sm">Accuracy</p>
                <p className="text-2xl font-bold text-gray-800">{selectedReport.accuracy}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Time Spent</p>
            <p className="text-2xl font-bold text-gray-800">{selectedReport.timeSpent}</p>
          </div>
          <div className="text-center border-l border-r border-gray-300">
            <p className="text-gray-600 text-sm mb-2">Avg Time Per Question</p>
            <p className="text-2xl font-bold text-gray-800">{selectedReport.avgTimePerQuestion}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Overall Performance</p>
            <p className="text-2xl font-bold text-green-600">↑ {Math.round(selectedReport.score * 0.9)}%</p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <div className="bg-green-50 rounded-2xl p-6 border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
              Strengths
            </h3>
            <ul className="space-y-3">
              {selectedReport.strengths.length > 0 ? (
                selectedReport.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <FontAwesomeIcon icon={faStar} className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{strength}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-600">No specific strengths identified yet.</p>
              )}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-orange-500" />
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {selectedReport.weaknesses.length > 0 ? (
                selectedReport.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                    <span className="text-gray-700 font-medium">{weakness}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-600">Great! No major weaknesses identified.</p>
              )}
            </ul>
          </div>
        </div>

        {/* Topics Performance */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FontAwesomeIcon icon={faChartBar} className="text-blue-500" />
            Performance by Topic
          </h3>
          <div className="space-y-6">
            {Object.entries(selectedReport.topicsPerformance).map(([topic, score]) => (
              <div key={topic}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-800">{topic}</span>
                  <span className="font-bold text-blue-600">{score}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Recommendations</h3>
          <ul className="space-y-3 text-blue-900">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Focus on optimizing your solution approach for better time complexity</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Practice edge case handling and boundary conditions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Review concepts in Dynamic Programming - this is a strong area, maintain it!</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Take more tests on your weaker topics to build confidence</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TestReports;
