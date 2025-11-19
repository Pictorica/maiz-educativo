-- =====================================================
-- Supabase Rankings Table Migration
-- Project: Maiz Educativo (CEIP RÍA DE VIGO)
-- =====================================================
-- 
-- This SQL script creates the rankings table for storing
-- quiz scores from the educational corn website.
-- 
-- To execute:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" or press Cmd/Ctrl + Enter
-- =====================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create rankings table
CREATE TABLE IF NOT EXISTS public.rankings (
  -- Primary key: UUID auto-generated
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Player name (required)
  name TEXT NOT NULL,
  
  -- Score achieved (required, must be >= 0)
  score INTEGER NOT NULL CHECK (score >= 0),
  
  -- Additional metadata as JSON
  -- Example: {"mode": "basico", "total": 10, "percentage": 80}
  meta JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp of when the score was created
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index on score for faster ranking queries
CREATE INDEX IF NOT EXISTS idx_rankings_score ON public.rankings(score DESC);

-- Create index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_rankings_created_at ON public.rankings(created_at DESC);

-- =====================================================
-- Row Level Security (RLS) Configuration
-- =====================================================
--
-- IMPORTANT: RLS should be enabled for production security
-- 
-- For this educational project, we recommend:
-- 1. Enable RLS on the rankings table
-- 2. Create policies that allow:
--    - Anyone can INSERT (save scores)
--    - Anyone can SELECT (read rankings)
--    - No one can UPDATE or DELETE (preserve integrity)
--
-- Uncomment the following section to enable RLS:

-- Enable RLS on the table
-- ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert scores (anon key usage)
-- CREATE POLICY "Anyone can insert rankings" ON public.rankings
--   FOR INSERT
--   TO anon
--   WITH CHECK (true);

-- Policy: Allow anyone to read rankings (anon key usage)
-- CREATE POLICY "Anyone can read rankings" ON public.rankings
--   FOR SELECT
--   TO anon
--   USING (true);

-- Policy: Prevent updates to preserve score integrity
-- CREATE POLICY "No one can update rankings" ON public.rankings
--   FOR UPDATE
--   TO anon
--   USING (false);

-- Policy: Prevent deletes to preserve score history
-- CREATE POLICY "No one can delete rankings" ON public.rankings
--   FOR DELETE
--   TO anon
--   USING (false);

-- =====================================================
-- Alternative: Authenticated Users Only
-- =====================================================
--
-- If you want to require authentication, replace 'anon' with 'authenticated'
-- and users must be logged in to interact with rankings.
-- This is more secure but requires implementing Supabase Auth.
--
-- Example for authenticated users:
--
-- CREATE POLICY "Authenticated users can insert rankings" ON public.rankings
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- =====================================================
-- Test Data (Optional - for development)
-- =====================================================
--
-- Uncomment to insert sample data for testing:

-- INSERT INTO public.rankings (name, score, meta) VALUES
--   ('Josefina', 10, '{"mode": "basico", "total": 10, "percentage": 100}'::jsonb),
--   ('Andrea', 9, '{"mode": "basico", "total": 10, "percentage": 90}'::jsonb),
--   ('Ada', 8, '{"mode": "experto", "total": 15, "percentage": 53}'::jsonb);

-- =====================================================
-- Verify Installation
-- =====================================================
--
-- Run this query to verify the table was created successfully:
--
-- SELECT * FROM public.rankings ORDER BY score DESC LIMIT 10;

-- =====================================================
-- Notes
-- =====================================================
--
-- 1. Security: The ANON key used in the frontend should ONLY have
--    permissions defined by RLS policies. Never use SERVICE_ROLE key
--    in frontend code.
--
-- 2. Data Retention: Consider adding a policy or cron job to clean up
--    old entries periodically if storage becomes an issue.
--
-- 3. Rate Limiting: Consider implementing rate limiting on the frontend
--    to prevent abuse of the INSERT endpoint.
--
-- 4. Validation: The frontend should validate inputs before sending,
--    but database constraints (like CHECK score >= 0) provide additional
--    protection.
-- =====================================================
