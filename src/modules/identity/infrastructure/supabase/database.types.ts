export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_path: string | null
          phone_number: string | null
          last_dashboard_visit_at: string | null
          privacy_policy_accepted_at: string | null
          terms_accepted_at: string | null
          role: "user" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_path?: string | null
          phone_number?: string | null
          privacy_policy_accepted_at?: string | null
          terms_accepted_at?: string | null
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_path?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      record_dashboard_visit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_admin_transaction_password: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_admin_transaction_password_status: {
        Args: Record<PropertyKey, never>
        Returns: "not_admin" | "not_set" | "configured" | "reset_required"
      }
      set_admin_transaction_password: {
        Args: {
          p_password: string
          p_current_password?: string | null
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
