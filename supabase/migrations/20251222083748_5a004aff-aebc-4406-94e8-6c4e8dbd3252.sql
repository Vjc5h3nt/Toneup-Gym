-- Allow public enquiry submissions to leads table
CREATE POLICY "Public can submit enquiries" 
ON public.leads 
FOR INSERT 
TO anon
WITH CHECK (
  status = 'new' 
  AND source IS NOT NULL
  AND name IS NOT NULL 
  AND phone IS NOT NULL
);

-- Add a flag to distinguish enquiry leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_enquiry boolean DEFAULT false;