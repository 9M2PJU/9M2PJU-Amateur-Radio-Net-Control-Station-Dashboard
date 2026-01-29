-- MASTER REPAIR SCRIPT FOR 9M2PJU NCS DASHBOARD
-- Run this in the Supabase SQL Editor to fix all permission and deletion issues.

-- 1. Enable RLS (just in case)
ALTER TABLE public.nets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop EXISTING Policies (to ensure clean slate)
DROP POLICY IF EXISTS "Public nets are viewable by everyone" ON public.nets;
DROP POLICY IF EXISTS "Users can insert their own nets" ON public.nets;
DROP POLICY IF EXISTS "Users can update their own nets" ON public.nets;
DROP POLICY IF EXISTS "Users can delete their own nets" ON public.nets;

DROP POLICY IF EXISTS "Checkins viewable by everyone" ON public.checkins;
DROP POLICY IF EXISTS "Users can insert checkins" ON public.checkins;
DROP POLICY IF EXISTS "Users can delete their own checkins" ON public.checkins;
DROP POLICY IF EXISTS "Net owners can delete checkins" ON public.checkins;

-- 3. Re-create NETS Policies
-- Everyone can see nets
CREATE POLICY "Public nets are viewable by everyone" 
ON public.nets FOR SELECT 
USING (true);

-- Authenticated users can create nets
CREATE POLICY "Users can insert their own nets" 
ON public.nets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Net Owners can UPDATE their own nets (End Net button uses this)
CREATE POLICY "Users can update their own nets" 
ON public.nets FOR UPDATE 
USING (auth.uid() = user_id);

-- Net Owners can DELETE their own nets
CREATE POLICY "Users can delete their own nets" 
ON public.nets FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Re-create CHECKINS Policies
-- Everyone can see checkins
CREATE POLICY "Checkins viewable by everyone" 
ON public.checkins FOR SELECT 
USING (true);

-- Anyone can check in (Authenticated)
CREATE POLICY "Users can insert checkins" 
ON public.checkins FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- CRITICAL FIX: Allow Net Owners to delete ANY checkin on THEIR net
CREATE POLICY "Net owners can delete checkins on their net" 
ON public.checkins FOR DELETE 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.nets WHERE id = net_id
  )
);

-- Also allow users to delete their OWN checkins (optional, but good)
-- REMOVED: Checkins table does not have user_id, so we cannot verify 'own' checkins this way.
-- Only Net Control (via net_id) should manage checkins.


-- 5. RE-APPLY Foreign Key Cascase (Just to be triple sure)
ALTER TABLE public.checkins
DROP CONSTRAINT IF EXISTS checkins_net_id_fkey;

ALTER TABLE public.checkins
ADD CONSTRAINT checkins_net_id_fkey
FOREIGN KEY (net_id)
REFERENCES public.nets(id)
ON DELETE CASCADE;

-- 6. Grant Permissions (Standard Supabase setup)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
