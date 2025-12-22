// Database types for SmartGym ERP
export type AppRole = 'admin' | 'staff';
export type LeadStatus = 'new' | 'contacted' | 'hot' | 'warm' | 'cold' | 'converted' | 'lost';
export type LeadSource = 'website' | 'instagram' | 'qr' | 'referral' | 'walk_in' | 'other';
export type MembershipStatus = 'active' | 'expired' | 'frozen' | 'hold' | 'cancelled';
export type MembershipType = 'normal' | 'personal_training' | 'yoga' | 'crossfit' | 'other';
export type StaffRole = 'trainer' | 'manager' | 'receptionist' | 'admin';
export type PayrollStatus = 'generated' | 'paid' | 'pending';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Staff {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  salary: number;
  joining_date: string;
  is_active: boolean;
  photo_url: string | null;
  specialization: string | null;
  can_view_members: boolean;
  can_edit_members: boolean;
  can_view_reports: boolean;
  can_manage_payroll: boolean;
  can_manage_leads: boolean;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  photo_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  member_id: string;
  type: MembershipType;
  start_date: string;
  end_date: string;
  price: number;
  status: MembershipStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  preferred_call_time: string | null;
  preferred_visit_time: string | null;
  interest: MembershipType;
  expected_duration: number;
  fitness_goal: string | null;
  source: LeadSource;
  status: LeadStatus;
  assigned_staff_id: string | null;
  converted_member_id: string | null;
  next_follow_up: string | null;
  created_at: string;
  updated_at: string;
  assigned_staff?: Staff;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  staff_id: string | null;
  note: string;
  created_at: string;
  staff?: Staff;
}

export interface StaffAttendance {
  id: string;
  staff_id: string;
  date: string;
  in_time: string | null;
  out_time: string | null;
  hours_worked: number | null;
  notes: string | null;
  created_at: string;
  staff?: Staff;
}

export interface MemberAttendance {
  id: string;
  member_id: string;
  check_in_time: string;
  check_out_time: string | null;
  notes: string | null;
  created_at: string;
  member?: Member;
}

export interface Payment {
  id: string;
  member_id: string;
  membership_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  invoice_number: string | null;
  notes: string | null;
  received_by: string | null;
  created_at: string;
  member?: Member;
  membership?: Membership;
  received_by_staff?: Staff;
}

export interface Payroll {
  id: string;
  staff_id: string;
  month: number;
  year: number;
  basic_salary: number;
  deductions: number;
  bonuses: number;
  net_salary: number;
  status: PayrollStatus;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  staff?: Staff;
}

export interface AccessControl {
  id: string;
  device_id: string;
  member_id: string;
  last_check_in: string | null;
  access_status: string;
  created_at: string;
  updated_at: string;
  member?: Member;
}
