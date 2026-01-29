-- SECURITY HARDENING MIGRATION
-- Date: 2026-01-29

-- 1. REPEAT LEAST PRIVILEGE PRINCIPLE
-- Revoke all to start from zero
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- Grant specific permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- For PROFILES
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- For NETS
GRANT SELECT ON public.nets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.nets TO authenticated;

-- For CHECKINS
GRANT SELECT ON public.checkins TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.checkins TO authenticated;

-- Grant usage on sequences (required for ID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 2. TIGHTEN RLS FOR CHECKINS
-- Ensure only the owner of the net can add/modify/delete checkins
DROP POLICY IF EXISTS "Users can insert checkins" ON public.checkins;
DROP POLICY IF EXISTS "Net owners can insert checkins" ON public.checkins;
DROP POLICY IF EXISTS "Net owners can update checkins" ON public.checkins;
DROP POLICY IF EXISTS "Net owners can delete checkins" ON public.checkins;
DROP POLICY IF EXISTS "Net owners can delete checkins on their net" ON public.checkins;

-- New INSERT Policy: Only the creator of the Net can add checkins to it
CREATE POLICY "Net owners can insert checkins" 
ON public.checkins FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.nets
    WHERE nets.id = checkins.net_id
    AND nets.user_id = auth.uid()
  )
);

-- New UPDATE Policy: Only the creator of the Net can update checkins
CREATE POLICY "Net owners can update checkins" 
ON public.checkins FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.nets
    WHERE nets.id = checkins.net_id
    AND nets.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.nets
    WHERE nets.id = checkins.net_id
    AND nets.user_id = auth.uid()
  )
);

-- New DELETE Policy: Only the creator of the Net can delete checkins
CREATE POLICY "Net owners can delete checkins" 
ON public.checkins FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.nets
    WHERE nets.id = checkins.net_id
    AND nets.user_id = auth.uid()
  )
);
