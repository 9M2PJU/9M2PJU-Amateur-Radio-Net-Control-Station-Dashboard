-- Optimizing performance for Free Tier (and general speed)
-- Run this in Supabase SQL Editor

-- 1. Index Foreign Keys
-- This makes joining tables much faster and cheaper on CPU
CREATE INDEX IF NOT EXISTS idx_nets_user_id ON public.nets(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_net_id ON public.checkins(net_id);

-- 2. Index Common Filters
-- We filter checkins by callsign often for stats
CREATE INDEX IF NOT EXISTS idx_checkins_callsign ON public.checkins(callsign);
-- We query nets by creation date often
CREATE INDEX IF NOT EXISTS idx_nets_created_at ON public.nets(created_at);
-- We query checkins by time often
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON public.checkins(checked_in_at);

-- 3. Comments
COMMENT ON INDEX idx_nets_user_id IS 'Speeds up dashboard loading of nets';
COMMENT ON INDEX idx_checkins_net_id IS 'Speeds up net detail loading';
