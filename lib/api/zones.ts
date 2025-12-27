import { supabase } from '../supabase';
import type { Zone, CountryCode } from '@/types';

// Extended zone type with polygon
export interface ZoneWithPolygon extends Zone {
  polygon?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface ZoneCheckResult {
  inServiceArea: boolean;
  zone: {
    id: string;
    name_en: string;
    name_ar: string;
    country: CountryCode;
  } | null;
}

// Ray casting algorithm to check if a point is inside a polygon
function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: { type: string; coordinates: number[][][] }
): boolean {
  if (!polygon || polygon.type !== 'Polygon' || !polygon.coordinates) {
    return false;
  }

  const coordinates = polygon.coordinates[0]; // Outer ring
  let inside = false;

  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const xi = coordinates[i][0]; // Current point longitude
    const yi = coordinates[i][1]; // Current point latitude
    const xj = coordinates[j][0]; // Previous point longitude
    const yj = coordinates[j][1]; // Previous point latitude

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

// Fetch all active zones for a country
export async function getZones(country: CountryCode): Promise<ZoneWithPolygon[]> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('country', country)
    .eq('is_active', true)
    .order('name_en');

  if (error) throw error;
  return (data as ZoneWithPolygon[]) || [];
}

// Check if coordinates are within a service area
export async function checkServiceArea(
  latitude: number,
  longitude: number,
  country?: CountryCode
): Promise<ZoneCheckResult> {
  try {
    // Fetch all active zones (optionally filter by country)
    let query = supabase
      .from('zones')
      .select('id, name_en, name_ar, country, polygon, is_active')
      .eq('is_active', true);

    if (country) {
      query = query.eq('country', country);
    }

    const { data: zones, error } = await query;

    if (error) {
      console.error('Error fetching zones:', error);
      return { inServiceArea: false, zone: null };
    }

    if (!zones || zones.length === 0) {
      return { inServiceArea: false, zone: null };
    }

    // Check each zone to see if the point is inside
    for (const zone of zones) {
      if (zone.polygon && isPointInPolygon(latitude, longitude, zone.polygon)) {
        return {
          inServiceArea: true,
          zone: {
            id: zone.id,
            name_en: zone.name_en,
            name_ar: zone.name_ar,
            country: zone.country as CountryCode,
          },
        };
      }
    }

    // Point is not in any zone
    return { inServiceArea: false, zone: null };
  } catch (error) {
    console.error('Error checking service area:', error);
    return { inServiceArea: false, zone: null };
  }
}

// Get the default zone for a country (first active zone)
export async function getDefaultZone(country: CountryCode): Promise<Zone | null> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('country', country)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching default zone:', error);
    return null;
  }

  return data as Zone;
}

// Get zone by ID
export async function getZoneById(id: string): Promise<Zone | null> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching zone:', error);
    return null;
  }

  return data as Zone;
}

// Get zone names for display
export function getZoneName(zone: { name_en: string; name_ar: string }, locale: 'en' | 'ar' = 'en'): string {
  return locale === 'ar' ? zone.name_ar : zone.name_en;
}
