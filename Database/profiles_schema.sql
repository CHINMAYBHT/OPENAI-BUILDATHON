create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp default now()
);

alter table profiles enable row level security;

create policy "User can insert own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can select own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);
