-- Performance Optimization Migration
-- Fixes all Supabase performance warnings
-- Date: 2026-01-29

-- ============================================================================
-- PART 1: Drop Duplicate Indexes
-- ============================================================================

-- Drop duplicate indexes on checkins table
DROP INDEX IF EXISTS checkins_callsign_idx;  -- Keep idx_checkins_callsign
DROP INDEX IF EXISTS checkins_net_id_idx;    -- Keep idx_checkins_net_id

-- Drop duplicate index on nets table
DROP INDEX IF EXISTS idx_nets_user_id;       -- Keep nets_user_id_idx

-- ============================================================================
-- PART 2: Drop Unused Indexes
-- ============================================================================

-- Drop unused indexes on checkins
DROP INDEX IF EXISTS idx_checkins_callsign;
DROP INDEX IF EXISTS idx_checkins_checked_in_at;
DROP INDEX IF EXISTS checkins_checked_in_at_idx;
DROP INDEX IF EXISTS idx_checkins_net_id;

-- Drop unused indexes on nets
DROP INDEX IF EXISTS nets_started_at_idx;
DROP INDEX IF EXISTS idx_nets_created_at;
DROP INDEX IF EXISTS nets_user_id_idx;

-- ============================================================================
-- PART 3: Optimize RLS Policies - Profiles Table
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================================
-- PART 4: Optimize RLS Policies - Nets Table
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own nets" ON nets;
DROP POLICY IF EXISTS "Users can create their own nets" ON nets;
DROP POLICY IF EXISTS "Users can insert their own nets" ON nets;
DROP POLICY IF EXISTS "Users can update their own nets" ON nets;
DROP POLICY IF EXISTS "Users can delete their own nets" ON nets;
DROP POLICY IF EXISTS "Public nets are viewable by everyone" ON nets;

-- Recreate with optimized auth function calls
-- Keep public viewing for all nets
CREATE POLICY "Public nets are viewable by everyone"
ON nets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own nets"
ON nets FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own nets"
ON nets FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own nets"
ON nets FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 5: Optimize RLS Policies - Checkins Table
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view checkins for their nets" ON checkins;
DROP POLICY IF EXISTS "Users can create checkins for their nets" ON checkins;
DROP POLICY IF EXISTS "Users can insert checkins" ON checkins;
DROP POLICY IF EXISTS "Users can delete checkins from their nets" ON checkins;
DROP POLICY IF EXISTS "Net owners can delete checkins on their net" ON checkins;
DROP POLICY IF EXISTS "Net owners can update checkins on their net" ON checkins;
DROP POLICY IF EXISTS "Checkins viewable by everyone" ON checkins;

-- Recreate with optimized auth function calls and consolidated policies
-- Keep public viewing for all checkins
CREATE POLICY "Checkins viewable by everyone"
ON checkins FOR SELECT
TO authenticated
USING (true);

-- Consolidated INSERT policy - anyone authenticated can insert checkins
CREATE POLICY "Users can insert checkins"
ON checkins FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM nets
    WHERE nets.id = checkins.net_id
    AND nets.user_id = (SELECT auth.uid())
  )
);

-- Consolidated UPDATE policy - only net owners
CREATE POLICY "Net owners can update checkins"
ON checkins FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM nets
    WHERE nets.id = checkins.net_id
    AND nets.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM nets
    WHERE nets.id = checkins.net_id
    AND nets.user_id = (SELECT auth.uid())
  )
);

-- Consolidated DELETE policy - only net owners
CREATE POLICY "Net owners can delete checkins"
ON checkins FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM nets
    WHERE nets.id = checkins.net_id
    AND nets.user_id = (SELECT auth.uid())
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify policies are optimized
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'nets', 'checkins')
ORDER BY tablename, policyname;

-- Verify indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'nets', 'checkins')
ORDER BY tablename, indexname;
