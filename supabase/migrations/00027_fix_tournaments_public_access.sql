-- Fix tournaments table RLS policy for public access
-- Allow anyone to view all tournaments regardless of authentication

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Anyone can view active tournaments" ON public.tournaments;

-- Create new permissive policy for SELECT
CREATE POLICY "Public can view all tournaments"
ON public.tournaments
FOR SELECT
TO public
USING (true);
