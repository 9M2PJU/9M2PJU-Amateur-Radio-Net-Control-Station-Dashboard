-- Amateur Radio Net Control Station Dashboard
-- Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- PROFILES TABLE
-- ==============================================
-- Extends Supabase auth.users with amateur radio specific fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  callsign TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (for callsign lookup)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ==============================================
-- NETS TABLE
-- ==============================================
-- Stores net session information
CREATE TABLE IF NOT EXISTS nets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'emergency_exercise', 'special')),
  frequency TEXT,
  mode TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS nets_user_id_idx ON nets(user_id);
CREATE INDEX IF NOT EXISTS nets_started_at_idx ON nets(started_at DESC);

-- Enable RLS
ALTER TABLE nets ENABLE ROW LEVEL SECURITY;

-- Users can view their own nets
CREATE POLICY "Users can view their own nets"
  ON nets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own nets
CREATE POLICY "Users can create their own nets"
  ON nets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own nets
CREATE POLICY "Users can update their own nets"
  ON nets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own nets
CREATE POLICY "Users can delete their own nets"
  ON nets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================
-- CHECKINS TABLE
-- ==============================================
-- Stores individual check-in records for each net
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  net_id UUID REFERENCES nets(id) ON DELETE CASCADE NOT NULL,
  callsign TEXT NOT NULL,
  name TEXT,
  location TEXT,
  signal_report TEXT,
  readability INTEGER,
  signal_strength INTEGER,
  remarks TEXT,
  traffic BOOLEAN DEFAULT FALSE NOT NULL,
  traffic_precedence TEXT CHECK (traffic_precedence IN ('routine', 'welfare', 'priority', 'emergency')),
  traffic_details TEXT,
  grid_locator TEXT,
  checked_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS checkins_net_id_idx ON checkins(net_id);
CREATE INDEX IF NOT EXISTS checkins_callsign_idx ON checkins(callsign);
CREATE INDEX IF NOT EXISTS checkins_checked_in_at_idx ON checkins(checked_in_at DESC);

-- Enable RLS
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Users can view checkins for their nets
CREATE POLICY "Users can view checkins for their nets"
  ON checkins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM nets 
      WHERE nets.id = checkins.net_id 
      AND nets.user_id = auth.uid()
    )
  );

-- Users can create checkins for their nets
CREATE POLICY "Users can create checkins for their nets"
  ON checkins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nets 
      WHERE nets.id = checkins.net_id 
      AND nets.user_id = auth.uid()
    )
  );

-- Users can delete checkins from their nets
CREATE POLICY "Users can delete checkins from their nets"
  ON checkins FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM nets 
      WHERE nets.id = checkins.net_id 
      AND nets.user_id = auth.uid()
    )
  );

-- ==============================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================
-- Enable realtime for checkins table
ALTER PUBLICATION supabase_realtime ADD TABLE checkins;

-- ==============================================
-- TRIGGER: Auto-create profile on signup
-- ==============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, callsign, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'callsign', 'UNKNOWN'),
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
