-- Add explicit deny policy for anonymous/public access to members table
-- This ensures that even if authentication is bypassed, public access is explicitly denied

CREATE POLICY "Deny public access to members"
ON public.members
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Also add deny policy for staff table for the same protection
CREATE POLICY "Deny public access to staff"
ON public.staff
FOR ALL
TO anon
USING (false)
WITH CHECK (false);