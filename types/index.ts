export * from './database.types'

import type { Database } from './database.types'

// Convenience types for table rows
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Zone = Database['public']['Tables']['zones']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Addon = Database['public']['Tables']['addons']['Row']
export type Washer = Database['public']['Tables']['washers']['Row']
export type TimeSlot = Database['public']['Tables']['time_slots']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderAddon = Database['public']['Tables']['order_addons']['Row']
export type MembershipPlan = Database['public']['Tables']['membership_plans']['Row']
export type Membership = Database['public']['Tables']['memberships']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type VehicleInsert = Database['public']['Tables']['vehicles']['Insert']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type VehicleUpdate = Database['public']['Tables']['vehicles']['Update']
export type LocationUpdate = Database['public']['Tables']['locations']['Update']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

// Locale type
export type Locale = 'ar' | 'en'

// Country code type
export type CountryCode = 'EG' | 'AE'

// Extended types with relations
export interface OrderWithRelations extends Order {
  vehicle?: Vehicle
  location?: Location
  service?: Service
  washer?: Washer
  order_addons?: Array<{
    addon: Addon
    price: number
  }>
}

export interface ServiceCategoryWithServices extends ServiceCategory {
  services: Service[]
}

export interface ServiceWithAddons extends Service {
  addons: Addon[]
}

// Display-friendly types with localized fields resolved
export interface ServiceDisplay {
  id: string
  category_id: string
  slug: string
  name: string
  description: string | null
  duration_minutes: number
  price_sedan_eg: number | null
  price_suv_eg: number | null
  price_luxury_eg: number | null
  price_sedan_ae: number | null
  price_suv_ae: number | null
  price_luxury_ae: number | null
  features: string[]
  image_url: string | null
  service_type: 'exterior_interior' | 'exterior_only' | 'interior_only'
  is_recommended: boolean
  is_active: boolean
  display_order: number
}

export interface AddonDisplay {
  id: string
  service_id: string | null
  name: string
  description: string | null
  price_eg: number | null
  price_ae: number | null
  duration_minutes?: number
  addon_type: 'interior' | 'exterior' | 'both' | null
  is_active: boolean
}

export interface ZoneDisplay {
  id: string
  name: string
  country: CountryCode
  max_washers: number
  is_active: boolean
  polygon: {
    type: 'Polygon'
    coordinates: number[][][]
  } | null
}

// Utility function to convert Service to ServiceDisplay
export function toServiceDisplay(service: Service, locale: Locale = 'en'): ServiceDisplay {
  return {
    id: service.id,
    category_id: service.category_id,
    slug: service.slug,
    name: locale === 'ar' ? service.name_ar : service.name_en,
    description: locale === 'ar' ? service.description_ar : service.description_en,
    duration_minutes: service.duration_minutes,
    price_sedan_eg: service.price_sedan_eg,
    price_suv_eg: service.price_suv_eg,
    price_luxury_eg: service.price_luxury_eg,
    price_sedan_ae: service.price_sedan_ae,
    price_suv_ae: service.price_suv_ae,
    price_luxury_ae: service.price_luxury_ae,
    features: (locale === 'ar' ? service.features_ar : service.features_en) || [],
    image_url: service.image_url,
    service_type: 'exterior_interior', // Default, can be extended
    is_recommended: service.is_recommended,
    is_active: service.is_active,
    display_order: service.display_order,
  }
}

// Utility function to convert Addon to AddonDisplay
export function toAddonDisplay(addon: Addon, locale: Locale = 'en'): AddonDisplay {
  return {
    id: addon.id,
    service_id: addon.service_id,
    name: locale === 'ar' ? addon.name_ar : addon.name_en,
    description: locale === 'ar' ? addon.description_ar : addon.description_en,
    price_eg: addon.price_eg,
    price_ae: addon.price_ae,
    addon_type: addon.addon_type,
    is_active: addon.is_active,
  }
}

// Utility function to convert Zone to ZoneDisplay
export function toZoneDisplay(zone: Zone, locale: Locale = 'en'): ZoneDisplay {
  return {
    id: zone.id,
    name: locale === 'ar' ? zone.name_ar : zone.name_en,
    country: zone.country,
    max_washers: zone.max_washers,
    is_active: zone.is_active,
    polygon: zone.polygon,
  }
}

// Booking flow types
export interface BookingState {
  step: number
  country: 'EG' | 'AE'
  selectedVehicle: Vehicle | null
  selectedLocation: Location | null
  selectedService: Service | null
  selectedAddons: Addon[]
  selectedDate: Date | null
  selectedTimeSlot: TimeSlot | null
  specialInstructions: string
  promoCode: string | null
  paymentMethod: 'cash' | 'paymob' | 'instapay' | 'apple_pay' | 'google_pay' | null

  // Pricing
  basePrice: number
  addonsPrice: number
  discountAmount: number
  membershipDiscount: number
  totalAmount: number
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Time slot display type
export interface TimeSlotDisplay extends TimeSlot {
  displayTime: string
  isDisabled: boolean
  availableSlots: number
}

// Washer location for tracking
export interface WasherLocation {
  latitude: number
  longitude: number
  heading: number | null
  speed: number | null
  accuracy: number | null
  recordedAt: string
}

// Notification payload
export interface NotificationPayload {
  type: string
  orderId?: string
  title: string
  body: string
  data?: Record<string, unknown>
}
