import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency based on country
export function formatCurrency(
  amount: number,
  country: 'EG' | 'AE' = 'EG'
): string {
  const currency = country === 'EG' ? 'EGP' : 'AED';
  return `${currency} ${amount.toFixed(0)}`;
}

// Format date for display
export function formatDate(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

// Format time for display
export function formatTime(time: string, locale: string = 'en'): string {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);

  return date.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Format phone number
export function formatPhone(phone: string): string {
  // Remove non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format for Egypt (+20)
  if (cleaned.startsWith('20')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }

  // Format for UAE (+971)
  if (cleaned.startsWith('971')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
  }

  return phone;
}

// Generate order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `WM-${timestamp}-${random}`;
}

// Validate Egyptian phone number
export function isValidEgyptPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Egyptian mobile numbers: 010, 011, 012, 015 followed by 8 digits
  return /^(20)?(10|11|12|15)\d{8}$/.test(cleaned);
}

// Validate UAE phone number
export function isValidUAEPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // UAE mobile numbers: 50, 52, 54, 55, 56, 58 followed by 7 digits
  return /^(971)?(50|52|54|55|56|58)\d{7}$/.test(cleaned);
}

// Get greeting based on time of day
export function getGreeting(locale: string = 'en'): string {
  const hour = new Date().getHours();

  if (locale === 'ar') {
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  }

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Calculate distance between two coordinates (in km)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}
