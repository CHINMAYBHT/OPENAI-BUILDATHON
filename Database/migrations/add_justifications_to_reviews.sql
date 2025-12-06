-- Add readability and maintainability justifications to ai_code_reviews table
ALTER TABLE ai_code_reviews
ADD COLUMN IF NOT EXISTS readability_justification text,
    ADD COLUMN IF NOT EXISTS maintainability_justification text;
-- Update submissions table to also store the justifications
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS readability_justification text,
    ADD COLUMN IF NOT EXISTS maintainability_justification text;