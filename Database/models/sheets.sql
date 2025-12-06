
create table sheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table sheets enable row level security;

-- A user can see only their own sheets
create policy "Users can read own sheets"
  on sheets for select
  using (auth.uid() = user_id);

-- A user can insert their sheets
create policy "Users can insert sheets"
  on sheets for insert
  with check (auth.uid() = user_id);

-- A user can update their sheets
create policy "Users can update own sheets"
  on sheets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- A user can delete their sheets
create policy "Users can delete own sheets"
  on sheets for delete
  using (auth.uid() = user_id);

alter table user_sheet_progress enable row level security;

-- User reads their own sheet progress
create policy "Users read sheet progress"
  on user_sheet_progress for select
  using (auth.uid() = user_id);

-- User updates their own sheet progress
create policy "Users update sheet progress"
  on user_sheet_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User inserts new sheet progress
create policy "Users create sheet progress"
  on user_sheet_progress for insert
  with check (auth.uid() = user_id);

create table sheet_problems (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid references sheets(id) on delete cascade,
  problem_id uuid references problems(id) on delete cascade,
  order_index int default 0,
  added_at timestamptz default now()
);

alter table sheet_problems enable row level security;

-- Users can read problems in their sheets
create policy "Users read sheet problems"
  on sheet_problems for select
  using (
    sheet_id in (select id from sheets where user_id = auth.uid())
  );

-- Users can insert problems into their own sheet
create policy "Users insert sheet problems"
  on sheet_problems for insert
  with check (
    sheet_id in (select id from sheets where user_id = auth.uid())
  );

-- Users can delete problems from their sheet
create policy "Users delete sheet problems"
  on sheet_problems for delete
  using (
    sheet_id in (select id from sheets where user_id = auth.uid())
  );


create table user_sheet_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  sheet_id uuid references sheets(id) on delete cascade,
  solved_count int default 0,
  total_count int default 0,
  last_updated timestamptz default now()
);

alter table user_sheet_progress enable row level security;

-- User reads their own sheet progress
create policy "Users read sheet progress"
  on user_sheet_progress for select
  using (auth.uid() = user_id);

-- User updates their own sheet progress
create policy "Users update sheet progress"
  on user_sheet_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User inserts new sheet progress
create policy "Users create sheet progress"
  on user_sheet_progress for insert
  with check (auth.uid() = user_id);
