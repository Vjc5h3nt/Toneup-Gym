-- Create membership_plans table
CREATE TABLE public.membership_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can view active plans (for public website)
CREATE POLICY "Active plans are publicly viewable"
ON public.membership_plans
FOR SELECT
USING (is_active = true);

-- Staff/admin can view all plans
CREATE POLICY "Staff/admin can view all plans"
ON public.membership_plans
FOR SELECT
USING (is_staff_or_admin());

-- Only admin can insert plans
CREATE POLICY "Admins can insert plans"
ON public.membership_plans
FOR INSERT
WITH CHECK (is_admin());

-- Only admin can update plans
CREATE POLICY "Admins can update plans"
ON public.membership_plans
FOR UPDATE
USING (is_admin());

-- Only admin can delete plans
CREATE POLICY "Admins can delete plans"
ON public.membership_plans
FOR DELETE
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_membership_plans_updated_at
BEFORE UPDATE ON public.membership_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default plans
INSERT INTO public.membership_plans (name, duration_months, price, description, is_active) VALUES
('1 Month Plan', 1, 1500, 'Monthly gym membership with full access to all equipment', true),
('3 Months Plan', 3, 4000, 'Quarterly membership with 11% discount', true),
('6 Months Plan', 6, 7500, 'Half-yearly membership with 17% discount', true),
('12 Months Plan', 12, 12000, 'Annual membership with 33% discount - Best Value!', true);