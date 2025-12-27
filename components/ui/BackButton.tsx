import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ChevronLeft } from 'lucide-react-native';
import Svg, { Path, G, ClipPath, Defs, Rect } from 'react-native-svg';

import { useThemeStore } from '@/stores';

interface BackButtonProps {
  onPress?: () => void;
  label?: string;
  showLabel?: boolean;
  variant?: 'default' | 'pill';
}

export default function BackButton({
  onPress,
  label = 'Back',
  showLabel = false,
  variant = 'pill',
}: BackButtonProps) {
  const { isDarkMode } = useThemeStore();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  if (variant === 'pill') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.pillButton,
          {
            backgroundColor: isDarkMode ? '#2D2D3A' : '#F7F7F7',
            borderColor: isDarkMode ? '#4A4A5A' : '#BBBBBB',
          },
        ]}
      >
        <ChevronLeft
          size={24}
          color={isDarkMode ? '#FFFFFF' : '#1A1A2E'}
          strokeWidth={2}
        />
        {showLabel && (
          <Text
            style={[
              styles.pillLabel,
              { color: isDarkMode ? '#FFFFFF' : '#1A1A2E' },
            ]}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Default circular style
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.circleButton,
        {
          backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
        },
      ]}
    >
      <ArrowLeft size={20} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 25,
    borderWidth: 0.6,
    gap: 4,
    minWidth: 60,
  },
  pillLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
