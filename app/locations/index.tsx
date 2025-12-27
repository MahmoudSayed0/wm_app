import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Home,
  Building2,
  Trash2,
  Star,
  Navigation,
  X,
  Locate,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Map,
} from 'lucide-react-native';
import * as ExpoLocation from 'expo-location';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { Button } from '@/components/ui';
import { t, getLocale } from '@/lib/i18n';
import type { Location } from '@/types';
import {
  getLocations,
  createLocation,
  deleteLocation,
  setDefaultLocation,
  reverseGeocode,
} from '@/lib/api/locations';
import { checkServiceArea, type ZoneCheckResult } from '@/lib/api/zones';
import MapLocationPicker from '@/components/maps/MapLocationPicker';

const LABEL_PRESETS = [
  { value: 'Home', label: 'Home', labelAr: 'المنزل', icon: Home },
  { value: 'Work', label: 'Work', labelAr: 'العمل', icon: Building2 },
  { value: 'Other', label: 'Other', labelAr: 'آخر', icon: MapPin },
];

function LocationCard({
  location,
  onSetDefault,
  onDelete,
  loading,
}: {
  location: Location;
  onSetDefault: () => void;
  onDelete: () => void;
  loading?: boolean;
}) {
  const Icon = location.label.toLowerCase().includes('home')
    ? Home
    : location.label.toLowerCase().includes('work')
    ? Building2
    : MapPin;

  // Check if location has a zone_id (meaning it's in a service area)
  const isInServiceArea = !!location.zone_id;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center gap-4">
        <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
          <Icon size={22} color={Colors.primary} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="font-bold text-gray-900 dark:text-white text-base">
              {location.label}
            </Text>
            {location.is_default && (
              <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                <Text className="text-primary text-[10px] font-semibold">
                  {t('locations.default')}
                </Text>
              </View>
            )}
          </View>
          <Text
            className="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
            numberOfLines={1}
          >
            {location.address}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {location.city}
            </Text>
            {/* Service Area Status Badge */}
            {location.latitude && location.longitude && (
              <View
                className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
                  isInServiceArea ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}
              >
                {isInServiceArea ? (
                  <CheckCircle2 size={10} color="#10B981" />
                ) : (
                  <XCircle size={10} color="#EF4444" />
                )}
                <Text
                  className={`text-[10px] font-medium ${
                    isInServiceArea ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isInServiceArea ? 'In Service Area' : 'Outside Service Area'}
                </Text>
              </View>
            )}
          </View>
        </View>
        {location.latitude && location.longitude && (
          <TouchableOpacity className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 items-center justify-center">
            <Navigation size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Warning for outside service area */}
      {location.latitude && location.longitude && !isInServiceArea && (
        <View className="flex-row items-center gap-2 mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
          <AlertCircle size={16} color="#F59E0B" />
          <Text className="text-xs text-amber-700 dark:text-amber-400 flex-1">
            This location is outside our service area. You may not be able to book from here.
          </Text>
        </View>
      )}

      {/* Actions */}
      <View className="flex-row gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        {!location.is_default && (
          <TouchableOpacity
            onPress={onSetDefault}
            disabled={loading}
            className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-xl bg-gray-100 dark:bg-gray-700"
          >
            <Star size={14} color="#6B7280" />
            <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t('locations.setDefault')}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onDelete}
          disabled={loading}
          className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-xl bg-red-50 dark:bg-red-900/20"
        >
          <Trash2 size={14} color="#EF4444" />
          <Text className="text-xs font-medium text-red-600">{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddLocationModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (location: {
    label: string;
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
    zone_id?: string;
    is_default: boolean;
  }) => Promise<void>;
}) {
  const [label, setLabel] = useState('Home');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [zoneInfo, setZoneInfo] = useState<ZoneCheckResult | null>(null);
  const [checkingZone, setCheckingZone] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const resetForm = () => {
    setLabel('Home');
    setAddress('');
    setCity('');
    setLatitude(null);
    setLongitude(null);
    setIsDefault(false);
    setZoneInfo(null);
  };

  // Handle map location selection
  const handleMapLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    zoneInfo: ZoneCheckResult | null;
  }) => {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setAddress(location.address);
    setCity(location.city);
    setZoneInfo(location.zoneInfo);
    setShowMapPicker(false);
  };

  // Check service area when coordinates change
  const checkZone = async (lat: number, lng: number) => {
    setCheckingZone(true);
    try {
      const result = await checkServiceArea(lat, lng);
      setZoneInfo(result);
    } catch (error) {
      console.error('Zone check error:', error);
      setZoneInfo(null);
    } finally {
      setCheckingZone(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLocating(true);

      // Request permission
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      // Get current location
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      // Reverse geocode
      const geocoded = await reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );

      if (geocoded) {
        setAddress(geocoded.address);
        setCity(geocoded.city);
      }

      // Check service area
      await checkZone(location.coords.latitude, location.coords.longitude);

      Toast.show({
        type: 'success',
        text1: 'Location Found',
        text2: 'Address filled automatically',
      });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    if (!label.trim() || !address.trim() || !city.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Warn if outside service area
    if (latitude && longitude && zoneInfo && !zoneInfo.inServiceArea) {
      Alert.alert(
        'Outside Service Area',
        'This location is outside our service area. You can still save it, but may not be able to book services here.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => performSave() },
        ]
      );
      return;
    }

    await performSave();
  };

  const performSave = async () => {
    setSaving(true);
    try {
      await onSave({
        label: label.trim(),
        address: address.trim(),
        city: city.trim(),
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        zone_id: zoneInfo?.zone?.id,
        is_default: isDefault,
      });
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add location');
    } finally {
      setSaving(false);
    }
  };

  // Show map picker
  if (showMapPicker) {
    return (
      <Modal visible={visible} animationType="slide">
        <MapLocationPicker
          initialLatitude={latitude || undefined}
          initialLongitude={longitude || undefined}
          onLocationSelect={handleMapLocationSelect}
          onClose={() => setShowMapPicker(false)}
        />
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gray-50 dark:bg-gray-900"
      >
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('locations.addLocation')}
            </Text>
            <View className="w-6" />
          </View>

          <ScrollView className="flex-1 px-4 py-4">
            {/* Location Selection Buttons */}
            <View className="flex-row gap-3 mb-6">
              {/* Use Current Location */}
              <TouchableOpacity
                onPress={handleUseCurrentLocation}
                disabled={locating}
                className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-primary/10 rounded-xl"
              >
                {locating ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Locate size={20} color={Colors.primary} />
                )}
                <Text className="text-primary font-medium text-sm">
                  {locating ? 'Getting...' : 'Current Location'}
                </Text>
              </TouchableOpacity>

              {/* Pick on Map */}
              <TouchableOpacity
                onPress={() => setShowMapPicker(true)}
                className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
              >
                <Map size={20} color="#3B82F6" />
                <Text className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                  Pick on Map
                </Text>
              </TouchableOpacity>
            </View>

            {/* Label Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('locations.label')}
              </Text>
              <View className="flex-row gap-2">
                {LABEL_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.value}
                    onPress={() => setLabel(preset.value)}
                    className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
                      label === preset.value
                        ? 'bg-primary border-primary'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <preset.icon
                      size={16}
                      color={label === preset.value ? '#FFFFFF' : '#6B7280'}
                    />
                    <Text
                      className={`font-medium ${
                        label === preset.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Label (if Other) */}
            {label === 'Other' && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Label *
                </Text>
                <TextInput
                  value={label}
                  onChangeText={setLabel}
                  placeholder="Enter a label..."
                  className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            {/* Address */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('locations.address')} *
              </Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="123 Main Street, New Cairo..."
                multiline
                numberOfLines={2}
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholderTextColor="#9CA3AF"
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>

            {/* City */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('locations.city')} *
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="Cairo, Dubai..."
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Coordinates and Zone Status */}
            {latitude && longitude && (
              <View className="mb-4">
                <View className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </Text>
                </View>

                {/* Zone Status Badge */}
                <View className="mt-2">
                  {checkingZone ? (
                    <View className="flex-row items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                      <ActivityIndicator size="small" color={Colors.primary} />
                      <Text className="text-xs text-gray-600 dark:text-gray-400">
                        Checking service area...
                      </Text>
                    </View>
                  ) : zoneInfo ? (
                    <View
                      className={`flex-row items-center gap-2 p-3 rounded-xl ${
                        zoneInfo.inServiceArea
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}
                    >
                      {zoneInfo.inServiceArea ? (
                        <>
                          <CheckCircle2 size={18} color="#10B981" />
                          <View className="flex-1">
                            <Text className="text-sm font-medium text-green-700 dark:text-green-400">
                              In Service Area
                            </Text>
                            {zoneInfo.zone && (
                              <Text className="text-xs text-green-600 dark:text-green-500">
                                Zone: {getLocale() === 'ar' ? zoneInfo.zone.name_ar : zoneInfo.zone.name_en}
                              </Text>
                            )}
                          </View>
                        </>
                      ) : (
                        <>
                          <XCircle size={18} color="#EF4444" />
                          <View className="flex-1">
                            <Text className="text-sm font-medium text-red-600 dark:text-red-400">
                              Outside Service Area
                            </Text>
                            <Text className="text-xs text-red-500 dark:text-red-500">
                              We don't currently serve this location
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  ) : null}
                </View>
              </View>
            )}

            {/* Set as Default */}
            <TouchableOpacity
              onPress={() => setIsDefault(!isDefault)}
              className="flex-row items-center justify-between py-4 mb-6"
            >
              <Text className="text-base text-gray-700 dark:text-gray-300">
                {t('locations.setDefault')}
              </Text>
              <View
                className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
                  isDefault ? 'bg-primary border-primary' : 'border-gray-300'
                }`}
              >
                {isDefault && <Text className="text-white text-xs">✓</Text>}
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Save Button */}
          <View className="px-4 pb-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={saving}
              onPress={handleSave}
            >
              {t('common.save')}
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function LocationsScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to load locations:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load locations',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleSetDefault = async (id: string) => {
    setActionLoading(true);
    try {
      await setDefaultLocation(id);
      await loadLocations();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Default location updated',
      });
    } catch (error) {
      console.error('Failed to set default:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update default location',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('common.delete'),
      'Are you sure you want to delete this location?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteLocation(id);
              await loadLocations();
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Location removed successfully',
              });
            } catch (error) {
              console.error('Failed to delete:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete location',
              });
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAddLocation = async (location: {
    label: string;
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
    zone_id?: string;
    is_default: boolean;
  }) => {
    await createLocation({
      label: location.label,
      address: location.address,
      city: location.city,
      latitude: location.latitude,
      longitude: location.longitude,
      zone_id: location.zone_id,
      is_default: location.is_default,
    });
    await loadLocations();
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: location.zone_id
        ? 'Location added - in service area!'
        : 'Location added (outside service area)',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center justify-between px-4 h-16">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
          >
            <ArrowLeft size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="font-semibold text-lg text-gray-900 dark:text-white">
            {t('locations.title')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
          >
            <Plus size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {locations.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                <MapPin size={40} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No locations yet
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
                Add your first location to get started
              </Text>
              <Button variant="primary" size="lg" onPress={() => setShowAddModal(true)}>
                <View className="flex-row items-center gap-2">
                  <Plus size={18} color="white" />
                  <Text className="text-white font-semibold">{t('locations.addLocation')}</Text>
                </View>
              </Button>
            </View>
          ) : (
            locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onSetDefault={() => handleSetDefault(location.id)}
                onDelete={() => handleDelete(location.id)}
                loading={actionLoading}
              />
            ))
          )}
        </ScrollView>
      )}

      <AddLocationModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddLocation}
      />
    </SafeAreaView>
  );
}
