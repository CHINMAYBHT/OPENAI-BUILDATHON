-- User Company Progress Table
-- Tracks user's progress for each company (solved counts by difficulty)
-- This table caches the aggregated progress to avoid heavy computations
CREATE TABLE IF NOT EXISTS public.user_company_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    company_id uuid NULL,
    solved_total integer NULL DEFAULT 0,
    solved_easy integer NULL DEFAULT 0,
    solved_medium integer NULL DEFAULT 0,
    solved_hard integer NULL DEFAULT 0,
    total_easy integer NULL DEFAULT 0,
    total_medium integer NULL DEFAULT 0,
    total_hard integer NULL DEFAULT 0,
    total_questions integer NULL DEFAULT 0,
    last_updated timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT user_company_progress_pkey PRIMARY KEY (id),
    CONSTRAINT user_company_progress_user_id_company_id_key UNIQUE (user_id, company_id),
    CONSTRAINT user_company_progress_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT user_company_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_company_progress_user_id ON public.user_company_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_progress_company_id ON public.user_company_progress(company_id);
CREATE INDEX IF NOT EXISTS idx_user_company_progress_last_updated ON public.user_company_progress(last_updated);
-- Comments
COMMENT ON TABLE public.user_company_progress IS 'Stores cached progress statistics for each user per company';
COMMENT ON COLUMN public.user_company_progress.solved_total IS 'Total number of problems solved for this company';
COMMENT ON COLUMN public.user_company_progress.solved_easy IS 'Number of easy problems solved';
COMMENT ON COLUMN public.user_company_progress.solved_medium IS 'Number of medium problems solved';
COMMENT ON COLUMN public.user_company_progress.solved_hard IS 'Number of hard problems solved';
COMMENT ON COLUMN public.user_company_progress.total_easy IS 'Total easy problems available for this company';
COMMENT ON COLUMN public.user_company_progress.total_medium IS 'Total medium problems available for this company';
COMMENT ON COLUMN public.user_company_progress.total_hard IS 'Total hard problems available for this company';
COMMENT ON COLUMN public.user_company_progress.last_updated IS 'Timestamp of last sync/update';