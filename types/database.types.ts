export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type CountryCode = 'EG' | 'AE'
export type VehicleType = 'sedan' | 'suv' | 'pickup' | 'luxury'
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'on_the_way'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'cash' | 'paymob' | 'instapay' | 'apple_pay' | 'google_pay' | 'membership'
export type MembershipStatus = 'active' | 'paused' | 'expired' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          email: string | null
          avatar_url: string | null
          country: CountryCode
          language: string
          push_enabled: boolean
          biometric_enabled: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          email?: string | null
          avatar_url?: string | null
          country?: CountryCode
          language?: string
          push_enabled?: boolean
          biometric_enabled?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          avatar_url?: string | null
          country?: CountryCode
          language?: string
          push_enabled?: boolean
          biometric_enabled?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          id: string
          name_en: string
          name_ar: string
          country: CountryCode
          max_washers: number
          is_active: boolean
          polygon: {
            type: 'Polygon'
            coordinates: number[][][]
          } | null
          created_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_ar: string
          country: CountryCode
          max_washers?: number
          is_active?: boolean
          polygon?: {
            type: 'Polygon'
            coordinates: number[][][]
          } | null
          created_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_ar?: string
          country?: CountryCode
          max_washers?: number
          is_active?: boolean
          polygon?: {
            type: 'Polygon'
            coordinates: number[][][]
          } | null
          created_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          make: string
          model: string
          year: number
          type: VehicleType
          plate: string
          color: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          make: string
          model: string
          year: number
          type: VehicleType
          plate: string
          color?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          make?: string
          model?: string
          year?: number
          type?: VehicleType
          plate?: string
          color?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          user_id: string
          label: string
          address: string
          city: string
          latitude: number | null
          longitude: number | null
          zone_id: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          address: string
          city: string
          latitude?: number | null
          longitude?: number | null
          zone_id?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          address?: string
          city?: string
          latitude?: number | null
          longitude?: number | null
          zone_id?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          id: string
          slug: string
          name_en: string
          name_ar: string
          description_en: string | null
          description_ar: string | null
          icon: string | null
          image_url: string | null
          countries: string[]
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_en: string
          name_ar: string
          description_en?: string | null
          description_ar?: string | null
          icon?: string | null
          image_url?: string | null
          countries?: string[]
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name_en?: string
          name_ar?: string
          description_en?: string | null
          description_ar?: string | null
          icon?: string | null
          image_url?: string | null
          countries?: string[]
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          category_id: string
          slug: string
          name_en: string
          name_ar: string
          description_en: string | null
          description_ar: string | null
          duration_minutes: number
          price_sedan_eg: number | null
          price_suv_eg: number | null
          price_luxury_eg: number | null
          price_sedan_ae: number | null
          price_suv_ae: number | null
          price_luxury_ae: number | null
          features_en: string[] | null
          features_ar: string[] | null
          image_url: string | null
          is_recommended: boolean
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          slug: string
          name_en: string
          name_ar: string
          description_en?: string | null
          description_ar?: string | null
          duration_minutes?: number
          price_sedan_eg?: number | null
          price_suv_eg?: number | null
          price_luxury_eg?: number | null
          price_sedan_ae?: number | null
          price_suv_ae?: number | null
          price_luxury_ae?: number | null
          features_en?: string[] | null
          features_ar?: string[] | null
          image_url?: string | null
          is_recommended?: boolean
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          slug?: string
          name_en?: string
          name_ar?: string
          description_en?: string | null
          description_ar?: string | null
          duration_minutes?: number
          price_sedan_eg?: number | null
          price_suv_eg?: number | null
          price_luxury_eg?: number | null
          price_sedan_ae?: number | null
          price_suv_ae?: number | null
          price_luxury_ae?: number | null
          features_en?: string[] | null
          features_ar?: string[] | null
          image_url?: string | null
          is_recommended?: boolean
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      addons: {
        Row: {
          id: string
          service_id: string | null
          name_en: string
          name_ar: string
          description_en: string | null
          description_ar: string | null
          price_eg: number | null
          price_ae: number | null
          addon_type: 'interior' | 'exterior' | 'both' | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          service_id?: string | null
          name_en: string
          name_ar: string
          description_en?: string | null
          description_ar?: string | null
          price_eg?: number | null
          price_ae?: number | null
          addon_type?: 'interior' | 'exterior' | 'both' | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string | null
          name_en?: string
          name_ar?: string
          description_en?: string | null
          description_ar?: string | null
          price_eg?: number | null
          price_ae?: number | null
          addon_type?: 'interior' | 'exterior' | 'both' | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      washers: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          phone: string
          avatar_url: string | null
          zone_id: string | null
          rating: number
          total_jobs: number
          is_available: boolean
          current_latitude: number | null
          current_longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          phone: string
          avatar_url?: string | null
          zone_id?: string | null
          rating?: number
          total_jobs?: number
          is_available?: boolean
          current_latitude?: number | null
          current_longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          phone?: string
          avatar_url?: string | null
          zone_id?: string | null
          rating?: number
          total_jobs?: number
          is_available?: boolean
          current_latitude?: number | null
          current_longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          id: string
          zone_id: string
          slot_date: string
          slot_hour: number
          max_capacity: number
          booked_count: number
          created_at: string
        }
        Insert: {
          id?: string
          zone_id: string
          slot_date: string
          slot_hour: number
          max_capacity?: number
          booked_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          zone_id?: string
          slot_date?: string
          slot_hour?: number
          max_capacity?: number
          booked_count?: number
          created_at?: string
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          id: string
          slug: string
          name_en: string
          name_ar: string
          description_en: string | null
          description_ar: string | null
          duration_days: number
          wash_credits: number
          price_eg: number | null
          price_ae: number | null
          is_popular: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_en: string
          name_ar: string
          description_en?: string | null
          description_ar?: string | null
          duration_days: number
          wash_credits: number
          price_eg?: number | null
          price_ae?: number | null
          is_popular?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name_en?: string
          name_ar?: string
          description_en?: string | null
          description_ar?: string | null
          duration_days?: number
          wash_credits?: number
          price_eg?: number | null
          price_ae?: number | null
          is_popular?: boolean
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          starts_at: string
          expires_at: string
          wash_credits_remaining: number
          auto_renew: boolean
          status: MembershipStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          starts_at?: string
          expires_at: string
          wash_credits_remaining: number
          auto_renew?: boolean
          status?: MembershipStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          starts_at?: string
          expires_at?: string
          wash_credits_remaining?: number
          auto_renew?: boolean
          status?: MembershipStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          service_id: string | null
          vehicle_id: string
          location_id: string
          zone_id: string | null
          washer_id: string | null
          time_slot_id: string | null
          scheduled_date: string
          scheduled_time: string
          status: OrderStatus
          subtotal: number
          addons_total: number
          discount: number
          total: number
          payment_method: PaymentMethod | null
          payment_status: PaymentStatus
          promo_code: string | null
          membership_id: string | null
          notes: string | null
          rating: number | null
          review: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          user_id: string
          service_id?: string | null
          vehicle_id: string
          location_id: string
          zone_id?: string | null
          washer_id?: string | null
          time_slot_id?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: OrderStatus
          subtotal: number
          addons_total?: number
          discount?: number
          total: number
          payment_method?: PaymentMethod | null
          payment_status?: PaymentStatus
          promo_code?: string | null
          membership_id?: string | null
          notes?: string | null
          rating?: number | null
          review?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string
          service_id?: string
          vehicle_id?: string
          location_id?: string
          zone_id?: string
          washer_id?: string | null
          time_slot_id?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: OrderStatus
          subtotal?: number
          addons_total?: number
          discount?: number
          total?: number
          payment_method?: PaymentMethod | null
          payment_status?: PaymentStatus
          promo_code?: string | null
          membership_id?: string | null
          notes?: string | null
          rating?: number | null
          review?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_addons: {
        Row: {
          id: string
          order_id: string
          addon_id: string
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          addon_id: string
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          addon_id?: string
          price?: number
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title_en: string
          title_ar: string
          body_en: string
          body_ar: string
          type: string
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title_en: string
          title_ar: string
          body_en: string
          body_ar: string
          type: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title_en?: string
          title_ar?: string
          body_en?: string
          body_ar?: string
          type?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          order_id: string
          sender_id: string
          sender_type: 'customer' | 'washer'
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          sender_id: string
          sender_type: 'customer' | 'washer'
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          sender_id?: string
          sender_type?: 'customer' | 'washer'
          content?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      country_code: CountryCode
      vehicle_type: VehicleType
      order_status: OrderStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      membership_status: MembershipStatus
    }
  }
}
