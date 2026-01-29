-- This migration ensures all existing profiles have the new fields
-- Run this if you have existing users who registered before the new fields were added

-- The columns were already added by update_profile_fields.sql
-- This just ensures no NULL constraint issues

-- Optional: Set default empty strings for existing NULL values if needed
-- UPDATE public.profiles 
-- SET 
--     handle = COALESCE(handle, ''),
--     location = COALESCE(location, ''),
--     grid_locator = COALESCE(grid_locator, '')
-- WHERE handle IS NULL OR location IS NULL OR grid_locator IS NULL;

-- Verify the update
SELECT id, callsign, name, handle, location, grid_locator 
FROM public.profiles 
LIMIT 10;
