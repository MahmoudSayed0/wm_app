// Washman Brand Colors - Matching NextJS App
// Primary: Teal #1F8783
// Brand Beige: #F9EFDB

export const primary = '#1F8783'; // Teal - Main brand color
export const primaryLight = '#2A9D99'; // Lighter teal for dark mode
export const brandBeige = '#F9EFDB'; // Cream/Beige accent
export const brandBeigeForeground = '#5C4A2A'; // Text on beige background

const Colors = {
  primary,
  primaryLight,
  brandBeige,
  brandBeigeForeground,
  light: {
    text: '#1A1A2E', // Dark foreground
    textSecondary: '#71717A', // Muted foreground
    background: '#FCFCFC', // Near white
    card: '#FFFFFF',
    border: '#E4E4E7', // Light gray border
    tint: primary,
    tabIconDefault: '#9CA3AF', // gray-400
    tabIconSelected: primary,
    // Additional semantic colors
    muted: '#F4F4F5',
    accent: '#E6F4F3', // Light teal accent
    accentForeground: '#1A4D4A',
  },
  dark: {
    text: '#F4F4F5', // Light foreground
    textSecondary: '#A1A1AA', // Muted foreground dark
    background: '#1A1A2E', // Dark background
    card: '#27273A', // Dark card
    border: '#3F3F52', // Dark border
    tint: primaryLight,
    tabIconDefault: '#71717A', // gray-500
    tabIconSelected: primaryLight,
    // Additional semantic colors
    muted: '#27273A',
    accent: '#1A3A38', // Dark teal accent
    accentForeground: '#A7D9D6',
  },
  status: {
    pending: '#F59E0B', // amber-500
    confirmed: '#3B82F6', // blue-500
    assigned: '#8B5CF6', // purple-500
    on_the_way: '#3B82F6', // blue-500
    arrived: '#10B981', // emerald-500
    in_progress: '#3B82F6', // blue-500
    completed: '#10B981', // emerald-500
    cancelled: '#EF4444', // red-500
  },
  semantic: {
    success: '#10B981', // emerald-500
    successForeground: '#FFFFFF',
    warning: '#F59E0B', // amber-500
    warningForeground: '#422006',
    destructive: '#EF4444', // red-500
    destructiveForeground: '#FFFFFF',
  },
};

export default Colors;
