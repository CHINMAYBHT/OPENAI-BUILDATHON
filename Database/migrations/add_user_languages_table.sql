-- Migration: Add user_languages table
-- This migration creates the user_languages table to track programming languages used by users
-- Run this migration after ensuring the submissions table exists
-- Create the user_languages table
CREATE TABLE IF NOT EXISTS public.user_languages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language text NOT NULL,
    solved_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_languages_user_lang_unique UNIQUE (user_id, language)
);
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON public.user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_language ON public.user_languages(language);
CREATE INDEX IF NOT EXISTS idx_user_languages_solved_count ON public.user_languages(solved_count DESC);
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_languages_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger to automatically update timestamp
DROP TRIGGER IF EXISTS update_user_languages_timestamp ON public.user_languages;
CREATE TRIGGER update_user_languages_timestamp BEFORE
UPDATE ON public.user_languages FOR EACH ROW EXECUTE FUNCTION update_user_languages_timestamp();
-- Optional: Populate initial data from existing submissions
-- Uncomment the following block if you want to sync existing data:
/*
 INSERT INTO public.user_languages (user_id, language, solved_count)
 SELECT 
 user_id,
 language,
 COUNT(*) as solved_count
 FROM public.submissions
 WHERE final_status = 'success'
 GROUP BY user_id, language
 ON CONFLICT (user_id, language) 
 DO UPDATE SET 
 solved_count = EXCLUDED.solved_count,
 updated_at = now();
 */
-- Comments for documentation
COMMENT ON TABLE public.user_languages IS 'Tracks programming languages used by users and their solved problem counts';
COMMENT ON COLUMN public.user_languages.user_id IS 'Reference to the user';
COMMENT ON COLUMN public.user_languages.language IS 'Programming language name (e.g., Python, JavaScript, Java)';
COMMENT ON COLUMN public.user_languages.solved_count IS 'Number of problems successfully solved using this language';
COMMENT ON COLUMN public.user_languages.created_at IS 'When the user first used this language';
COMMENT ON COLUMN public.user_languages.updated_at IS 'Last time the count was updated';