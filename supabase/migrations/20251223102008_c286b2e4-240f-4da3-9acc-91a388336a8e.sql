-- Add explicit deny policy for anonymous SELECT on leads table
-- This follows the defense-in-depth pattern already applied to members and staff tables

CREATE POLICY "Deny public read access to leads"
ON public.leads
FOR SELECT
TO anon
USING (false);