-- Job Builder Database Schema
-- Supabase PostgreSQL Database Tables

-- Enable Row Level Security (RLS) by default for all tables
-- This is a security best practice for multi-tenant applications

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  linkedin_url text,
  github_url text,
  website_url text,
  phone text,
  date_of_birth date,
  experience_years integer DEFAULT 0,
  current_title text,
  current_company text,
  skills text[], -- Array of skills
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Coding Problems Table
CREATE TABLE IF NOT EXISTS coding_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
  time_limit integer DEFAULT 30, -- minutes
  memory_limit integer DEFAULT 256, -- MB
  tags text[] DEFAULT '{}',
  examples jsonb DEFAULT '[]', -- Array of input/output examples
  constraints text[] DEFAULT '{}',
  hints text[] DEFAULT '{}',
  starter_code text DEFAULT '',
  test_cases jsonb, -- Hidden test cases for evaluation
  expected_solutions jsonb, -- For reference
  company_tags text[] DEFAULT '{}', -- Companies this problem appears in
  topic_tags text[] DEFAULT '{}', -- DSA topics
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Coding Test Attempts Table
CREATE TABLE IF NOT EXISTS coding_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES coding_problems(id) ON DELETE CASCADE,
  code text NOT NULL,
  language text NOT NULL DEFAULT 'javascript',
  status text CHECK (status IN ('passed', 'failed', 'partial', 'timeout', 'error')) DEFAULT 'failed',
  time_taken integer, -- seconds
  memory_used integer, -- KB
  test_cases_passed integer DEFAULT 0,
  total_test_cases integer DEFAULT 0,
  submission_time timestamptz DEFAULT now(),
  score integer DEFAULT 0,
  feedback text, -- AI feedback
  ai_analysis jsonb -- Detailed AI analysis
);

-- Coding Practice Sessions
CREATE TABLE IF NOT EXISTS coding_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type text CHECK (test_type IN ('practice', 'exam', 'interview_prep')) DEFAULT 'practice',
  title text NOT NULL,
  description text,
  problems uuid[] DEFAULT '{}', -- Array of problem IDs
  total_problems integer GENERATED ALWAYS AS (array_length(problems, 1)) STORED,
  time_limit integer, -- total time in minutes
  started_at timestamptz,
  completed_at timestamptz,
  status text CHECK (status IN ('in_progress', 'completed', 'expired')) DEFAULT 'in_progress',
  total_score integer DEFAULT 0,
  max_score integer DEFAULT 0,
  time_taken integer, -- minutes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coding Test Results
CREATE TABLE IF NOT EXISTS coding_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES coding_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_problems integer DEFAULT 0,
  solved_problems integer DEFAULT 0,
  total_score integer DEFAULT 0,
  max_score integer DEFAULT 0,
  time_taken integer, -- minutes
  average_time_per_problem numeric(5,2),
  difficulty_distribution jsonb, -- {"Easy": 5, "Medium": 3, "Hard": 1}
  topic_distribution jsonb, -- {"Arrays": 3, "Trees": 2, etc.}
  ai_feedback text,
  ai_score integer CHECK (ai_score >= 0 AND ai_score <= 100),
  recommendations jsonb, -- Suggested improvements
  created_at timestamptz DEFAULT now()
);

-- Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  template_type text DEFAULT 'modern',
  resume_data jsonb NOT NULL, -- Complete resume JSON
  is_default boolean DEFAULT false,
  ats_score integer CHECK (ats_score >= 0 AND ats_score <= 100) DEFAULT 0,
  last_modified timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resume Templates
CREATE TABLE IF NOT EXISTS resume_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text DEFAULT 'professional',
  preview_image_url text,
  template_data jsonb NOT NULL,
  is_premium boolean DEFAULT false,
  price numeric(5,2) DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job Applications Tracker
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  job_title text NOT NULL,
  job_url text,
  application_platform text, -- LinkedIn, Indeed, Company Website, etc.
  application_date date,
  status text CHECK (status IN ('applied', 'screening', 'interview', 'assessment', 'offer', 'rejected', 'withdrawn')) DEFAULT 'applied',
  salary_range jsonb, -- {"min": 50000, "max": 70000, "currency": "USD"}
  job_description text,
  requirements text[] DEFAULT '{}',
  contact_person text,
  contact_email text,
  contact_phone text,
  notes text,
  follow_up_date date,
  feedback_received boolean DEFAULT false,
  feedback_text text,
  resume_used uuid REFERENCES resumes(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job Search Queries/Searches
CREATE TABLE IF NOT EXISTS job_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  query text NOT NULL,
  location text,
  filters jsonb DEFAULT '{}', -- Additional search filters
  platform text, -- Source platform
  results_count integer DEFAULT 0,
  saved boolean DEFAULT false,
  search_date timestamptz DEFAULT now()
);

