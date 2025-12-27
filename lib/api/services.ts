import { supabase } from '../supabase';
import type {
  Service,
  ServiceCategory,
  ServiceCategoryWithServices,
  Addon,
  TimeSlot,
  CountryCode,
} from '@/types';

// Get all service categories with services
export async function getServiceCategories(
  country: CountryCode
): Promise<ServiceCategoryWithServices[]> {
  const { data: categories, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .contains('countries', [country])
    .order('display_order');

  if (error) throw error;
  if (!categories) return [];

  // Fetch services for each category
  const categoriesWithServices = await Promise.all(
    categories.map(async (category) => {
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('category_id', category.id)
        .eq('is_active', true)
        .order('display_order');

      // Filter services that have pricing for the country
      const filteredServices = (services || []).filter((service) => {
        if (country === 'EG') {
          return (
            service.price_sedan_eg ||
            service.price_suv_eg ||
            service.price_luxury_eg
          );
        }
        return (
          service.price_sedan_ae ||
          service.price_suv_ae ||
          service.price_luxury_ae
        );
      });

      return {
        ...category,
        services: filteredServices,
      };
    })
  );

  return categoriesWithServices;
}

// Get a single service with addons
export async function getService(id: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Get addons for a service (or global addons)
export async function getAddons(
  serviceId?: string,
  country?: CountryCode
): Promise<Addon[]> {
  let query = supabase.from('addons').select('*').eq('is_active', true);

  if (serviceId) {
    query = query.or(`service_id.eq.${serviceId},service_id.is.null`);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Filter addons that have pricing for the country
  if (country && data) {
    return data.filter((addon) => {
      if (country === 'EG') return addon.price_eg !== null;
      return addon.price_ae !== null;
    });
  }

  return data || [];
}

// Get available time slots for a date
export async function getTimeSlots(
  zoneId: string,
  date: string
): Promise<TimeSlot[]> {
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .eq('zone_id', zoneId)
    .eq('slot_date', date)
    .order('slot_hour');

  if (error) throw error;

  // If no slots exist, generate demo slots
  if (!data || data.length === 0) {
    return generateDemoSlots(zoneId, date);
  }

  return data;
}

// Generate demo time slots for a date (matching Next.js web app)
function generateDemoSlots(zoneId: string, date: string): TimeSlot[] {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();

  // Friday is off (day 5 in JS - holiday in Egypt)
  if (dayOfWeek === 5) {
    return [];
  }

  // Maintenance days (10th, 20th, 30th)
  const dayOfMonth = dateObj.getDate();
  if ([10, 20, 30].includes(dayOfMonth)) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const maxCapacity = 4;

  // Operating hours: 1PM - 10PM (13-22) - matching web app
  for (let hour = 13; hour < 22; hour++) {
    // Vary availability based on time
    let bookedCount = 0;

    // Peak hours (5-8 PM) are more booked
    const isPeakHour = hour >= 17 && hour <= 20;

    if (isPeakHour) {
      // Peak hours: some full, some limited
      bookedCount = hour === 18 ? 4 : (hour === 19 ? 3 : 2);
    } else if (hour === 13 || hour === 21) {
      // First and last slots - limited
      bookedCount = 3;
    } else {
      // Other hours - available with some bookings
      bookedCount = Math.floor(Math.random() * 2);
    }

    slots.push({
      id: `demo-${date}-${hour}`,
      zone_id: zoneId,
      slot_date: date,
      slot_hour: hour,
      max_capacity: maxCapacity,
      booked_count: bookedCount,
      created_at: new Date().toISOString(),
    });
  }

  return slots;
}

// Zone functions are exported from zones.ts
