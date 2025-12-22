-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'hot', 'warm', 'cold', 'converted', 'lost');

-- Create enum for lead source
CREATE TYPE public.lead_source AS ENUM ('website', 'instagram', 'qr', 'referral', 'walk_in', 'other');

-- Create enum for membership status
CREATE TYPE public.membership_status AS ENUM ('active', 'expired', 'frozen', 'hold', 'cancelled');

-- Create enum for membership type
CREATE TYPE public.membership_type AS ENUM ('normal', 'personal_training', 'yoga', 'crossfit', 'other');

-- Create enum for staff role
CREATE TYPE public.staff_role AS ENUM ('trainer', 'manager', 'receptionist', 'admin');

-- Create enum for payroll status
CREATE TYPE public.payroll_status AS ENUM ('generated', 'paid', 'pending');

-- Create enum for payment method
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'upi', 'bank_transfer', 'other');

-- User roles table (for RLS)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Staff table
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role staff_role NOT NULL DEFAULT 'trainer',
    salary NUMERIC(10, 2) DEFAULT 0,
    joining_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    photo_url TEXT,
    specialization TEXT,
    -- Permission flags
    can_view_members BOOLEAN DEFAULT true,
    can_edit_members BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT false,
    can_manage_payroll BOOLEAN DEFAULT false,
    can_manage_leads BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Members table
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    photo_url TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Memberships table
CREATE TABLE public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    type membership_type NOT NULL DEFAULT 'normal',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    status membership_status DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Leads table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    preferred_call_time TEXT,
    preferred_visit_time TEXT,
    interest membership_type DEFAULT 'normal',
    expected_duration INTEGER DEFAULT 1, -- months
    fitness_goal TEXT,
    source lead_source DEFAULT 'website',
    status lead_status DEFAULT 'new',
    assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    converted_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    next_follow_up DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Lead notes table
CREATE TABLE public.lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Staff attendance table
CREATE TABLE public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    in_time TIME,
    out_time TIME,
    hours_worked NUMERIC(4, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(staff_id, date)
);

-- Member attendance (check-ins)
CREATE TABLE public.member_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method DEFAULT 'cash',
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_number TEXT,
    notes TEXT,
    received_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Payroll table
CREATE TABLE public.payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    basic_salary NUMERIC(10, 2) NOT NULL,
    deductions NUMERIC(10, 2) DEFAULT 0,
    bonuses NUMERIC(10, 2) DEFAULT 0,
    net_salary NUMERIC(10, 2) NOT NULL,
    status payroll_status DEFAULT 'pending',
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(staff_id, month, year)
);

-- Access control table (for future biometric integration)
CREATE TABLE public.access_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    last_check_in TIMESTAMP WITH TIME ZONE,
    access_status TEXT DEFAULT 'allowed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_control ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Function to check if user is staff or admin
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
  )
$$;

-- Function to get staff ID for current user
CREATE OR REPLACE FUNCTION public.get_current_staff_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert roles" ON public.user_roles
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE USING (public.is_admin());

-- RLS Policies for staff
CREATE POLICY "Staff visible to authenticated staff/admin" ON public.staff
    FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Admins can insert staff" ON public.staff
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update staff" ON public.staff
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete staff" ON public.staff
    FOR DELETE USING (public.is_admin());

-- RLS Policies for members
CREATE POLICY "Members visible to staff/admin" ON public.members
    FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can insert members" ON public.members
    FOR INSERT WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can update members" ON public.members
    FOR UPDATE USING (public.is_staff_or_admin());

CREATE POLICY "Admins can delete members" ON public.members
    FOR DELETE USING (public.is_admin());

-- RLS Policies for memberships
CREATE POLICY "Memberships visible to staff/admin" ON public.memberships
    FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can insert memberships" ON public.memberships
    FOR INSERT WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can update memberships" ON public.memberships
    FOR UPDATE USING (public.is_staff_or_admin());

CREATE POLICY "Admins can delete memberships" ON public.memberships
    FOR DELETE USING (public.is_admin());

