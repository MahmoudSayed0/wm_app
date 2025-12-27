import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Locate,
  Map,
  Home,
  Building2,
  CheckCircle2,
} from 'lucide-react-native';
import * as ExpoLocation from 'expo-location';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { createLocation, reverseGeocode } from '@/lib/api/locations';
import { checkServiceArea, type ZoneCheckResult } from '@/lib/api/zones';
import MapLocationPicker from '@/components/maps/MapLocationPicker';

const LABEL_PRESETS = [
  { value: 'Home', icon: Home },
  { value: 'Work', icon: Building2 },
  { value: 'Other', icon: MapPin },
];

export default function LocationOnboardingScreen() {
  const [selectedLabel, setSelectedLabel] = useState('Home');
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  } | null>(null);
  const [zoneInfo, setZoneInfo] = useState<ZoneCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUseCurrentLocation = async () => {
    try {
      setLocating(true);

      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature');
        return;
      }

      const locationResult = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      const geocoded = await reverseGeocode(
        locationResult.coords.latitude,
        locationResult.coords.longitude
      );

      setLocation({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        address: geocoded?.address || 'Current Location',
        city: geocoded?.city || 'Unknown',
      });

      // Check service area
      const zoneResult = await checkServiceArea(
        locationResult.coords.latitude,
        locationResult.coords.longitude
      );
      setZoneInfo(zoneResult);

      Toast.show({
        type: 'success',
        text1: 'Location Found',
        text2: geocoded?.address || 'Your current location',
      });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setLocating(false);
    }
  };

  const handleMapLocationSelect = (selectedLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    zoneInfo: ZoneCheckResult | null;
  }) => {
    setLocation({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: selectedLocation.address,
      city: selectedLocation.city,
    });
    setZoneInfo(selectedLocation.zoneInfo);
    setShowMapPicker(false);
  };

  const handleContinue = async () => {
    if (!location) {
      Toast.show({
        type: 'error',
        text1: 'Location Required',
        text2: 'Please select a location to continue',
      });
      return;
    }

    setSaving(true);
    try {
      await createLocation({
        label: selectedLabel,
        address: location.address,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        zone_id: zoneInfo?.zone?.id,
        is_default: true,
      });

      // Navigate to vehicle onboarding
      router.push('/(auth)/onboarding/vehicle');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save location',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/onboarding/vehicle');
  };

  // Show map picker fullscreen
  if (showMapPicker) {
    return (
      <MapLocationPicker
        initialLatitude={location?.latitude}
        initialLongitude={location?.longitude}
        onLocationSelect={handleMapLocationSelect}
        onClose={() => setShowMapPicker(false)}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
            }}
          >
            <ArrowLeft size={22} color="#6B7280" />
          </TouchableOpacity>

          {/* Content */}
          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 20 }}>
            {/* Map Icon */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              style={{ alignItems: 'center', marginBottom: 24 }}
            >
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 24,
                  backgroundColor: '#FEF3C7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={48} color="#F59E0B" />
              </View>
            </Animated.View>

            {/* Title */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              style={{ alignItems: 'center', marginBottom: 32 }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: '#1A1A1A',
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                Where's Your Car?
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: '#6B7280',
                  textAlign: 'center',
                }}
              >
                Add your primary location for car wash services
              </Text>
            </Animated.View>

            {/* Label Selection */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              style={{ marginBottom: 20 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: 12,
                }}
              >
                Location Type
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {LABEL_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedLabel === preset.value;
                  return (
                    <TouchableOpacity
                      key={preset.value}
                      onPress={() => setSelectedLabel(preset.value)}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        paddingVertical: 14,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: isSelected ? Colors.primary : '#E5E7EB',
                        backgroundColor: isSelected ? `${Colors.primary}10` : '#fff',
                      }}
                    >
                      <Icon size={18} color={isSelected ? Colors.primary : '#6B7280'} />
                      <Text
                        style={{
                          fontWeight: '600',
                          color: isSelected ? Colors.primary : '#6B7280',
                        }}
                      >
                        {preset.value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* Location Selection Buttons */}
            <Animated.View
              entering={FadeInDown.delay(400).duration(500)}
              style={{ marginBottom: 20 }}
            >
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={handleUseCurrentLocation}
                  disabled={locating}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 16,
                    backgroundColor: `${Colors.primary}15`,
                    borderRadius: 12,
                  }}
                >
                  {locating ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Locate size={20} color={Colors.primary} />
                  )}
                  <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                    {locating ? 'Getting...' : 'Current Location'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowMapPicker(true)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 16,
                    backgroundColor: '#EFF6FF',
                    borderRadius: 12,
                  }}
                >
                  <Map size={20} color="#3B82F6" />
                  <Text style={{ color: '#3B82F6', fontWeight: '600' }}>
                    Pick on Map
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Selected Location Card */}
            {location && (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={{
                  backgroundColor: zoneInfo?.inServiceArea ? '#ECFDF5' : '#FEF2F2',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: zoneInfo?.inServiceArea ? '#D1FAE5' : '#FEE2E2',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {zoneInfo?.inServiceArea ? (
                      <CheckCircle2 size={20} color="#10B981" />
                    ) : (
                      <MapPin size={20} color="#EF4444" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: zoneInfo?.inServiceArea ? '#065F46' : '#991B1B',
                        marginBottom: 2,
                      }}
                    >
                      {zoneInfo?.inServiceArea ? 'In Service Area' : 'Outside Service Area'}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: zoneInfo?.inServiceArea ? '#047857' : '#B91C1C',
                      }}
                      numberOfLines={2}
                    >
                      {location.address}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: zoneInfo?.inServiceArea ? '#059669' : '#DC2626',
                        marginTop: 2,
                      }}
                    >
                      {location.city}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Continue Button */}
            <Animated.View entering={FadeIn.delay(500).duration(500)}>
              <TouchableOpacity
                onPress={handleContinue}
                disabled={!location || saving}
                style={{
                  backgroundColor: location ? Colors.primary : '#D1D5DB',
                  borderRadius: 16,
                  paddingVertical: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: location ? 0.3 : 0,
                  shadowRadius: 16,
                  elevation: location ? 8 : 0,
                  marginBottom: 12,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: '600',
                  }}
                >
                  {saving ? 'Saving...' : 'Continue'}
                </Text>
                {!saving && <ArrowRight size={20} color="#fff" />}
              </TouchableOpacity>

              {/* Skip Button */}
              <TouchableOpacity
                onPress={handleSkip}
                style={{
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                  Skip for now
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Progress Dots */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                paddingBottom: 20,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: Colors.primary,
                }}
              />
              <View
                style={{
                  width: 24,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: Colors.primary,
                }}
              />
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#E5E7EB',
                }}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
