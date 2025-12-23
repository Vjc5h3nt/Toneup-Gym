-- Add update and delete policies for lead_follow_ups
CREATE POLICY "Staff/admin can update follow-ups" 
ON public.lead_follow_ups 
FOR UPDATE 
USING (is_staff_or_admin());

CREATE POLICY "Staff/admin can delete follow-ups" 
ON public.lead_follow_ups 
FOR DELETE 
USING (is_staff_or_admin());