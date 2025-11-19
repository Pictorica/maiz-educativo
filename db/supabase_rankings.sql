-- ============================================
-- Supabase Migration: Rankings Table
-- Project: Maiz Educativo (CEIP RÍA DE VIGO)
-- ============================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create rankings table
CREATE TABLE IF NOT EXISTS public.rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster score queries
CREATE INDEX IF NOT EXISTS idx_rankings_score_desc ON public.rankings (score DESC, created_at ASC);

-- Add comment to table
COMMENT ON TABLE public.rankings IS 'Quiz rankings for Maiz Educativo project';

-- ============================================
-- Row Level Security (RLS) Configuration
-- ============================================
-- IMPORTANT: Enable RLS to protect your data
-- Only enable if you want to restrict access

-- Enable RLS on the table
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Example RLS Policies (commented out by default)
-- ============================================
-- Uncomment and customize these policies based on your security needs

-- Policy 1: Allow public read access (anyone can view rankings)
CREATE POLICY "Allow public read access"
  ON public.rankings
  FOR SELECT
  USING (true);

-- Policy 2: Allow public insert (anyone can submit scores)
-- SECURITY NOTE: Consider adding rate limiting or validation in your application
-- to prevent spam or abuse
CREATE POLICY "Allow public insert"
  ON public.rankings
  FOR INSERT
  WITH CHECK (true);

-- Policy 3: Example - Only allow inserts with valid names (optional)
-- CREATE POLICY "Require valid name for insert"
--   ON public.rankings
--   FOR INSERT
--   WITH CHECK (
--     name IS NOT NULL 
--     AND LENGTH(TRIM(name)) >= 2 
--     AND LENGTH(TRIM(name)) <= 50
--   );

-- Policy 4: Example - Prevent updates and deletes (optional)
-- CREATE POLICY "Prevent updates"
--   ON public.rankings
--   FOR UPDATE
--   USING (false);
-- 
-- CREATE POLICY "Prevent deletes"
--   ON public.rankings
--   FOR DELETE
--   USING (false);

-- ============================================
-- Additional Security Recommendations
-- ============================================
-- 1. In production, consider creating a server-side function that validates
--    scores before inserting to prevent cheating
-- 2. Implement rate limiting to prevent spam
-- 3. Use the ANON key for client-side access (not the SERVICE_ROLE key)
-- 4. Monitor your database for unusual activity
-- 5. Set up database backups regularly

-- ============================================
-- Testing Queries
-- ============================================
-- After running this migration, test with these queries:

-- Test insert:
-- INSERT INTO public.rankings (name, score, meta) 
-- VALUES ('Test User', 10, '{"total": 10, "mode": "Básico"}'::jsonb);

-- Test select top 10:
-- SELECT * FROM public.rankings 
-- ORDER BY score DESC, created_at ASC 
-- LIMIT 10;

-- Check table exists:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'rankings';
