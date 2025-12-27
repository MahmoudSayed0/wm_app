/**
 * Washman Design Tokens
 *
 * Central design system tokens for consistent styling across the app.
 * Import and use these instead of hardcoding values.
 */

import { Platform, TextStyle, ViewStyle } from 'react-native';

// =============================================================================
// COLORS
// =============================================================================

export const Colors = {
  // Brand
  primary: '#1F8783',
  primaryDark: '#12504E',
  primaryLight: 'rgba(31, 135, 131, 0.1)',

  // Background
  background: '#FCFCFC',
  white: '#FFFFFF',
  inputBg: '#F9FAFB',
  inputBgAlt: '#F3F4F6',
  inputBgDark: '#F2F2F2',

  // Text
  textPrimary: '#090909',
  textSecondary: '#1A1A1A',
  textTertiary: '#374151',
  textMuted: '#6B7280',
  textPlaceholder: '#9CA3AF',
  textLight: '#949494',
  textDisabled: '#BBBBBB',
  textInverse: '#FCFCFC',

  // Border
  border: '#E5E7EB',
  borderLight: '#D1D5DB',

  // Status
  success: '#22C55E',
  successLight: '#DCFCE7',
  successDark: '#166534',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorBorder: '#FECACA',
  errorAlt: '#EF4444',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  // Category
  luxuryBg: '#FEF3C7',
  luxuryIcon: '#D97706',
  sedanBg: '#D1FAE5',
  sedanIcon: '#059669',
  suvBg: '#DBEAFE',
  suvIcon: '#2563EB',
} as const;

// =============================================================================
// GRADIENTS
// =============================================================================

export const Gradients = {
  primary: {
    colors: ['#1F8783', '#12504E'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  disabled: {
    colors: ['#BBBBBB', '#999999'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const FontFamily = {
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  monospace: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
  '4xl': 24,
  '5xl': 25,
  '6xl': 26,
  otp: 30,
} as const;

export const FontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const TextStyles: Record<string, TextStyle> = {
  heading1: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  heading2: {
    fontSize: 25,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  heading3: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  heading4: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textTertiary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  button: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textInverse,
  },
  buttonLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  captionSmall: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textPlaceholder,
  },
  otp: {
    fontSize: 30,
    fontWeight: '500',
    color: Colors.primary,
  },
  licensePlate: {
    fontSize: 22,
    fontFamily: FontFamily.monospace,
    letterSpacing: 4,
    textAlign: 'center',
    color: Colors.textTertiary,
  },
};

// =============================================================================
// SPACING
// =============================================================================

export const Spacing = {
  0: 0,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const ScreenPadding = {
  horizontal: 24,
  horizontalAlt: 20,
  top: 8,
  bottom: 20,
  bottomLarge: 40,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 22,
  '4xl': 24,
  full: 70,
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  selectedItem: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;

// =============================================================================
// COMPONENT STYLES
// =============================================================================

export const ComponentStyles = {
  // Buttons
  buttonPrimary: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  buttonPrimaryLarge: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  buttonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.inputBgAlt,
  } as ViewStyle,

  buttonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.inputBgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Inputs
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  } as ViewStyle & TextStyle,

  inputFocused: {
    borderColor: Colors.primary,
  } as ViewStyle,

  inputOtp: {
    width: 45,
    height: 45,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.inputBgDark,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  inputLicensePlate: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
    paddingVertical: 4,
  } as ViewStyle,

  // Cards
  card: {
    borderRadius: BorderRadius.xl,
    padding: 16,
    backgroundColor: Colors.white,
  } as ViewStyle,

  cardPreview: {
    borderRadius: BorderRadius.xl,
    padding: 16,
    backgroundColor: Colors.primaryLight,
  } as ViewStyle,

  // Badge/Chip
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 32,
  } as ViewStyle,

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius['2xl'],
  } as ViewStyle,

  // Color Picker
  colorPickerItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Bottom Sheet
  bottomSheetBackground: {
    borderRadius: BorderRadius['4xl'],
  } as ViewStyle,

  bottomSheetHandle: {
    backgroundColor: Colors.borderLight,
    width: 40,
  } as ViewStyle,

  // Error Box
  errorBox: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
    borderRadius: BorderRadius.lg,
    padding: 16,
  } as ViewStyle,

  // Success Circle
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Progress Dots
  progressDotActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  } as ViewStyle,

  progressDotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  } as ViewStyle,
};

// =============================================================================
// ICONS
// =============================================================================

export const IconSizes = {
  xs: 14,
  sm: 18,
  md: 20,
  lg: 22,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

// =============================================================================
// ANIMATIONS
// =============================================================================

export const AnimationDuration = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

export const AnimationDelay = {
  stagger: 100,
  success: 1000,
} as const;

// =============================================================================
// VEHICLE COLORS
// =============================================================================

export interface VehicleColor {
  value: string;
  name: string;
  isDark: boolean;
}

export const VehicleColors: VehicleColor[] = [
  // Row 1 - Most popular (White/Silver/Black)
  { value: '#FFFFFF', name: 'White', isDark: false },
  { value: '#F5F5F5', name: 'Pearl White', isDark: false },
  { value: '#C0C0C0', name: 'Silver', isDark: false },
  { value: '#A9A9A9', name: 'Dark Silver', isDark: false },
  { value: '#000000', name: 'Black', isDark: true },
  // Row 2 - Grays & Blues
  { value: '#808080', name: 'Gray', isDark: false },
  { value: '#36454F', name: 'Charcoal', isDark: true },
  { value: '#001F3F', name: 'Navy', isDark: true },
  { value: '#0047AB', name: 'Blue', isDark: false },
  { value: '#87CEEB', name: 'Sky Blue', isDark: false },
  // Row 3 - Warm colors (popular in Gulf)
  { value: '#F5F5DC', name: 'Beige', isDark: false },
  { value: '#D4AF37', name: 'Champagne', isDark: false },
  { value: '#FFD700', name: 'Gold', isDark: false },
  { value: '#CD7F32', name: 'Bronze', isDark: false },
  { value: '#8B4513', name: 'Brown', isDark: true },
  // Row 4 - Other colors
  { value: '#800020', name: 'Burgundy', isDark: true },
  { value: '#FF0000', name: 'Red', isDark: false },
  { value: '#006400', name: 'Green', isDark: true },
  { value: '#FFA500', name: 'Orange', isDark: false },
  { value: '#4B0082', name: 'Purple', isDark: true },
];

// Light colors that need border
export const LightColorValues = ['#FFFFFF', '#F5F5F5', '#F5F5DC'];

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get keyboard avoiding behavior based on platform
 */
export const getKeyboardBehavior = () =>
  Platform.OS === 'ios' ? 'padding' : 'height';

/**
 * Check if a color is considered dark (needs white text/icon)
 */
export const isColorDark = (hex: string): boolean => {
  const color = VehicleColors.find(c => c.value === hex);
  return color?.isDark ?? false;
};

/**
 * Check if a color needs a visible border
 */
export const needsBorder = (hex: string): boolean =>
  LightColorValues.includes(hex);

export default {
  Colors,
  Gradients,
  FontFamily,
  FontSize,
  FontWeight,
  TextStyles,
  Spacing,
  ScreenPadding,
  BorderRadius,
  Shadows,
  ComponentStyles,
  IconSizes,
  AnimationDuration,
  AnimationDelay,
  VehicleColors,
};
