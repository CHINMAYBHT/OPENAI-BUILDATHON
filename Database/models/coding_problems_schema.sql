-- Problems
create type difficulty_t as enum ('easy','medium','hard');

create table problems (
  id uuid primary key default gen_random_uuid(),
  problem_number serial unique,
  slug text unique,
  title text not null,
  description text,
  app_description text,
  input_format text,
  output_format text,
  constraints text,
  examples jsonb,
  difficulty difficulty_t default 'medium',
  acceptance_rate numeric,
  topics jsonb,
  meta jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);






-- Test case 
create table testcases (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid references problems(id) on delete cascade,
  input text,
  expected_output text,
  is_hidden boolean default false
);

alter table testcases enable row level security;

create policy "Public read access"
  on testcases for select using (true);

create policy "No write access"
  on testcases for all using (false) with check (false);





-- Language
create table languages (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  slug text unique
);

alter table languages enable row level security;

create policy "Public read access"
  on languages for select using (true);

create policy "No write access"
  on languages for all using (false) with check (false);


create table problem_languages (
  problem_id uuid references problems(id) on delete cascade,
  language_id uuid references languages(id) on delete cascade,
  primary key (problem_id, language_id)
);

alter table problem_languages enable row level security;

create policy "Public read access"
  on problem_languages for select using (true);

create policy "No write access"
  on problem_languages for all using (false) with check (false);




-- Boilerplates for problems
create table problem_boilerplates (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid references problems(id) on delete cascade,
  language_id uuid references languages(id),
  boilerplate_code text
);

alter table problem_boilerplates enable row level security;

create policy "Public read access"
  on problem_boilerplates for select using (true);

create policy "No write access"
  on problem_boilerplates for all using (false) with check (false);



-- Run and submit 
-- Code Runs (RUN button)
create table code_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  problem_id uuid references problems(id),
  language text,
  code text,
  run_output text,
  created_at timestamptz default now()
);

alter table code_runs enable row level security;

create policy "Users read own"
  on code_runs for select
  using (auth.uid() = user_id);

create policy "Users insert own"
  on code_runs for insert
  with check (auth.uid() = user_id);
-- Submissions (FINAL submit)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  problem_id uuid references problems(id),
  language text,
  code text,
  final_status text,             -- passed / failed
  total_time_ms int,             -- ⭐ time taken
  passed_count int,              -- ⭐ passed testcases
  total_tests int,               -- ⭐ total testcases
  readability_score numeric,     -- ⭐ readability
  maintainability_score numeric, -- ⭐ maintainability
  ai_review_id uuid,             -- ⭐ linked to AI review table
  created_at timestamptz default now()
);

alter table submissions enable row level security;

create policy "Users read own"
  on submissions for select
  using (auth.uid() = user_id);

create policy "Users insert own"
  on submissions for insert
  with check (auth.uid() = user_id);

create policy "Users update own"
  on submissions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);



-- Submission Testcase Results
create table submission_results (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade,
  testcase_id uuid references testcases(id),
  passed boolean,
  actual_output text,
  expected_output text,
  time_ms int
);

alter table submission_results enable row level security;

create policy "Users read own"
  on submission_results for select
  using (
    exists (
      select 1 from submissions s
      where s.id = submission_id and s.user_id = auth.uid()
    )
  );

create policy "Users insert own"
  on submission_results for insert
  with check (
    exists (
      select 1 from submissions s
      where s.id = submission_id and s.user_id = auth.uid()
    )
  );






-- AI review and feedback 
-- AI Code Reviews
create table ai_code_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade,
  strengths jsonb,
  weaknesses jsonb,
  interview_perspective jsonb,
  critical_issues jsonb,
  suggestions text,
  raw_ai_response jsonb,
  created_at timestamptz default now()
);

alter table ai_code_reviews enable row level security;

create policy "Users read own"
  on ai_code_reviews for select
  using (
    exists (
      select 1 from submissions s
      where s.id = submission_id and s.user_id = auth.uid()
    )
  );

create policy "Users insert own"
  on ai_code_reviews for insert
  with check (
    exists (
      select 1 from submissions s
      where s.id = submission_id and s.user_id = auth.uid()
    )
  );
  