create table user_problem_status (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    problem_id uuid references problems(id) on delete cascade,
    status text default 'unsolved',
    -- unsolved, attempted, solved
    solved_at timestamptz,
    last_attempt_at timestamptz,
    times_attempted int default 0,
    starred boolean default false,
    -- user pinned/starred
    saved boolean default false,
    -- saved for later
    liked boolean default false,
    -- "like" or "upvote"
    unique (user_id, problem_id)
);