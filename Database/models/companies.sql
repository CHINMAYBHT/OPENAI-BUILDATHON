create table companies (
  id uuid primary key default gen_random_uuid(),

  name text not null,                   -- Google
  type text,                            -- FAANG, Startup, Product Based
  description text,                     -- Company highlight

  total_questions int default 0,        -- 162

  difficulty jsonb default jsonb_build_object(
    'easy', 0,
    'medium', 0,
    'hard', 0
  ),

  popular_topics jsonb,                 -- ["Graphs", "DP", "Math"]

  created_at timestamptz default now()
);

alter table companies enable row level security;

create policy "Public read companies"
  on companies for select using (true);

create policy "No write companies"
  on companies for all using (false) with check (false);


create table company_problems (
  id uuid primary key default gen_random_uuid(),

  company_id uuid references companies(id) on delete cascade,
  problem_id uuid references problems(id) on delete cascade,

  frequency int default 1,              -- how commonly asked (1–5 scale)
  added_at timestamptz default now(),

  unique (company_id, problem_id)
);

alter table company_problems enable row level security;

create policy "Public read company problems"
  on company_problems for select using (true);

create policy "No write company problems"
  on company_problems for all using (false) with check (false);


create table user_company_progress (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,

  -- total solved by the user for this company
  solved_total int default 0,

  -- solved by difficulty
  solved_easy int default 0,
  solved_medium int default 0,
  solved_hard int default 0,

  -- totals FROM company stats (cached)
  total_easy int default 0,
  total_medium int default 0,
  total_hard int default 0,
  total_questions int default 0,

  last_updated timestamptz default now(),

  unique (user_id, company_id)
);

alter table user_company_progress enable row level security;

create policy "Users read progress"
  on user_company_progress for select
  using (auth.uid() = user_id);

create policy "Users update progress"
  on user_company_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users insert progress"
  on user_company_progress for insert
  with check (auth.uid() = user_id);
