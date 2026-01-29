-- Add new columns to 'checkins' table if they don't exist
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS traffic BOOLEAN DEFAULT false;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS traffic_precedence TEXT;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS traffic_details TEXT;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS grid_locator TEXT;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS readability INTEGER;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS signal_strength INTEGER;

-- Add new columns to 'nets' table if they don't exist
ALTER TABLE public.nets ADD COLUMN IF NOT EXISTS frequency TEXT;
ALTER TABLE public.nets ADD COLUMN IF NOT EXISTS mode TEXT;
ALTER TABLE public.nets ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verify the columns (Optional, for debugging)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'checkins';
