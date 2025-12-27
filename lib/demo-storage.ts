import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Vehicle, Location, Order } from '@/types';

const DEMO_VEHICLES_KEY = 'demo_vehicles';
const DEMO_LOCATIONS_KEY = 'demo_locations';
const DEMO_ORDERS_KEY = 'demo_orders';

// Check if user is in demo mode
// Set to false to use real database even for demo users
const USE_DEMO_STORAGE = false;

export function isDemoUser(userId: string): boolean {
  if (!USE_DEMO_STORAGE) return false;
  return userId?.startsWith('demo-') ?? false;
}

// Vehicle storage for demo mode
export async function getDemoVehicles(userId: string): Promise<Vehicle[]> {
  try {
    const data = await AsyncStorage.getItem(`${DEMO_VEHICLES_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveDemoVehicles(userId: string, vehicles: Vehicle[]): Promise<void> {
  await AsyncStorage.setItem(`${DEMO_VEHICLES_KEY}_${userId}`, JSON.stringify(vehicles));
}

export async function addDemoVehicle(userId: string, vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
  const vehicles = await getDemoVehicles(userId);

  // If setting as default, unset others
  if (vehicle.is_default) {
    vehicles.forEach(v => v.is_default = false);
  }

  const newVehicle: Vehicle = {
    ...vehicle,
    id: `demo-vehicle-${Date.now()}`,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  vehicles.push(newVehicle);
  await saveDemoVehicles(userId, vehicles);
  return newVehicle;
}

export async function updateDemoVehicle(userId: string, id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
  const vehicles = await getDemoVehicles(userId);
  const index = vehicles.findIndex(v => v.id === id);

  if (index === -1) return null;

  // If setting as default, unset others
  if (updates.is_default) {
    vehicles.forEach(v => v.is_default = false);
  }

  vehicles[index] = { ...vehicles[index], ...updates, updated_at: new Date().toISOString() };
  await saveDemoVehicles(userId, vehicles);
  return vehicles[index];
}

export async function deleteDemoVehicle(userId: string, id: string): Promise<void> {
  const vehicles = await getDemoVehicles(userId);
  const filtered = vehicles.filter(v => v.id !== id);
  await saveDemoVehicles(userId, filtered);
}

// Location storage for demo mode
export async function getDemoLocations(userId: string): Promise<Location[]> {
  try {
    const data = await AsyncStorage.getItem(`${DEMO_LOCATIONS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveDemoLocations(userId: string, locations: Location[]): Promise<void> {
  await AsyncStorage.setItem(`${DEMO_LOCATIONS_KEY}_${userId}`, JSON.stringify(locations));
}

export async function addDemoLocation(userId: string, location: Omit<Location, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Location> {
  const locations = await getDemoLocations(userId);

  // If setting as default, unset others
  if (location.is_default) {
    locations.forEach(l => l.is_default = false);
  }

  const newLocation: Location = {
    ...location,
    id: `demo-location-${Date.now()}`,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  locations.push(newLocation);
  await saveDemoLocations(userId, locations);
  return newLocation;
}

export async function updateDemoLocation(userId: string, id: string, updates: Partial<Location>): Promise<Location | null> {
  const locations = await getDemoLocations(userId);
  const index = locations.findIndex(l => l.id === id);

  if (index === -1) return null;

  // If setting as default, unset others
  if (updates.is_default) {
    locations.forEach(l => l.is_default = false);
  }

  locations[index] = { ...locations[index], ...updates, updated_at: new Date().toISOString() };
  await saveDemoLocations(userId, locations);
  return locations[index];
}

export async function deleteDemoLocation(userId: string, id: string): Promise<void> {
  const locations = await getDemoLocations(userId);
  const filtered = locations.filter(l => l.id !== id);
  await saveDemoLocations(userId, filtered);
}

// Order storage for demo mode
export async function getDemoOrders(userId: string): Promise<Order[]> {
  try {
    const data = await AsyncStorage.getItem(`${DEMO_ORDERS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveDemoOrders(userId: string, orders: Order[]): Promise<void> {
  await AsyncStorage.setItem(`${DEMO_ORDERS_KEY}_${userId}`, JSON.stringify(orders));
}

export async function addDemoOrder(userId: string, order: Partial<Order>): Promise<Order> {
  const orders = await getDemoOrders(userId);

  const newOrder: Order = {
    id: `demo-order-${Date.now()}`,
    order_number: `WM${Date.now().toString().slice(-8)}`,
    user_id: userId,
    service_id: order.service_id || null,
    vehicle_id: order.vehicle_id || '',
    location_id: order.location_id || '',
    zone_id: order.zone_id || null,
    washer_id: null,
    time_slot_id: null,
    scheduled_date: order.scheduled_date || new Date().toISOString().split('T')[0],
    scheduled_time: order.scheduled_time || '10:00',
    status: 'pending',
    subtotal: order.subtotal || 0,
    addons_total: order.addons_total || 0,
    discount: order.discount || 0,
    total: order.total || 0,
    payment_method: order.payment_method || 'cash',
    payment_status: 'pending',
    promo_code: null,
    membership_id: null,
    notes: order.notes || null,
    rating: null,
    review: null,
    cancelled_at: null,
    cancellation_reason: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  await saveDemoOrders(userId, orders);
  return newOrder;
}

export async function updateDemoOrder(userId: string, id: string, updates: Partial<Order>): Promise<Order | null> {
  const orders = await getDemoOrders(userId);
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) return null;

  orders[index] = { ...orders[index], ...updates, updated_at: new Date().toISOString() };
  await saveDemoOrders(userId, orders);
  return orders[index];
}
