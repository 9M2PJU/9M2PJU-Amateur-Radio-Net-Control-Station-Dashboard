-- Run this query to update your existing database without errors.
-- It only adds the new columns if they are missing.

ALTER TABLE checkins ADD COLUMN IF NOT EXISTS readability INTEGER;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS signal_strength INTEGER;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS traffic_precedence TEXT CHECK (traffic_precedence IN ('routine', 'welfare', 'priority', 'emergency'));
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS traffic_details TEXT;
