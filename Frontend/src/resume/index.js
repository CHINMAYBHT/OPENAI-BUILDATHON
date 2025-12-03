import ResumeLanding from './ResumeLanding';
import ResumeBuilder from './ResumeBuilder';
import JobTailoring from './JobTailoring';
import ATSChecker from './ATSChecker';
import ResumeTemplates from './ResumeTemplates';
import SkillGapAnalyzer from './SkillGapAnalyzer';

export const resumeRoutes = [
  {
    path: '/resume',
    element: <ResumeLanding />,
    name: 'Resume Landing'
  },
  {
    path: '/resume/builder',
    element: <ResumeBuilder />,
    name: 'Resume Builder'
  },
  {
    path: '/resume/tailor',
    element: <JobTailoring />,
    name: 'Job Tailoring'
  },
  {
    path: '/resume/ats-check',
    element: <ATSChecker />,
    name: 'ATS Checker'
  },
  {
    path: '/resume/templates',
    element: <ResumeTemplates />,
    name: 'Templates'
  },
  {
    path: '/resume/skill-gap',
    element: <SkillGapAnalyzer />,
    name: 'Skill Gap Analyzer'
  }
];

export default resumeRoutes;