-- RLS Policies for leads
CREATE POLICY "Leads visible to staff/admin" ON public.leads
    FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can insert leads" ON public.leads
    FOR INSERT WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can update leads" ON public.leads
    FOR UPDATE USING (public.is_staff_or_admin());

CREATE POLICY "Admins can delete leads" ON public.leads
    FOR DELETE USING (public.is_admin());

-- RLS Policies for lead_notes
CREATE POLICY "Lead notes visible to staff/admin" ON public.lead_notes
    FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can insert lead notes" ON public.lead_notes
    FOR INSERT WITH CHECK (public.is_staff_or_admin());

-- RLS Policies for staff_attendance
CREATE POLICY "Staff attendance visible to staff/admin" ON public.staff_attendance
    FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can insert attendance" ON public.staff_attendance
    FOR INSERT WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can update attendance" ON public.staff_attendance
    FOR UPDATE USING (public.is_staff_or_admin());

-- RLS Policies for member_attendance
CREATE POLICY "Member attendance visible to staff/admin" ON public.member_attendance
    FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can insert member attendance" ON public.member_attendance
    FOR INSERT WITH CHECK (public.is_staff_or_admin());

-- RLS Policies for payments
CREATE POLICY "Payments visible to staff/admin" ON public.payments
    FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can insert payments" ON public.payments
    FOR INSERT WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "Admins can update payments" ON public.payments
    FOR UPDATE USING (public.is_admin());

-- RLS Policies for payroll
CREATE POLICY "Payroll visible to admin" ON public.payroll
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert payroll" ON public.payroll
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update payroll" ON public.payroll
    FOR UPDATE USING (public.is_admin());

-- RLS Policies for access_control
CREATE POLICY "Access control visible to staff/admin" ON public.access_control
    FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can insert access control" ON public.access_control
    FOR INSERT WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "Staff/admin can update access control" ON public.access_control
    FOR UPDATE USING (public.is_staff_or_admin());

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_access_control_updated_at BEFORE UPDATE ON public.access_control
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_payment_invoice_number BEFORE INSERT ON public.payments
    FOR EACH ROW WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION public.generate_invoice_number();

-- Function to check member access (for biometric integration)
CREATE OR REPLACE FUNCTION public.check_member_access(p_member_id UUID)
RETURNS TABLE(allowed BOOLEAN, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_member RECORD;
    v_active_membership RECORD;
BEGIN
    -- Get member info
    SELECT * INTO v_member FROM public.members WHERE id = p_member_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Member not found'::TEXT;
        RETURN;
    END IF;
    
    IF NOT v_member.is_active THEN
        RETURN QUERY SELECT FALSE, 'Member account is inactive'::TEXT;
        RETURN;
    END IF;
    
    -- Check for active membership
    SELECT * INTO v_active_membership 
    FROM public.memberships 
    WHERE member_id = p_member_id 
      AND status = 'active' 
      AND start_date <= CURRENT_DATE 
      AND end_date >= CURRENT_DATE
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'No active membership'::TEXT;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Access granted'::TEXT;
END;
$$;

-- Function to auto-assign leads (round-robin)
CREATE OR REPLACE FUNCTION public.auto_assign_lead()
RETURNS TRIGGER AS $$
DECLARE
    v_staff_id UUID;
BEGIN
    -- Get next available active staff member (round-robin based on lead count)
    SELECT s.id INTO v_staff_id
    FROM public.staff s
    LEFT JOIN public.leads l ON l.assigned_staff_id = s.id AND l.status NOT IN ('converted', 'lost')
    WHERE s.is_active = true AND s.can_manage_leads = true
    GROUP BY s.id
    ORDER BY COUNT(l.id) ASC, s.created_at ASC
    LIMIT 1;
    
    IF v_staff_id IS NOT NULL THEN
        NEW.assigned_staff_id := v_staff_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER auto_assign_lead_trigger BEFORE INSERT ON public.leads
    FOR EACH ROW WHEN (NEW.assigned_staff_id IS NULL)
    EXECUTE FUNCTION public.auto_assign_lead();