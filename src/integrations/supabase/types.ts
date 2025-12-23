export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_control: {
        Row: {
          access_status: string | null
          created_at: string
          device_id: string
          id: string
          last_check_in: string | null
          member_id: string
          updated_at: string
        }
        Insert: {
          access_status?: string | null
          created_at?: string
          device_id: string
          id?: string
          last_check_in?: string | null
          member_id: string
          updated_at?: string
        }
        Update: {
          access_status?: string | null
          created_at?: string
          device_id?: string
          id?: string
          last_check_in?: string | null
          member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_control_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_follow_ups: {
        Row: {
          created_at: string
          created_by: string | null
          follow_up_date: string
          id: string
          lead_id: string
          note: string | null
          status_at_time: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          follow_up_date: string
          id?: string
          lead_id: string
          note?: string | null
          status_at_time: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          follow_up_date?: string
          id?: string
          lead_id?: string
          note?: string | null
          status_at_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_follow_ups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          note: string
          staff_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          note: string
          staff_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          note?: string
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_staff_id: string | null
          converted_member_id: string | null
          created_at: string
          email: string | null
          expected_duration: number | null
          fitness_goal: string | null
          id: string
          interest: Database["public"]["Enums"]["membership_type"] | null
          is_enquiry: boolean | null
          name: string
          next_follow_up: string | null
          phone: string
          preferred_call_time: string | null
          preferred_visit_time: string | null
          source: Database["public"]["Enums"]["lead_source"] | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string
        }
        Insert: {
          assigned_staff_id?: string | null
          converted_member_id?: string | null
          created_at?: string
          email?: string | null
          expected_duration?: number | null
          fitness_goal?: string | null
          id?: string
          interest?: Database["public"]["Enums"]["membership_type"] | null
          is_enquiry?: boolean | null
          name: string
          next_follow_up?: string | null
          phone: string
          preferred_call_time?: string | null
          preferred_visit_time?: string | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
        }
        Update: {
          assigned_staff_id?: string | null
          converted_member_id?: string | null
          created_at?: string
          email?: string | null
          expected_duration?: number | null
          fitness_goal?: string | null
          id?: string
          interest?: Database["public"]["Enums"]["membership_type"] | null
          is_enquiry?: boolean | null
          name?: string
          next_follow_up?: string | null
          phone?: string
          preferred_call_time?: string | null
          preferred_visit_time?: string | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_member_id_fkey"
            columns: ["converted_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_attendance: {
        Row: {
          check_in_time: string
          check_out_time: string | null
          created_at: string
          id: string
          member_id: string
          notes: string | null
        }
        Insert: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
        }
        Update: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string
          photo_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone: string
          photo_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string
          photo_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_months: number
          id: string
          is_active: boolean | null
          is_custom: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_months: number
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_months?: number
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          end_date: string
          id: string
          member_id: string
          notes: string | null
          price: number
          start_date: string
          status: Database["public"]["Enums"]["membership_status"] | null
          type: Database["public"]["Enums"]["membership_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          member_id: string
          notes?: string | null
          price: number
          start_date?: string
          status?: Database["public"]["Enums"]["membership_status"] | null
          type?: Database["public"]["Enums"]["membership_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          member_id?: string
          notes?: string | null
          price?: number
          start_date?: string
          status?: Database["public"]["Enums"]["membership_status"] | null
          type?: Database["public"]["Enums"]["membership_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_number: string | null
          member_id: string
          membership_id: string | null
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          received_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_number?: string | null
          member_id: string
          membership_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          received_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_number?: string | null
          member_id?: string
          membership_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          received_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          basic_salary: number
          bonuses: number | null
          created_at: string
          deductions: number | null
          id: string
          month: number
          net_salary: number
          notes: string | null
          paid_date: string | null
          staff_id: string
          status: Database["public"]["Enums"]["payroll_status"] | null
          year: number
        }
        Insert: {
          basic_salary: number
          bonuses?: number | null
          created_at?: string
          deductions?: number | null
          id?: string
          month: number
          net_salary: number
          notes?: string | null
          paid_date?: string | null
          staff_id: string
          status?: Database["public"]["Enums"]["payroll_status"] | null
          year: number
        }
        Update: {
          basic_salary?: number
          bonuses?: number | null
          created_at?: string
          deductions?: number | null
          id?: string
          month?: number
          net_salary?: number
          notes?: string | null
          paid_date?: string | null
          staff_id?: string
          status?: Database["public"]["Enums"]["payroll_status"] | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          can_edit_members: boolean | null
          can_manage_leads: boolean | null
          can_manage_payroll: boolean | null
          can_view_members: boolean | null
          can_view_reports: boolean | null
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          joining_date: string | null
          name: string
          phone: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["staff_role"]
          salary: number | null
          specialization: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          can_edit_members?: boolean | null
          can_manage_leads?: boolean | null
          can_manage_payroll?: boolean | null
          can_view_members?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          joining_date?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          salary?: number | null
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          can_edit_members?: boolean | null
          can_manage_leads?: boolean | null
          can_manage_payroll?: boolean | null
          can_view_members?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          joining_date?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          salary?: number | null
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      staff_attendance: {
        Row: {
          created_at: string
          date: string
          hours_worked: number | null
          id: string
          in_time: string | null
          notes: string | null
          out_time: string | null
          staff_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          hours_worked?: number | null
          id?: string
          in_time?: string | null
          notes?: string | null
          out_time?: string | null
          staff_id: string
        }
        Update: {
          created_at?: string
          date?: string
          hours_worked?: number | null
          id?: string
          in_time?: string | null
          notes?: string | null
          out_time?: string | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_member_access: {
        Args: { p_member_id: string }
        Returns: {
          allowed: boolean
          reason: string
        }[]
      }
      get_current_staff_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff_or_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff"
      lead_source:
        | "website"
        | "instagram"
        | "qr"
        | "referral"
        | "walk_in"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "hot"
        | "warm"
        | "cold"
        | "converted"
        | "lost"
      membership_status: "active" | "expired" | "frozen" | "hold" | "cancelled"
      membership_type:
        | "normal"
        | "personal_training"
        | "yoga"
        | "crossfit"
        | "other"
      payment_method: "cash" | "card" | "upi" | "bank_transfer" | "other"
      payroll_status: "generated" | "paid" | "pending"
      staff_role: "trainer" | "manager" | "receptionist" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff"],
      lead_source: [
        "website",
        "instagram",
        "qr",
        "referral",
        "walk_in",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "hot",
        "warm",
        "cold",
        "converted",
        "lost",
      ],
      membership_status: ["active", "expired", "frozen", "hold", "cancelled"],
      membership_type: [
        "normal",
        "personal_training",
        "yoga",
        "crossfit",
        "other",
      ],
      payment_method: ["cash", "card", "upi", "bank_transfer", "other"],
      payroll_status: ["generated", "paid", "pending"],
      staff_role: ["trainer", "manager", "receptionist", "admin"],
    },
  },
} as const
