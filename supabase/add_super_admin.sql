-- Super Admin System Migration
-- Adds super admin capability to the application
-- Date: 2026-01-29

-- ============================================================================
-- PART 1: Add Super Admin Column
-- ============================================================================

-- Add is_super_admin flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- PART 2: Set Super Admin User
-- ============================================================================

-- Set 9m2pju@gmail.com as super admin
UPDATE public.profiles 
SET is_super_admin = TRUE 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = '9m2pju@gmail.com'
);

-- ============================================================================
-- PART 3: Create Performance Index
-- ============================================================================

-- Index for fast super admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_super_admin 
ON public.profiles(is_super_admin) 
WHERE is_super_admin = TRUE;

-- ============================================================================
-- PART 4: Update RLS Policies - Add Super Admin Bypass
-- ============================================================================

-- Helper function to check if current user is super admin
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

-- Update nets SELECT policy to allow super admin
DROP POLICY IF EXISTS "Public nets are viewable by everyone" ON public.nets;
DROP POLICY IF EXISTS "Super admin can view all nets" ON public.nets;

CREATE POLICY "Public nets are viewable by everyone"
ON public.nets FOR SELECT
TO authenticated
USING (true OR public.is_super_admin());

-- Update checkins SELECT policy to allow super admin
DROP POLICY IF EXISTS "Checkins viewable by everyone" ON public.checkins;
DROP POLICY IF EXISTS "Super admin can view all checkins" ON public.checkins;

CREATE POLICY "Checkins viewable by everyone"
ON public.checkins FOR SELECT
TO authenticated
USING (true OR public.is_super_admin());

-- Update profiles SELECT policy to allow super admin
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true OR public.is_super_admin());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check super admin status
SELECT 
  p.id,
  u.email,
  p.callsign,
  p.is_super_admin
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.is_super_admin = TRUE;

-- Verify function works
SELECT public.is_super_admin() as current_user_is_super_admin;
