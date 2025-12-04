import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './components/Login.jsx'
import CodingLanding from './coding/CodingLanding.jsx'
import CodingProblems from './coding/CodingProblems.jsx'
import CodeEditor from './coding/CodeEditor.jsx'
import CompanyList from './coding/CompanyList.jsx'
import CompanyQuestions from './coding/CompanyQuestions.jsx'
import CodingProfile from './coding/CodingProfile.jsx'
import CodingSheets from './coding/CodingSheets.jsx'
import CodingSheetDetail from './coding/CodingSheetDetail.jsx'
import MockTests from './coding/MockTests.jsx'
import NewMockTestPage from './coding/NewMockTestPage.jsx'
import TestPage from './coding/TestPage.jsx'
import TestResults from './coding/TestResults.jsx'
import TestReview from './coding/TestReview.jsx'
import ResumeLanding from './resume/ResumeLanding.jsx'
import ResumeBuilder from './resume/ResumeBuilder.jsx'
import JobTailoring from './resume/JobTailoring.jsx'
import ATSChecker from './resume/ATSChecker.jsx'
import ResumeTemplates from './resume/ResumeTemplates.jsx'
import SkillGapAnalyzer from './resume/SkillGapAnalyzer.jsx'
import SubmissionResults from './pages/SubmissionResults.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        
        {/* Coding Routes */}
        <Route path="/coding" element={<CodingLanding />} />
        <Route path="/coding/problems" element={<CodingProblems />} />
        <Route path="/coding/problem/:id" element={<CodeEditor />} />
        <Route path="/coding/companies" element={<CompanyList />} />
        <Route path="/coding/companies/:companyName" element={<CompanyQuestions />} />
        <Route path="/coding/sheets" element={<CodingSheets />} />
        <Route path="/coding/sheet/:sheetId" element={<CodingSheetDetail />} />
        <Route path="/coding/profile" element={<CodingProfile />} />
        <Route path="/coding/mock-tests" element={<MockTests />} />
        <Route path="/new-mock-test" element={<NewMockTestPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/test-results" element={<TestResults />} />
        <Route path="/test-review" element={<TestReview />} />
        <Route path="/submission-results" element={<SubmissionResults />} />

        {/* Resume Routes */}
        <Route path="/resume" element={<ResumeLanding />} />
        <Route path="/resume/builder" element={<ResumeBuilder />} />
        <Route path="/resume/tailor" element={<JobTailoring />} />
        <Route path="/resume/ats-check" element={<ATSChecker />} />
        <Route path="/resume/templates" element={<ResumeTemplates />} />
        <Route path="/resume/skill-gap" element={<SkillGapAnalyzer />} />
      </Routes>
    </Router>
  </StrictMode>,
)
