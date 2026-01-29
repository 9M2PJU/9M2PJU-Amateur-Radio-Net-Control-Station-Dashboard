-- ⚠️ DANGER: THIS WILL DELETE ALL DATA ⚠️
-- Run this in the Supabase SQL Editor to wipe your database clean.

-- OPTION 1: Fast Truncate (restarts sequences, deletes everything)
-- The CASCADE will ensure that if we truncate nets, linked checkins might also be handled,
-- but explicitly listing both is handling foreign keys safely in a truncate.
TRUNCATE TABLE public.checkins, public.nets CASCADE;

-- OPTION 2: Standard Delete (if you want to trigger ON DELETE triggers)
-- DELETE FROM public.checkins;
-- DELETE FROM public.nets;

-- NOTE: Profiles (users) are NOT deleted by this script. 
-- Only the operational data (Logs and Check-ins) will be removed.
