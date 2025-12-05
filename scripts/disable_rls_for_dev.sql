-- Temporarily disable RLS for development/testing
-- Run this in Supabase SQL Editor to allow backend API calls

ALTER TABLE code_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE submission_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE problem_ai_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_code_reviews DISABLE ROW LEVEL SECURITY;

-- Alternative - Create policies that allow authenticated requests
-- Uncomment below if you want to keep RLS enabled but allow backend operations

/*
-- Allow service role operations
CREATE POLICY "Service role can insert code_runs"
  ON code_runs FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can insert submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can insert submission_results"
  ON submission_results FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can insert problem_ai_chats"
  ON problem_ai_chats FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow anonymous inserts with user_id validation"
  ON code_runs FOR INSERT
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Allow anonymous inserts with user_id validation"
  ON submissions FOR INSERT
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Allow anonymous inserts with user_id validation"
  ON submission_results FOR INSERT
  WITH CHECK (submission_id IS NOT NULL);

CREATE POLICY "Allow anonymous inserts with user_id validation"
  ON problem_ai_chats FOR INSERT
  WITH CHECK (user_id IS NOT NULL);
*/
