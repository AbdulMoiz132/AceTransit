export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          title: string
          address: string
          city: string
          postal_code: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          address: string
          city: string
          postal_code?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          address?: string
          city?: string
          postal_code?: string | null
          is_default?: boolean
          created_at?: string
        }
      }
      deliveries: {
        Row: {
          id: string
          user_id: string
          pickup_address: string
          delivery_address: string
          package_type: string
          status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'
          estimated_delivery: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pickup_address: string
          delivery_address: string
          package_type: string
          status?: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'
          estimated_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pickup_address?: string
          delivery_address?: string
          package_type?: string
          status?: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'
          estimated_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Address = Database['public']['Tables']['addresses']['Row']
export type Delivery = Database['public']['Tables']['deliveries']['Row']
