-- Add new columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grid_locator TEXT;

-- Update the handle_new_user function to include new fields
-- This assumes the standard Supabase trigger name 'handle_new_user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, callsign, name, handle, location, grid_locator)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'callsign',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'handle',
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'grid_locator'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
