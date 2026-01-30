-- ==========================================
-- MASTER DATABASE MIGRATION (FINAL)
-- Project: 9M2PJU NCS Dashboard
-- Date: 2026-01-29
-- ==========================================

-- 1. SCHEMA UPDATES
--------------------------------------------
-- Add slug column to nets for pretty URLs
ALTER TABLE nets ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_nets_slug ON nets(slug);

-- Add is_super_admin to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_profiles_super_admin ON public.profiles(is_super_admin) WHERE is_super_admin = TRUE;

-- 2. HELPER FUNCTIONS
--------------------------------------------
-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PERMISSIONS & LEAST PRIVILEGE
--------------------------------------------
-- Revoke all to start from clean state
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- Grant minimal necessary usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Profiles: Shared view, private mutations
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- Nets: Shared view, private mutations
GRANT SELECT ON public.nets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.nets TO authenticated;

-- Checkins: Shared view, owner-only mutations
GRANT SELECT ON public.checkins TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.checkins TO authenticated;

-- 4. ROW LEVEL SECURITY (RLS)
--------------------------------------------
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- 4.1 Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true OR public.is_super_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4.2 Nets Policies
DROP POLICY IF EXISTS "Public nets are viewable by everyone" ON public.nets;
CREATE POLICY "Public nets are viewable by everyone"
ON public.nets FOR SELECT
TO authenticated
USING (true OR public.is_super_admin());

DROP POLICY IF EXISTS "Users can create nets" ON public.nets;
CREATE POLICY "Users can create nets"
ON public.nets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Net owners can update their nets" ON public.nets;
CREATE POLICY "Net owners can update their nets"
ON public.nets FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_super_admin())
WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "Net owners can delete their nets" ON public.nets;
CREATE POLICY "Net owners can delete their nets"
ON public.nets FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_super_admin());

-- 4.3 Checkins Policies
DROP POLICY IF EXISTS "Checkins viewable by everyone" ON public.checkins;
CREATE POLICY "Checkins viewable by everyone"
ON public.checkins FOR SELECT
TO authenticated
USING (true OR public.is_super_admin());

DROP POLICY IF EXISTS "Net owners can insert checkins" ON public.checkins;
CREATE POLICY "Net owners can insert checkins" 
ON public.checkins FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.nets
    WHERE nets.id = checkins.net_id
    AND (nets.user_id = auth.uid() OR public.is_super_admin())
  )
);

DROP POLICY IF EXISTS "Net owners can update checkins" ON public.checkins;
CREATE POLICY "Net owners can update checkins" 
ON public.checkins FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.nets
    WHERE nets.id = checkins.net_id
    AND (nets.user_id = auth.uid() OR public.is_super_admin())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.nets
    WHERE nets.id = checkins.net_id
    AND (nets.user_id = auth.uid() OR public.is_super_admin())
  )
);

DROP POLICY IF EXISTS "Net owners can delete checkins" ON public.checkins;
CREATE POLICY "Net owners can delete checkins" 
ON public.checkins FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.nets
    WHERE nets.id = checkins.net_id
    AND (nets.user_id = auth.uid() OR public.is_super_admin())
  )
);

-- 5. INITIAL DATA
--------------------------------------------
-- Set your email as Super Admin (REPLACE WITH YOUR EMAIL IF NEEDED)
UPDATE public.profiles 
SET is_super_admin = TRUE 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = '9m2pju@gmail.com'
);

-- Backfill slugs for existing nets
UPDATE nets 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^\w\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  ) || '-' || TO_CHAR(created_at, 'YYYY-MM-DD')
)
WHERE slug IS NULL;

-- 6. DONATION POPUP CONTROL
--------------------------------------------
-- Add hide_donation_popup column (default false)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hide_donation_popup BOOLEAN DEFAULT FALSE;

-- Allow Super Admins to update ANY profile (to toggle donation popup)
DROP POLICY IF EXISTS "Super Admins can update any profile" ON public.profiles;
CREATE POLICY "Super Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());
