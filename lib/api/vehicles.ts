import { supabase, getCurrentUser } from '../supabase';
import type { Vehicle, VehicleInsert, VehicleUpdate } from '@/types';
import { isDemoUser, getDemoVehicles, addDemoVehicle, updateDemoVehicle, deleteDemoVehicle } from '../demo-storage';

// Fetch all vehicles for current user
export async function getVehicles(): Promise<Vehicle[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode - use local storage
  if (isDemoUser(user.id)) {
    return getDemoVehicles(user.id);
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get a single vehicle
export async function getVehicle(id: string): Promise<Vehicle | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    const vehicles = await getDemoVehicles(user.id);
    return vehicles.find(v => v.id === id) || null;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new vehicle
export async function createVehicle(
  vehicle: Omit<VehicleInsert, 'user_id'>
): Promise<Vehicle> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    return addDemoVehicle(user.id, vehicle as any);
  }

  // If setting as default, unset other defaults first
  if (vehicle.is_default) {
    await supabase
      .from('vehicles')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      ...vehicle,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a vehicle
export async function updateVehicle(
  id: string,
  updates: VehicleUpdate
): Promise<Vehicle> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    const updated = await updateDemoVehicle(user.id, id, updates as any);
    if (!updated) throw new Error('Vehicle not found');
    return updated;
  }

  // If setting as default, unset other defaults first
  if (updates.is_default) {
    await supabase
      .from('vehicles')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .neq('id', id);
  }

  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a vehicle
export async function deleteVehicle(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    await deleteDemoVehicle(user.id, id);
    return;
  }

  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

// Set vehicle as default
export async function setDefaultVehicle(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    await updateDemoVehicle(user.id, id, { is_default: true });
    return;
  }

  // Unset all defaults
  await supabase
    .from('vehicles')
    .update({ is_default: false })
    .eq('user_id', user.id);

  // Set new default
  await supabase
    .from('vehicles')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', user.id);
}
