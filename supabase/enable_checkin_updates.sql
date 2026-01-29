-- ENABLE CHECKIN UPDATES
-- This script adds the missing policy to allow Net Control Stations to EDIT check-ins.

-- Drop existing update policy if any (unlikely, but safe)
DROP POLICY IF EXISTS "Net owners can update checkins on their net" ON public.checkins;

-- Allow Net Owners to UPDATE any checkin on THEIR net
CREATE POLICY "Net owners can update checkins on their net" 
ON public.checkins FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.nets WHERE id = net_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.nets WHERE id = net_id
  )
);
