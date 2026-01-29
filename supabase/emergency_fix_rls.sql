-- EMERGENCY FIX: Restore ALL public viewing policies
-- Run this in Supabase SQL Editor NOW

-- This ensures nets and checkins are viewable by all authenticated users
-- The previous optimization might have been too restrictive

BEGIN;

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Public nets are viewable by everyone" ON public.nets;
DROP POLICY IF EXISTS "Users can view their own nets" ON public.nets;
DROP POLICY IF EXISTS "Checkins viewable by everyone" ON public.checkins;
DROP POLICY IF EXISTS "Users can view checkins for their nets" ON public.checkins;

-- Recreate with simple, permissive SELECT policies
-- These use optimized auth.uid() but are very permissive

CREATE POLICY "Public nets are viewable by everyone"
ON public.nets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Checkins viewable by everyone"
ON public.checkins FOR SELECT
TO authenticated
USING (true);

-- Verify policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('nets', 'checkins')
AND cmd = 'SELECT'
ORDER BY tablename, policyname;

COMMIT;