-- Skill Gap Analysis Results
CREATE TABLE IF NOT EXISTS skill_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title text NOT NULL,
  job_description text NOT NULL,
  current_skills text[] DEFAULT '{}',
  required_skills jsonb DEFAULT '{}',
  missing_skills jsonb DEFAULT '{}',
  match_percentage integer CHECK (match_percentage >= 0 AND match_percentage <= 100),
  recommendations jsonb DEFAULT '{}', -- Courses, certifications, etc.
  analysis_date timestamptz DEFAULT now()
);

-- Interview Preparation
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company text NOT NULL,
  position text NOT NULL,
  interview_date timestamptz,
  interview_type text CHECK (interview_type IN ('phone_screen', 'technical', 'hr', 'behavioral', 'system_design', 'coding_challenge')),
  round_number integer DEFAULT 1,
  interviewer_names text[] DEFAULT '{}',
  duration integer, -- minutes
  preparation_done jsonb DEFAULT '{}',
  questions_asked jsonb DEFAULT '{}', -- Array of question objects
  your_answers jsonb DEFAULT '{}',
  interviewer_feedback text,
  follow_up_task text,
  status text CHECK (status IN ('upcoming', 'completed', 'cancelled')) DEFAULT 'upcoming',
  outcome text CHECK (outcome IN ('positive', 'neutral', 'negative', 'no_feedback')) DEFAULT 'neutral',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ATS Check Results
CREATE TABLE IF NOT EXISTS ats_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_content text NOT NULL,
  keywords_found text[] DEFAULT '{}',
  keywords_missing text[] DEFAULT '{}',
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100) DEFAULT 0,
  detailed_analysis jsonb DEFAULT '{}',
  suggestions jsonb DEFAULT '{}',
  check_date timestamptz DEFAULT now()
);

-- AI Chat/Assistant Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid, -- For grouping related messages
  message_type text CHECK (message_type IN ('user', 'assistant')) DEFAULT 'user',
  message_content text NOT NULL,
  metadata jsonb DEFAULT '{}', -- Token count, model used, etc.
  confidence_score numeric(3,2), -- AI confidence in response
  timestamp timestamptz DEFAULT now()
);

-- User Progress Tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_type text CHECK (module_type IN ('coding', 'interview', 'resume', 'ats', 'job_search')) NOT NULL,
  module_id uuid, -- Reference to specific item (problem, template, etc.)
  status text CHECK (status IN ('started', 'in_progress', 'completed', 'mastered')) DEFAULT 'started',
  progress_percentage integer CHECK (progress_percentage >= 0 AND progress_percentage <= 100) DEFAULT 0,
  time_spent integer DEFAULT 0, -- minutes
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coding_attempts_user_id ON coding_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_attempts_problem_id ON coding_attempts(problem_id);
CREATE INDEX IF NOT EXISTS idx_coding_sessions_user_id ON coding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coding_problems_updated_at BEFORE UPDATE ON coding_problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coding_sessions_updated_at BEFORE UPDATE ON coding_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resume_templates_updated_at BEFORE UPDATE ON resume_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions (adjust based on your security requirements)
-- Note: These are basic grants - adjust based on your RLS policies
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON coding_problems TO authenticated;
GRANT SELECT, INSERT, UPDATE ON coding_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON coding_sessions TO authenticated;
GRANT SELECT, INSERT ON coding_results TO authenticated;
GRANT SELECT, INSERT, UPDATE ON resumes TO authenticated;
GRANT SELECT ON resume_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON job_applications TO authenticated;
GRANT SELECT, INSERT ON job_searches TO authenticated;
GRANT SELECT, INSERT ON skill_analysis TO authenticated;
GRANT SELECT, INSERT, UPDATE ON interviews TO authenticated;
GRANT SELECT, INSERT ON ats_checks TO authenticated;
GRANT SELECT, INSERT ON ai_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_progress TO authenticated;
