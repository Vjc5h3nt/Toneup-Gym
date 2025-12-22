-- Add CHECK constraints for server-side input validation on critical tables

-- Members table constraints
ALTER TABLE public.members
  ADD CONSTRAINT members_name_length CHECK (length(name) >= 1 AND length(name) <= 100),
  ADD CONSTRAINT members_phone_format CHECK (length(phone) >= 10 AND length(phone) <= 15),
  ADD CONSTRAINT members_email_format CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT members_address_length CHECK (address IS NULL OR length(address) <= 500),
  ADD CONSTRAINT members_emergency_name_length CHECK (emergency_contact_name IS NULL OR length(emergency_contact_name) <= 100),
  ADD CONSTRAINT members_emergency_phone_length CHECK (emergency_contact_phone IS NULL OR length(emergency_contact_phone) <= 15);

-- Leads table constraints
ALTER TABLE public.leads
  ADD CONSTRAINT leads_name_length CHECK (length(name) >= 1 AND length(name) <= 100),
  ADD CONSTRAINT leads_phone_format CHECK (length(phone) >= 10 AND length(phone) <= 15),
  ADD CONSTRAINT leads_email_format CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT leads_fitness_goal_length CHECK (fitness_goal IS NULL OR length(fitness_goal) <= 500),
  ADD CONSTRAINT leads_preferred_call_time_length CHECK (preferred_call_time IS NULL OR length(preferred_call_time) <= 100),
  ADD CONSTRAINT leads_preferred_visit_time_length CHECK (preferred_visit_time IS NULL OR length(preferred_visit_time) <= 100),
  ADD CONSTRAINT leads_expected_duration_range CHECK (expected_duration IS NULL OR (expected_duration >= 1 AND expected_duration <= 24));

-- Staff table constraints
ALTER TABLE public.staff
  ADD CONSTRAINT staff_name_length CHECK (length(name) >= 1 AND length(name) <= 100),
  ADD CONSTRAINT staff_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT staff_phone_format CHECK (phone IS NULL OR (length(phone) >= 10 AND length(phone) <= 15)),
  ADD CONSTRAINT staff_specialization_length CHECK (specialization IS NULL OR length(specialization) <= 200),
  ADD CONSTRAINT staff_salary_positive CHECK (salary IS NULL OR salary >= 0);

-- Payments table constraints
ALTER TABLE public.payments
  ADD CONSTRAINT payments_amount_positive CHECK (amount > 0),
  ADD CONSTRAINT payments_notes_length CHECK (notes IS NULL OR length(notes) <= 500);

-- Memberships table constraints
ALTER TABLE public.memberships
  ADD CONSTRAINT memberships_price_positive CHECK (price >= 0),
  ADD CONSTRAINT memberships_notes_length CHECK (notes IS NULL OR length(notes) <= 500),
  ADD CONSTRAINT memberships_date_order CHECK (end_date >= start_date);

-- Payroll table constraints
ALTER TABLE public.payroll
  ADD CONSTRAINT payroll_month_range CHECK (month >= 1 AND month <= 12),
  ADD CONSTRAINT payroll_year_range CHECK (year >= 2000 AND year <= 2100),
  ADD CONSTRAINT payroll_salary_positive CHECK (basic_salary >= 0),
  ADD CONSTRAINT payroll_net_salary_positive CHECK (net_salary >= 0);

-- Lead notes table constraints
ALTER TABLE public.lead_notes
  ADD CONSTRAINT lead_notes_note_length CHECK (length(note) >= 1 AND length(note) <= 2000);

-- Access control table constraints
ALTER TABLE public.access_control
  ADD CONSTRAINT access_control_device_id_length CHECK (length(device_id) >= 1 AND length(device_id) <= 100),
  ADD CONSTRAINT access_control_status_values CHECK (access_status IS NULL OR access_status IN ('allowed', 'blocked'));