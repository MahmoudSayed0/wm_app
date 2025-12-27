import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

interface CarIconProps {
  size?: number;
  color?: string;
}

// Vehicle type images
const VEHICLE_IMAGES = {
  sedan: require('@/assets/images/vehicles/sedan.png'),
  suv: require('@/assets/images/vehicles/SUV.png'),
  luxury: require('@/assets/images/vehicles/luxury.png'),
} as const;

type VehicleType = 'sedan' | 'suv' | 'luxury';

interface VehicleImageProps {
  type: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

// Normalize vehicle type to lowercase
function normalizeVehicleType(type: string): VehicleType {
  const normalized = type.toLowerCase() as VehicleType;
  if (normalized in VEHICLE_IMAGES) {
    return normalized;
  }
  return 'sedan'; // Default fallback
}

// Image-based vehicle icon component
export function VehicleImage({ type, size = 100, style }: VehicleImageProps) {
  const normalizedType = normalizeVehicleType(type);
  const imageSource = VEHICLE_IMAGES[normalizedType];

  if (!imageSource) {
    return null;
  }

  return (
    <Image
      source={imageSource}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

// Get vehicle image source
export function getVehicleImage(type: string) {
  const normalizedType = normalizeVehicleType(type);
  return VEHICLE_IMAGES[normalizedType];
}

// Sedan Car Icon
export function SedanIcon({ size = 100, color = '#1a1a1a' }: CarIconProps) {
  const scale = size / 100;
  const height = 48 * scale;

  return (
    <Svg width={size} height={height} viewBox="0 0 100 48" fill="none">
      {/* Main Body */}
      <Path
        d="M8 34C8 34 12 32 20 30C28 28 40 26 50 26C60 26 72 28 80 30C88 32 92 34 92 34"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Roof */}
      <Path
        d="M30 26C30 26 35 16 50 16C65 16 70 26 70 26"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Window */}
      <Path
        d="M35 24C35 24 40 18 50 18C60 18 65 24 65 24"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Front Wheel */}
      <Circle cx="24" cy="36" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="24" cy="36" r="4" stroke={color} strokeWidth="1" fill="none" />
      {/* Rear Wheel */}
      <Circle cx="76" cy="36" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="76" cy="36" r="4" stroke={color} strokeWidth="1" fill="none" />
      {/* Ground Shadow */}
      <Ellipse cx="50" cy="46" rx="35" ry="2" fill="#e5e5e5" opacity={0.5} />
      {/* Headlight */}
      <Ellipse cx="12" cy="32" rx="2" ry="1.5" stroke={color} strokeWidth="0.8" fill="none" />
      {/* Taillight */}
      <Ellipse cx="88" cy="32" rx="2" ry="1.5" stroke={color} strokeWidth="0.8" fill="none" />
    </Svg>
  );
}

// SUV Car Icon
export function SUVIcon({ size = 100, color = '#1a1a1a' }: CarIconProps) {
  const scale = size / 100;
  const height = 47 * scale;

  return (
    <Svg width={size} height={height} viewBox="0 0 100 47" fill="none">
      {/* Main Body - Taller */}
      <Path
        d="M8 36C8 36 12 34 20 32C28 30 40 28 50 28C60 28 72 30 80 32C88 34 92 36 92 36"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Roof - Boxy */}
      <Path
        d="M25 28C25 28 28 12 50 12C72 12 75 28 75 28"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Window */}
      <Path
        d="M30 26C30 26 33 15 50 15C67 15 70 26 70 26"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Roof Rails */}
      <Path
        d="M32 12L68 12"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Front Wheel - Larger */}
      <Circle cx="24" cy="38" r="9" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="24" cy="38" r="5" stroke={color} strokeWidth="1" fill="none" />
      {/* Rear Wheel - Larger */}
      <Circle cx="76" cy="38" r="9" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="76" cy="38" r="5" stroke={color} strokeWidth="1" fill="none" />
      {/* Ground Shadow */}
      <Ellipse cx="50" cy="46" rx="35" ry="1" fill="#e5e5e5" opacity={0.5} />
      {/* Headlight */}
      <Path
        d="M10 32C12 31 14 31 15 32"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Taillight */}
      <Path
        d="M85 32C87 31 89 31 90 32"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

// Luxury Car Icon
export function LuxuryIcon({ size = 100, color = '#1a1a1a' }: CarIconProps) {
  const scale = size / 100;
  const height = 48 * scale;

  return (
    <Svg width={size} height={height} viewBox="0 0 100 48" fill="none">
      {/* Main Body - Lower, sportier silhouette */}
      <Path
        d="M8 32C8 32 10 28 14 26C18 24 28 22 35 21C42 20 48 16 56 14C64 12 72 11 78 12C84 13 90 16 92 20C94 24 94 28 94 32"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Roof Line - Low, aggressive profile */}
      <Path
        d="M35 21C35 21 40 14 50 12C60 10 68 10 75 12C82 14 86 18 88 20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Window - Wraparound style */}
      <Path
        d="M40 18C40 18 45 14 52 13C59 12 66 12 72 14C76 15.5 80 18 82 20"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Side Skirt - Aggressive */}
      <Path
        d="M18 32C18 32 30 33 50 33C70 33 82 32 86 32"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Front Wheel */}
      <Circle cx="24" cy="34" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="24" cy="34" r="5" stroke={color} strokeWidth="1" fill="none" />
      <Circle cx="24" cy="34" r="2" stroke={color} strokeWidth="0.8" fill="none" />
      {/* Rear Wheel */}
      <Circle cx="76" cy="34" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="76" cy="34" r="5" stroke={color} strokeWidth="1" fill="none" />
      <Circle cx="76" cy="34" r="2" stroke={color} strokeWidth="0.8" fill="none" />
      {/* Ground Shadow */}
      <Ellipse cx="50" cy="44" rx="38" ry="2" fill="#e5e5e5" opacity={0.5} />
      {/* Headlight - Angular */}
      <Path
        d="M12 26C14 25 16 25 17 26"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx="14" cy="26" rx="2" ry="1" stroke={color} strokeWidth="0.8" fill="none" />
      {/* Taillight - LED strip style */}
      <Path
        d="M90 24C90 24 91 26 91 28C91 30 90 31 90 31"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Mirror */}
      <Ellipse cx="38" cy="20" rx="1.5" ry="1" stroke={color} strokeWidth="0.8" fill="none" />
    </Svg>
  );
}

// Export a helper to get icon by vehicle type
export function getVehicleIcon(type: 'sedan' | 'suv' | 'luxury') {
  switch (type) {
    case 'sedan':
      return SedanIcon;
    case 'suv':
      return SUVIcon;
    case 'luxury':
      return LuxuryIcon;
    default:
      return SedanIcon;
  }
}
