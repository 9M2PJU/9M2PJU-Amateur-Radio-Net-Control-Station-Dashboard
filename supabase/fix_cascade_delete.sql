-- Fix Foreign Key Constraint for Cascading Deletes
-- This ensures that when a NET is deleted, all its CHECKINS are automatically deleted by the database.

-- First, drop the existing constraint (name might vary, Supabase usually names it checkins_net_id_fkey)
ALTER TABLE public.checkins
DROP CONSTRAINT IF EXISTS checkins_net_id_fkey;

-- Re-add the constraint with ON DELETE CASCADE
ALTER TABLE public.checkins
ADD CONSTRAINT checkins_net_id_fkey
FOREIGN KEY (net_id)
REFERENCES public.nets(id)
ON DELETE CASCADE;

-- verify
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    rc.delete_rule 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'checkins' AND kcu.column_name = 'net_id';
