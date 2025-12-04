-- User problem status 
create table user_problem_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  problem_id uuid references problems(id),
  status text default 'unsolved',
  starred boolean default false,
  saved boolean default false,
  liked boolean default false
);

alter table user_problem_status enable row level security;

create policy "Users read own"
  on user_problem_status for select
  using (auth.uid() = user_id);

create policy "Users insert own"
  on user_problem_status for insert
  with check (auth.uid() = user_id);

create policy "Users update own"
  on user_problem_status for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
