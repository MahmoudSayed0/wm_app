import { supabase, getCurrentUser } from '../supabase';
import type {
  Order,
  OrderInsert,
  OrderWithRelations,
  CountryCode,
} from '@/types';
import { format } from 'date-fns';
import { isDemoUser, getDemoOrders, addDemoOrder, updateDemoOrder, getDemoVehicles, getDemoLocations } from '../demo-storage';

// Generate order number: WM-{COUNTRY}-{DATE}-{TIME}-{RANDOM}
function generateOrderNumber(country: CountryCode): string {
  const date = new Date();
  const dateStr = format(date, 'yyyyMMdd');
  const timeStr = format(date, 'HHmm');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WM-${country}-${dateStr}-${timeStr}-${random}`;
}

// Fetch all orders for current user
export async function getOrders(): Promise<OrderWithRelations[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode - use local storage
  if (isDemoUser(user.id)) {
    const orders = await getDemoOrders(user.id);
    const vehicles = await getDemoVehicles(user.id);
    const locations = await getDemoLocations(user.id);

    // Enrich orders with relations
    return orders.map(order => ({
      ...order,
      vehicle: vehicles.find(v => v.id === order.vehicle_id) || null,
      location: locations.find(l => l.id === order.location_id) || null,
      service: null,
      washer: null,
    })) as OrderWithRelations[];
  }

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      vehicle:vehicles(*),
      location:locations(*),
      service:services(*),
      washer:washers(*)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as OrderWithRelations[]) || [];
}

// Get active orders (not completed or cancelled)
export async function getActiveOrders(): Promise<OrderWithRelations[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    const allOrders = await getOrders();
    return allOrders.filter(o => !['completed', 'cancelled'].includes(o.status));
  }

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      vehicle:vehicles(*),
      location:locations(*),
      service:services(*),
      washer:washers(*)
    `
    )
    .eq('user_id', user.id)
    .not('status', 'in', '("completed","cancelled")')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as OrderWithRelations[]) || [];
}

// Get a single order with relations
export async function getOrder(id: string): Promise<OrderWithRelations | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    const allOrders = await getOrders();
    return allOrders.find(o => o.id === id) || null;
  }

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      vehicle:vehicles(*),
      location:locations(*),
      service:services(*),
      washer:washers(*),
      order_addons(
        addon:addons(*),
        price
      )
    `
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data as OrderWithRelations;
}

// Create a new order (full version with all parameters)
export async function createOrderFull(params: {
  serviceId: string;
  vehicleId: string;
  locationId: string;
  zoneId: string;
  scheduledDate: string;
  scheduledTime: string;
  subtotal: number;
  addonsTotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'paymob' | 'instapay' | 'apple_pay' | 'google_pay';
  promoCode?: string;
  notes?: string;
  addonIds?: string[];
  country: CountryCode;
}): Promise<Order> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const orderNumber = generateOrderNumber(params.country);

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      service_id: params.serviceId,
      vehicle_id: params.vehicleId,
      location_id: params.locationId,
      zone_id: params.zoneId,
      scheduled_date: params.scheduledDate,
      scheduled_time: params.scheduledTime,
      status: 'pending',
      subtotal: params.subtotal,
      addons_total: params.addonsTotal,
      discount: params.discount,
      total: params.total,
      payment_method: params.paymentMethod,
      payment_status: 'pending',
      promo_code: params.promoCode || null,
      notes: params.notes || null,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order addons if any
  if (params.addonIds && params.addonIds.length > 0) {
    // Get addon prices
    const { data: addons } = await supabase
      .from('addons')
      .select('id, price_eg, price_ae')
      .in('id', params.addonIds);

    if (addons) {
      const orderAddons = addons.map((addon) => ({
        order_id: order.id,
        addon_id: addon.id,
        price:
          params.country === 'EG'
            ? addon.price_eg || 0
            : addon.price_ae || 0,
      }));

      await supabase.from('order_addons').insert(orderAddons);
    }
  }

  return order;
}

// Create a simple order (mobile app version with minimal parameters)
export async function createOrder(params: {
  vehicleId: string;
  locationId: string;
  scheduledDate: string;
  scheduledTime: string;
  paymentMethod: 'cash' | 'paymob';
  notes?: string;
  serviceName?: string;
  servicePrice?: number;
}): Promise<Order> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode - use local storage
  if (isDemoUser(user.id)) {
    const country = 'EG'; // Default for demo
    const orderNumber = generateOrderNumber(country);
    const total = params.servicePrice || 0;

    return addDemoOrder(user.id, {
      order_number: orderNumber,
      vehicle_id: params.vehicleId,
      location_id: params.locationId,
      scheduled_date: params.scheduledDate,
      scheduled_time: params.scheduledTime,
      subtotal: total,
      total: total,
      payment_method: params.paymentMethod,
      notes: params.notes || null,
    });
  }

  // Get user profile for country
  const { data: profile } = await supabase
    .from('profiles')
    .select('country')
    .eq('id', user.id)
    .single();

  const country = (profile?.country as CountryCode) || 'EG';
  const orderNumber = generateOrderNumber(country);
  const total = params.servicePrice || 0;

  // Try to find a matching service by name, or use the first available
  let serviceId: string | null = null;
  if (params.serviceName) {
    const { data: services } = await supabase
      .from('services')
      .select('id')
      .or(`name_en.ilike.%${params.serviceName}%,name_ar.ilike.%${params.serviceName}%`)
      .limit(1);

    if (services && services.length > 0) {
      serviceId = services[0].id;
    }
  }

  // Get location to find zone_id
  const { data: location } = await supabase
    .from('locations')
    .select('zone_id')
    .eq('id', params.locationId)
    .single();

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      service_id: serviceId,
      vehicle_id: params.vehicleId,
      location_id: params.locationId,
      zone_id: location?.zone_id || null,
      scheduled_date: params.scheduledDate,
      scheduled_time: params.scheduledTime,
      status: 'pending',
      subtotal: total,
      addons_total: 0,
      discount: 0,
      total: total,
      payment_method: params.paymentMethod,
      payment_status: 'pending',
      notes: params.notes || null,
    })
    .select()
    .single();

  if (orderError) throw orderError;
  return order;
}

// Cancel an order
export async function cancelOrder(
  id: string,
  reason?: string
): Promise<Order> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    const updated = await updateDemoOrder(user.id, id, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || null,
    });
    if (!updated) throw new Error('Order not found');
    return updated;
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Rate an order
export async function rateOrder(
  id: string,
  rating: number,
  review?: string
): Promise<Order> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    const updated = await updateDemoOrder(user.id, id, {
      rating,
      review: review || null,
    });
    if (!updated) throw new Error('Order not found');
    return updated;
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      rating,
      review: review || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
