// Database Service Functions for AceTransit
// Add these to src/lib/database.ts when implementing features

import { createClient } from './supabase/client'
import type { Database } from './types/database'

type Address = Database['public']['Tables']['addresses']['Row']
type AddressInsert = Database['public']['Tables']['addresses']['Insert']
type Delivery = Database['public']['Tables']['deliveries']['Row']
type DeliveryInsert = Database['public']['Tables']['deliveries']['Insert']

export const databaseService = {
  // ==================== ADDRESSES ====================
  
  // Get all addresses for a user
  async getUserAddresses(userId: string): Promise<Address[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get default address
  async getDefaultAddress(userId: string): Promise<Address | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return data
  },

  // Add new address
  async addAddress(address: AddressInsert): Promise<Address> {
    const supabase = createClient()
    
    // If this is set as default, unset other defaults first
    if (address.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', address.user_id)
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert(address)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update address
  async updateAddress(id: string, updates: Partial<AddressInsert>): Promise<Address> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete address
  async deleteAddress(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Set default address
  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    const supabase = createClient()
    
    // Unset all defaults
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
    
    // Set new default
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
    
    if (error) throw error
  },

  // ==================== DELIVERIES ====================
  
  // Create new delivery/order
  async createDelivery(delivery: DeliveryInsert): Promise<Delivery> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('deliveries')
      .insert(delivery)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get all deliveries for user
  async getUserDeliveries(userId: string): Promise<Delivery[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get delivery by ID
  async getDelivery(id: string): Promise<Delivery> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Get active deliveries (not delivered or cancelled)
  async getActiveDeliveries(userId: string): Promise<Delivery[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'picked_up', 'in_transit'])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Update delivery status
  async updateDeliveryStatus(
    id: string, 
    status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'
  ): Promise<Delivery> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('deliveries')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get delivery stats for user
  async getDeliveryStats(userId: string) {
    const supabase = createClient()
    
    // Get all deliveries
    const { data: allDeliveries, error: allError } = await supabase
      .from('deliveries')
      .select('status')
      .eq('user_id', userId)
    
    if (allError) throw allError

    // Get active deliveries
    const { data: active, error: activeError } = await supabase
      .from('deliveries')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'picked_up', 'in_transit'])
    
    if (activeError) throw activeError

    // Calculate on-time rate (simplified - all delivered are on time)
    const delivered = allDeliveries?.filter(d => d.status === 'delivered').length || 0
    const total = allDeliveries?.length || 0
    const onTimeRate = total > 0 ? Math.round((delivered / total) * 100) : 100

    return {
      totalDeliveries: total,
      activeOrders: active?.length || 0,
      onTimeRate: `${onTimeRate}%`
    }
  },

  // Subscribe to delivery updates (real-time)
  subscribeToDelivery(deliveryId: string, callback: (delivery: Delivery) => void) {
    const supabase = createClient()
    
    const subscription = supabase
      .channel(`delivery:${deliveryId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deliveries',
          filter: `id=eq.${deliveryId}`
        },
        (payload) => {
          callback(payload.new as Delivery)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  },

  // ==================== PROFILE STATS ====================
  
  // Get comprehensive profile stats
  async getProfileStats(userId: string) {
    const deliveryStats = await this.getDeliveryStats(userId)
    
    return {
      stats: [
        {
          label: 'Total Deliveries',
          value: deliveryStats.totalDeliveries.toString(),
          icon: 'Package',
          color: 'from-blue-500 to-blue-600'
        },
        {
          label: 'On Time Rate',
          value: deliveryStats.onTimeRate,
          icon: 'TrendingUp',
          color: 'from-green-500 to-green-600'
        },
        {
          label: 'Active Orders',
          value: deliveryStats.activeOrders.toString(),
          icon: 'Clock',
          color: 'from-orange-500 to-orange-600'
        }
      ]
    }
  }
}

// ==================== USAGE EXAMPLES ====================

/*

// In a React component:

import { databaseService } from '@/lib/database'
import { useAuth } from '@/hooks/useAuth'

// Get user's addresses
const { user } = useAuth()
const addresses = await databaseService.getUserAddresses(user.id)

// Create a new delivery
const newDelivery = await databaseService.createDelivery({
  user_id: user.id,
  pickup_address: '123 Main St, City',
  delivery_address: '456 Oak Ave, Town',
  package_type: 'small',
  status: 'pending',
  estimated_delivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
})

// Get active deliveries
const activeOrders = await databaseService.getActiveDeliveries(user.id)

// Real-time tracking
useEffect(() => {
  const unsubscribe = databaseService.subscribeToDelivery(
    deliveryId,
    (updatedDelivery) => {
      console.log('Delivery updated:', updatedDelivery)
      setDelivery(updatedDelivery)
    }
  )
  
  return unsubscribe
}, [deliveryId])

// Get stats for profile page
const stats = await databaseService.getProfileStats(user.id)

*/
