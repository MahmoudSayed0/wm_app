import { supabase, getCurrentUser } from '../supabase';
import type { Location, LocationInsert, LocationUpdate } from '@/types';
import type { Database } from '@/types/database.types';
import { isDemoUser, getDemoLocations, addDemoLocation, updateDemoLocation, deleteDemoLocation } from '../demo-storage';

type LocationRow = Database['public']['Tables']['locations']['Row'];
type LocationInsertRow = Database['public']['Tables']['locations']['Insert'];
type LocationUpdateRow = Database['public']['Tables']['locations']['Update'];

// Fetch all locations for current user
export async function getLocations(): Promise<Location[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode - use local storage
  if (isDemoUser(user.id)) {
    return getDemoLocations(user.id);
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get a single location
export async function getLocation(id: string): Promise<Location | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    const locations = await getDemoLocations(user.id);
    return locations.find(l => l.id === id) || null;
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new location
export async function createLocation(
  location: Omit<LocationInsert, 'user_id'>
): Promise<Location> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    return addDemoLocation(user.id, location as any);
  }

  // If setting as default, unset other defaults first
  if (location.is_default) {
    await supabase
      .from('locations')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { data, error } = await supabase
    .from('locations')
    .insert({
      ...location,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a location
export async function updateLocation(
  id: string,
  updates: LocationUpdate
): Promise<Location> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    const updated = await updateDemoLocation(user.id, id, updates as any);
    if (!updated) throw new Error('Location not found');
    return updated;
  }

  // If setting as default, unset other defaults first
  if (updates.is_default) {
    await supabase
      .from('locations')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .neq('id', id);
  }

  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a location
export async function deleteLocation(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    await deleteDemoLocation(user.id, id);
    return;
  }

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

// Set location as default
export async function setDefaultLocation(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Demo mode
  if (isDemoUser(user.id)) {
    await updateDemoLocation(user.id, id, { is_default: true });
    return;
  }

  // Unset all defaults
  await supabase
    .from('locations')
    .update({ is_default: false })
    .eq('user_id', user.id);

  // Set new default
  await supabase
    .from('locations')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', user.id);
}

// Reverse geocode coordinates to address
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ address: string; city: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Washman Mobile App',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const address = data.display_name || '';
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.state ||
      '';

    return { address, city };
  } catch {
    return null;
  }
}
