-- User Streaks Table
-- Tracks daily solving streaks for each user
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_solved_at date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_last_solved ON public.user_streaks(last_solved_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_longest ON public.user_streaks(longest_streak DESC);
-- Comments
COMMENT ON TABLE public.user_streaks IS 'Tracks daily solving streaks for users';
COMMENT ON COLUMN public.user_streaks.user_id IS 'Reference to the user (primary key)';
COMMENT ON COLUMN public.user_streaks.current_streak IS 'Current consecutive days streak';
COMMENT ON COLUMN public.user_streaks.longest_streak IS 'Longest streak ever achieved';
COMMENT ON COLUMN public.user_streaks.last_solved_at IS 'Date when user last solved a problem';
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_streaks_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger to automatically update timestamp
DROP TRIGGER IF EXISTS update_user_streaks_timestamp ON public.user_streaks;
CREATE TRIGGER update_user_streaks_timestamp BEFORE
UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION update_user_streaks_timestamp();