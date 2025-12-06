-- User Languages Table
-- Tracks programming languages used by each user and count of solved problems per language
-- This table is automatically updated when submissions are saved
CREATE TABLE IF NOT EXISTS public.user_languages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language text NOT NULL,
    solved_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_languages_user_lang_unique UNIQUE (user_id, language)
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON public.user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_language ON public.user_languages(language);
CREATE INDEX IF NOT EXISTS idx_user_languages_solved_count ON public.user_languages(solved_count DESC);
-- Comments
COMMENT ON TABLE public.user_languages IS 'Tracks programming languages used by users and their solved problem counts';
COMMENT ON COLUMN public.user_languages.user_id IS 'Reference to the user';
COMMENT ON COLUMN public.user_languages.language IS 'Programming language name (e.g., Python, JavaScript, Java)';
COMMENT ON COLUMN public.user_languages.solved_count IS 'Number of problems successfully solved using this language';
COMMENT ON COLUMN public.user_languages.created_at IS 'When the user first used this language';
COMMENT ON COLUMN public.user_languages.updated_at IS 'Last time the count was updated';
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_languages_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger to automatically update timestamp
CREATE TRIGGER update_user_languages_timestamp BEFORE
UPDATE ON public.user_languages FOR EACH ROW EXECUTE FUNCTION update_user_languages_timestamp();