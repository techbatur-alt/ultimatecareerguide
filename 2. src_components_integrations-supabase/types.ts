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
      allocation_schools: {
        Row: {
          allocation_id: string
          created_at: string
          school_id: string
          units: number
        }
        Insert: {
          allocation_id: string
          created_at?: string
          school_id: string
          units?: number
        }
        Update: {
          allocation_id?: string
          created_at?: string
          school_id?: string
          units?: number
        }
        Relationships: [
          {
            foreignKeyName: "allocation_schools_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocation_schools_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json
          resource_id: string
          resource_type: string
          target_user_id: string | null
        }
        Insert: {
          action?: string
          actor_email?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string
          resource_type?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string
          resource_type?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      courier_events: {
        Row: {
          courier_name: string
          created_at: string
          event_description: string
          event_location: string
          event_status: string
          event_time: string
          id: string
          order_id: string | null
          raw_payload: Json
          tracking_number: string
        }
        Insert: {
          courier_name?: string
          created_at?: string
          event_description?: string
          event_location?: string
          event_status?: string
          event_time?: string
          id?: string
          order_id?: string | null
          raw_payload?: Json
          tracking_number?: string
        }
        Update: {
          courier_name?: string
          created_at?: string
          event_description?: string
          event_location?: string
          event_status?: string
          event_time?: string
          id?: string
          order_id?: string | null
          raw_payload?: Json
          tracking_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "courier_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          company: string
          created_at: string
          created_by: string | null
          email: string
          id: string
          name: string
          notes: string
          owner_agent_id: string | null
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          company?: string
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string
          owner_agent_id?: string | null
          phone?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string
          owner_agent_id?: string | null
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string
          id: string
          last_active: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string
          id?: string
          last_active?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          id?: string
          last_active?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          code: string
          created_at: string
          id: string
          institution_category: string
          institution_type: string
          name: string
          province_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          id?: string
          institution_category?: string
          institution_type?: string
          name: string
          province_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          institution_category?: string
          institution_type?: string
          name?: string
          province_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      npos: {
        Row: {
          address: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          institution_category: string
          institution_type: string
          is_active: boolean
          name: string
          notes: string
          pbo_id: string | null
          registration_number: string
          updated_at: string
        }
        Insert: {
          address?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          institution_category?: string
          institution_type?: string
          is_active?: boolean
          name: string
          notes?: string
          pbo_id?: string | null
          registration_number?: string
          updated_at?: string
        }
        Update: {
          address?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          institution_category?: string
          institution_type?: string
          is_active?: boolean
          name?: string
          notes?: string
          pbo_id?: string | null
          registration_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "npos_pbo_id_fkey"
            columns: ["pbo_id"]
            isOneToOne: false
            referencedRelation: "pbos"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          actor_email: string
          actor_id: string | null
          created_at: string
          from_status: string
          id: string
          note: string
          order_id: string
          to_status: string
        }
        Insert: {
          actor_email?: string
          actor_id?: string | null
          created_at?: string
          from_status?: string
          id?: string
          note?: string
          order_id: string
          to_status: string
        }
        Update: {
          actor_email?: string
          actor_id?: string | null
          created_at?: string
          from_status?: string
          id?: string
          note?: string
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          agent_notes: string
          courier_name: string
          created_at: string
          currency: string
          delivered_at: string | null
          dispatched_at: string | null
          expected_delivery_at: string | null
          id: string
          notes: string
          order_number: string
          payment_method: string
          payment_reference: string
          product_id: string | null
          product_name: string
          quantity: number
          shipping_address: string
          shipping_name: string
          shipping_phone: string
          status: string
          ticket_id: string | null
          total_amount: number
          tracking_number: string
          tracking_url: string
          unit_price: number
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          agent_notes?: string
          courier_name?: string
          created_at?: string
          currency?: string
          delivered_at?: string | null
          dispatched_at?: string | null
          expected_delivery_at?: string | null
          id?: string
          notes?: string
          order_number: string
          payment_method?: string
          payment_reference?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          shipping_address?: string
          shipping_name?: string
          shipping_phone?: string
          status?: string
          ticket_id?: string | null
          total_amount?: number
          tracking_number?: string
          tracking_url?: string
          unit_price?: number
          updated_at?: string
          user_email?: string
          user_id: string
        }
        Update: {
          agent_notes?: string
          courier_name?: string
          created_at?: string
          currency?: string
          delivered_at?: string | null
          dispatched_at?: string | null
          expected_delivery_at?: string | null
          id?: string
          notes?: string
          order_number?: string
          payment_method?: string
          payment_reference?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          shipping_address?: string
          shipping_name?: string
          shipping_phone?: string
          status?: string
          ticket_id?: string | null
          total_amount?: number
          tracking_number?: string
          tracking_url?: string
          unit_price?: number
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      pbos: {
        Row: {
          address: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string
          registration_number: string
          updated_at: string
        }
        Insert: {
          address?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string
          registration_number?: string
          updated_at?: string
        }
        Update: {
          address?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string
          registration_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          currency: string
          description: string
          id: string
          is_active: boolean
          name: string
          price: number
          product_type: string
          sku: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          product_type?: string
          sku: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          product_type?: string
          sku?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          home_address: string
          id: string
          id_number: string
          is_active: boolean
          last_name: string
          mobile_1: string
          mobile_2: string | null
          nickname: string
          profile_picture_url: string | null
          role: string
          salutation: string
          secondary_email: string | null
          telephone_home: string | null
          telephone_work: string | null
          updated_at: string
          work_address: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          home_address?: string
          id: string
          id_number?: string
          is_active?: boolean
          last_name?: string
          mobile_1?: string
          mobile_2?: string | null
          nickname?: string
          profile_picture_url?: string | null
          role?: string
          salutation?: string
          secondary_email?: string | null
          telephone_home?: string | null
          telephone_work?: string | null
          updated_at?: string
          work_address?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          home_address?: string
          id?: string
          id_number?: string
          is_active?: boolean
          last_name?: string
          mobile_1?: string
          mobile_2?: string | null
          nickname?: string
          profile_picture_url?: string | null
          role?: string
          salutation?: string
          secondary_email?: string | null
          telephone_home?: string | null
          telephone_work?: string | null
          updated_at?: string
          work_address?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          currency: string
          customer_id: string | null
          description: string
          end_date: string | null
          id: string
          kam_agent_id: string | null
          name: string
          npo_id: string | null
          project_type: string
          school_id: string | null
          start_date: string | null
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          description?: string
          end_date?: string | null
          id?: string
          kam_agent_id?: string | null
          name?: string
          npo_id?: string | null
          project_type?: string
          school_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          value?: number
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          description?: string
          end_date?: string | null
          id?: string
          kam_agent_id?: string | null
          name?: string
          npo_id?: string | null
          project_type?: string
          school_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          logged_by: string | null
          logged_by_email: string
          notes: string
          processor_reference: string
          reason: string
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          logged_by?: string | null
          logged_by_email?: string
          notes?: string
          processor_reference?: string
          reason?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          logged_by?: string | null
          logged_by_email?: string
          notes?: string
          processor_reference?: string
          reason?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_agents: {
        Row: {
          activated_at: string | null
          commission_rate: number
          created_at: string
          id: string
          invited_at: string | null
          invited_email: string
          notes: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          commission_rate?: number
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_email?: string
          notes?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          commission_rate?: number
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_email?: string
          notes?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          district_id: string | null
          emis_number: string
          id: string
          institution_category: string
          institution_type: string
          is_active: boolean
          learner_count: number
          name: string
          notes: string
          npo_id: string | null
          province_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          district_id?: string | null
          emis_number?: string
          id?: string
          institution_category?: string
          institution_type?: string
          is_active?: boolean
          learner_count?: number
          name: string
          notes?: string
          npo_id?: string | null
          province_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          district_id?: string | null
          emis_number?: string
          id?: string
          institution_category?: string
          institution_type?: string
          is_active?: boolean
          learner_count?: number
          name?: string
          notes?: string
          npo_id?: string | null
          province_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schools_npo_id_fkey"
            columns: ["npo_id"]
            isOneToOne: false
            referencedRelation: "npos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schools_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_schools: {
        Row: {
          created_at: string
          school_id: string
          sponsor_id: string
        }
        Insert: {
          created_at?: string
          school_id: string
          sponsor_id: string
        }
        Update: {
          created_at?: string
          school_id?: string
          sponsor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_schools_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_schools_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          amount_paid: number
          amount_pledged: number
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          organization: string | null
          phone: string | null
          status: string
          tier: string
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          amount_pledged?: number
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          status?: string
          tier?: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          amount_pledged?: number
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          status?: string
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsorship_allocations: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          quantity: number
          sponsor_id: string | null
          status: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          quantity?: number
          sponsor_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          quantity?: number
          sponsor_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_allocations_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_profiles: {
        Row: {
          account_holder_id: string
          created_at: string
          email: string | null
          first_name: string
          grade: string | null
          home_address: string | null
          id: string
          last_name: string
          mobile_1: string | null
          mobile_2: string | null
          nickname: string | null
          profile_picture_url: string | null
          profile_type: string
          school_address: string | null
          school_name: string | null
          school_telephone: string | null
          subjects: Json | null
          telephone_home: string | null
          telephone_work: string | null
          updated_at: string
          work_address: string | null
        }
        Insert: {
          account_holder_id: string
          created_at?: string
          email?: string | null
          first_name?: string
          grade?: string | null
          home_address?: string | null
          id?: string
          last_name?: string
          mobile_1?: string | null
          mobile_2?: string | null
          nickname?: string | null
          profile_picture_url?: string | null
          profile_type?: string
          school_address?: string | null
          school_name?: string | null
          school_telephone?: string | null
          subjects?: Json | null
          telephone_home?: string | null
          telephone_work?: string | null
          updated_at?: string
          work_address?: string | null
        }
        Update: {
          account_holder_id?: string
          created_at?: string
          email?: string | null
          first_name?: string
          grade?: string | null
          home_address?: string | null
          id?: string
          last_name?: string
          mobile_1?: string | null
          mobile_2?: string | null
          nickname?: string | null
          profile_picture_url?: string | null
          profile_type?: string
          school_address?: string | null
          school_name?: string | null
          school_telephone?: string | null
          subjects?: Json | null
          telephone_home?: string | null
          telephone_work?: string | null
          updated_at?: string
          work_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_profiles_account_holder_id_fkey"
            columns: ["account_holder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_paid: number
          created_at: string
          end_date: string
          id: string
          order_number: string
          payment_method: string | null
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          end_date: string
          id?: string
          order_number?: string
          payment_method?: string | null
          start_date?: string
          status?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          end_date?: string
          id?: string
          order_number?: string
          payment_method?: string | null
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          agent_notes: string
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          raised_by: string | null
          raised_by_email: string
          resolution_notes: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          agent_notes?: string
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          raised_by?: string | null
          raised_by_email?: string
          resolution_notes?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Update: {
          agent_notes?: string
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          raised_by?: string | null
          raised_by_email?: string
          resolution_notes?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainer_schools: {
        Row: {
          assigned_at: string
          school_id: string
          trainer_id: string
        }
        Insert: {
          assigned_at?: string
          school_id: string
          trainer_id: string
        }
        Update: {
          assigned_at?: string
          school_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_schools_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_schools_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          institution_category: string
          institution_type: string
          is_active: boolean
          last_name: string
          notes: string
          npo_id: string | null
          phone: string
          qualifications: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          institution_category?: string
          institution_type?: string
          is_active?: boolean
          last_name?: string
          notes?: string
          npo_id?: string | null
          phone?: string
          qualifications?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          institution_category?: string
          institution_type?: string
          is_active?: boolean
          last_name?: string
          notes?: string
          npo_id?: string | null
          phone?: string
          qualifications?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainers_npo_id_fkey"
            columns: ["npo_id"]
            isOneToOne: false
            referencedRelation: "npos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_any_role: {
        Args: { _roles: string[]; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
