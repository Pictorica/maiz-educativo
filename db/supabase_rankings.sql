-- =============================================
-- Supabase Rankings Table Migration
-- For maiz-educativo project
-- =============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create rankings table
CREATE TABLE IF NOT EXISTS public.rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rankings_score ON public.rankings(score DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_created_at ON public.rankings(created_at);

-- Add comment to table
COMMENT ON TABLE public.rankings IS 'Quiz rankings for maiz-educativo project';
COMMENT ON COLUMN public.rankings.name IS 'Player name';
COMMENT ON COLUMN public.rankings.score IS 'Number of correct answers';
COMMENT ON COLUMN public.rankings.meta IS 'Additional metadata: mode, total questions, percentage, etc.';

-- =============================================
-- Row Level Security (RLS) Configuration
-- =============================================
-- IMPORTANT: Enable RLS to secure your data
-- Uncomment the following lines after testing

-- ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Example RLS Policies (commented out - customize as needed)
-- 
-- Policy: Allow anyone to read rankings (public leaderboard)
-- CREATE POLICY "Allow public read access"
--   ON public.rankings
--   FOR SELECT
--   USING (true);
--
-- Policy: Allow authenticated users to insert their own scores
-- CREATE POLICY "Allow authenticated insert"
--   ON public.rankings
--   FOR INSERT
--   WITH CHECK (true);
--
-- Note: For production, you might want to add server-side validation
-- using Edge Functions or restrict inserts to authenticated users only.
-- Consider rate limiting to prevent abuse.
--
-- Alternative: Use a Supabase Edge Function with service_role key
-- to validate and insert scores from the backend for better security.

-- =============================================
-- Security Recommendations
-- =============================================
-- 1. Enable RLS (uncomment above)
-- 2. Use ANON key only for SELECT queries in frontend
-- 3. For INSERT operations, consider:
--    - Using Supabase Edge Functions with service_role key
--    - Adding rate limiting
--    - Validating score values server-side
--    - Implementing CAPTCHA for quiz completion
-- 4. Monitor usage and set up alerts for suspicious activity
