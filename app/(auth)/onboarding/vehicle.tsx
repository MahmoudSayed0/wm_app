import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Search, X, Car, Crown, Truck } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { createVehicle } from '@/lib/api/vehicles';

// Vehicle types
const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
];

// Car makes by category
const CAR_MAKES_BY_CATEGORY = {
  luxury: {
    label: 'Luxury',
    icon: Crown,
    makes: [
      'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti', 'Cadillac',
      'Ferrari', 'Genesis', 'Jaguar', 'Lamborghini', 'Land Rover', 'Lexus',
      'Lincoln', 'Lotus', 'Maserati', 'McLaren', 'Mercedes-Benz', 'Mini',
      'Porsche', 'Rolls-Royce', 'Tesla', 'Volvo',
    ],
  },
  sedan: {
    label: 'Sedan & Hatchback',
    icon: Car,
    makes: [
      'Alfa Romeo', 'BAIC', 'BYD', 'Changan', 'Chery', 'Chevrolet',
      'Chrysler', 'Citroen', 'Dacia', 'Dongfeng', 'FAW', 'Fiat',
      'Ford', 'GAC', 'Geely', 'Honda', 'Hyundai', 'JAC', 'Kia',
      'Mazda', 'MG', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot',
      'Renault', 'Seat', 'Skoda', 'Subaru', 'Suzuki', 'Toyota',
      'Volkswagen', 'Zotye',
    ],
  },
  suv: {
    label: 'SUV & Crossover',
    icon: Truck,
    makes: [
      'BAIC', 'BYD', 'Changan', 'Chery', 'Dodge', 'Dongfeng', 'Ford',
      'GAC', 'Geely', 'GMC', 'Haval', 'Honda', 'Hyundai', 'Infiniti',
      'Isuzu', 'JAC', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln',
      'Mazda', 'Mercedes-Benz', 'MG', 'Mitsubishi', 'Nissan', 'Range Rover',
      'Subaru', 'Toyota', 'Volkswagen', 'Volvo', 'Zotye',
    ],
  },
};

// All makes for search (unique)
const ALL_MAKES = [...new Set([
  ...CAR_MAKES_BY_CATEGORY.luxury.makes,
  ...CAR_MAKES_BY_CATEGORY.sedan.makes,
  ...CAR_MAKES_BY_CATEGORY.suv.makes,
])].sort();

// Colors with names - Popular colors in Egypt & Dubai
const VEHICLE_COLORS = [
  // Row 1 - Most popular (White/Silver/Black)
  { value: '#FFFFFF', name: 'White' },
  { value: '#F5F5F5', name: 'Pearl White' },
  { value: '#C0C0C0', name: 'Silver' },
  { value: '#A9A9A9', name: 'Dark Silver' },
  { value: '#000000', name: 'Black' },
  // Row 2 - Grays & Blues
  { value: '#808080', name: 'Gray' },
  { value: '#36454F', name: 'Charcoal' },
  { value: '#001F3F', name: 'Navy' },
  { value: '#0047AB', name: 'Blue' },
  { value: '#87CEEB', name: 'Sky Blue' },
  // Row 3 - Warm colors (popular in Gulf)
  { value: '#F5F5DC', name: 'Beige' },
  { value: '#D4AF37', name: 'Champagne' },
  { value: '#FFD700', name: 'Gold' },
  { value: '#CD7F32', name: 'Bronze' },
  { value: '#8B4513', name: 'Brown' },
  // Row 4 - Other colors
  { value: '#800020', name: 'Burgundy' },
  { value: '#FF0000', name: 'Red' },
  { value: '#006400', name: 'Green' },
  { value: '#FFA500', name: 'Orange' },
  { value: '#4B0082', name: 'Purple' },
];

export default function VehicleOnboardingScreen() {
  const { updateProfile } = useAuth();
  const [vehicleType, setVehicleType] = useState('sedan');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('#FFFFFF');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%'], []);

  const selectedColor = useMemo(
    () => VEHICLE_COLORS.find((c) => c.value === color),
    [color]
  );

  // Filter makes based on search
  const filteredMakes = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return ALL_MAKES.filter((m) =>
      m.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const isValid = make && model && plate.length >= 3;

  const handleOpenSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setSearchQuery('');
  }, []);

  const handleSelectMake = useCallback((selectedMake: string) => {
    setMake(selectedMake);
    handleCloseSheet();
  }, [handleCloseSheet]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleContinue = async () => {
    if (!isValid) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    setSaving(true);
    try {
      await createVehicle({
        make,
        model,
        year: new Date().getFullYear(),
        type: vehicleType as 'sedan' | 'suv' | 'luxury',
        plate: plate.toUpperCase(),
        color,
        is_default: true,
      });

      await updateProfile({ onboarding_completed: true } as any);

      Toast.show({
        type: 'success',
        text1: 'Welcome to Washman!',
        text2: 'Your account is ready',
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save vehicle',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await updateProfile({ onboarding_completed: true } as any);
      router.replace('/(tabs)');
    } catch (error) {
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const renderCategorySection = (categoryKey: 'luxury' | 'sedan' | 'suv') => {
    const category = CAR_MAKES_BY_CATEGORY[categoryKey];
    const Icon = category.icon;

    return (
      <View key={categoryKey} style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: categoryKey === 'luxury' ? '#FEF3C7' : categoryKey === 'suv' ? '#DBEAFE' : '#D1FAE5',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              size={18}
              color={categoryKey === 'luxury' ? '#D97706' : categoryKey === 'suv' ? '#2563EB' : '#059669'}
            />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>
            {category.label}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {category.makes.map((carMake) => (
            <TouchableOpacity
              key={carMake}
              onPress={() => handleSelectMake(carMake)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: make === carMake ? Colors.primary : '#F3F4F6',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: make === carMake ? '#fff' : '#374151',
                  fontWeight: make === carMake ? '600' : '400',
                }}
              >
                {carMake}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar barStyle="dark-content" />

        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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

              {/* Title */}
              <Animated.View
                entering={FadeInDown.delay(100).duration(500)}
                style={{ alignItems: 'center', marginTop: 20, marginBottom: 28 }}
              >
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: 6,
                    textAlign: 'center',
                  }}
                >
                  Add Your First Vehicle
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#6B7280',
                    textAlign: 'center',
                  }}
                >
                  This helps us provide the right service
                </Text>
              </Animated.View>

              {/* Vehicle Type Selection */}
              <Animated.View
                entering={FadeInDown.delay(300).duration(500)}
                style={{ marginBottom: 20 }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: 10,
                  }}
                >
                  Vehicle Type <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {VEHICLE_TYPES.map((type) => {
                    const isSelected = vehicleType === type.value;
                    const TypeIcon = type.value === 'luxury' ? Crown : type.value === 'suv' ? Truck : Car;
                    return (
                      <TouchableOpacity
                        key={type.value}
                        onPress={() => setVehicleType(type.value)}
                        style={{
                          flex: 1,
                          paddingVertical: 14,
                          paddingHorizontal: 8,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: isSelected ? Colors.primary : '#E5E7EB',
                          backgroundColor: isSelected ? `${Colors.primary}10` : '#fff',
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <TypeIcon
                          size={20}
                          color={isSelected ? Colors.primary : '#9CA3AF'}
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: isSelected ? Colors.primary : '#6B7280',
                          }}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>

              {/* Make & Model */}
              <Animated.View
                entering={FadeInDown.delay(400).duration(500)}
                style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}
              >
                {/* Make Button - Opens Sheet */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 8,
                    }}
                  >
                    Make <Text style={{ color: '#EF4444' }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={handleOpenSheet}
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 14,
                      borderWidth: 2,
                      borderColor: make ? Colors.primary : '#E5E7EB',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: make ? '#1A1A1A' : '#9CA3AF',
                      }}
                    >
                      {make || 'Select make'}
                    </Text>
                    <ChevronDown size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Model Input */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 8,
                    }}
                  >
                    Model <Text style={{ color: '#EF4444' }}>*</Text>
                  </Text>
                  <TextInput
                    value={model}
                    onChangeText={setModel}
                    placeholder="e.g., Camry"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 14,
                      borderWidth: 2,
                      borderColor: model ? Colors.primary : '#E5E7EB',
                      fontSize: 15,
                      color: '#1A1A1A',
                    }}
                  />
                </View>
              </Animated.View>

              {/* License Plate */}
              <Animated.View
                entering={FadeInDown.delay(500).duration(500)}
                style={{ marginBottom: 20 }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: 8,
                  }}
                >
                  License Plate <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <View
                  style={{
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    borderColor: plate ? Colors.primary : '#D1D5DB',
                    borderRadius: 12,
                    paddingVertical: 4,
                  }}
                >
                  <TextInput
                    value={plate}
                    onChangeText={(text) => setPlate(text.toUpperCase())}
                    placeholder="A B C   1 2 3 4"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="characters"
                    style={{
                      fontSize: 22,
                      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                      letterSpacing: 4,
                      textAlign: 'center',
                      paddingVertical: 14,
                      color: '#374151',
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#9CA3AF',
                    textAlign: 'center',
                    marginTop: 6,
                  }}
                >
                  Helps the washer identify your car
                </Text>
              </Animated.View>

              {/* Car Color Picker */}
              <Animated.View
                entering={FadeInDown.delay(600).duration(500)}
                style={{ marginBottom: 20 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                    }}
                  >
                    Car Color
                  </Text>
                  {selectedColor && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: color,
                          borderWidth: 1,
                          borderColor: ['#FFFFFF', '#F5F5F5', '#F5F5DC'].includes(color) ? '#E5E7EB' : color,
                        }}
                      />
                      <Text style={{ fontSize: 13, color: '#6B7280' }}>
                        {selectedColor.name}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                  {VEHICLE_COLORS.map((colorOption) => {
                    const isSelected = color === colorOption.value;
                    const isDark = ['#000000', '#001F3F', '#36454F', '#006400', '#800020', '#4B0082', '#8B4513'].includes(colorOption.value);
                    const isLight = ['#FFFFFF', '#F5F5F5', '#F5F5DC'].includes(colorOption.value);
                    return (
                      <TouchableOpacity
                        key={colorOption.value}
                        onPress={() => setColor(colorOption.value)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: colorOption.value,
                          borderWidth: 2,
                          borderColor: isSelected ? Colors.primary : isLight ? '#E5E7EB' : colorOption.value,
                          alignItems: 'center',
                          justifyContent: 'center',
                          ...(isSelected && {
                            shadowColor: Colors.primary,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4,
                          }),
                        }}
                      >
                        {isSelected && (
                          <Check size={20} color={isDark ? '#fff' : '#374151'} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>

              {/* Vehicle Preview Card */}
              {(make || model || plate) && (
                <Animated.View
                  entering={FadeIn.duration(300)}
                  style={{
                    backgroundColor: `${Colors.primary}10`,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {vehicleType === 'luxury' ? (
                      <Crown size={24} color={Colors.primary} />
                    ) : vehicleType === 'suv' ? (
                      <Truck size={24} color={Colors.primary} />
                    ) : (
                      <Car size={24} color={Colors.primary} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: '#1A1A1A',
                      }}
                    >
                      {make || 'Make'} {model || 'Model'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      {plate && (
                        <View
                          style={{
                            backgroundColor: '#fff',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                              color: '#374151',
                            }}
                          >
                            {plate}
                          </Text>
                        </View>
                      )}
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: color,
                          borderWidth: 1,
                          borderColor: color === '#FFFFFF' ? '#E5E7EB' : color,
                        }}
                      />
                      {selectedColor && (
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {selectedColor.name}
                        </Text>
                      )}
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Spacer */}
              <View style={{ flex: 1, minHeight: 20 }} />

              {/* Continue Button */}
              <View style={{ paddingBottom: 20 }}>
                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={!isValid || saving}
                  style={{
                    backgroundColor: isValid ? Colors.primary : '#D1D5DB',
                    borderRadius: 16,
                    paddingVertical: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    shadowColor: Colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: isValid ? 0.3 : 0,
                    shadowRadius: 16,
                    elevation: isValid ? 8 : 0,
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
                    {saving ? 'Setting up...' : 'Get Started'}
                  </Text>
                  {!saving && <ArrowRight size={20} color="#fff" />}
                </TouchableOpacity>

                {/* Skip Button */}
                <TouchableOpacity
                  onPress={handleSkip}
                  disabled={saving}
                  style={{
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                    Skip for now
                  </Text>
                </TouchableOpacity>

                {/* Progress Dots */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                    paddingTop: 12,
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
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Bottom Sheet for Car Make Selection */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ borderRadius: 24 }}
          handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
        >
          {/* Header - Fixed */}
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A' }}>
                Select Car Make
              </Text>
              <TouchableOpacity onPress={handleCloseSheet}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                paddingHorizontal: 14,
                marginBottom: 16,
              }}
            >
              <Search size={20} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search car make..."
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  fontSize: 16,
                  color: '#1A1A1A',
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Scrollable Content */}
          <BottomSheetScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredMakes ? (
              // Search Results
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                  {filteredMakes.length} result{filteredMakes.length !== 1 ? 's' : ''} found
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {filteredMakes.map((carMake) => (
                    <TouchableOpacity
                      key={carMake}
                      onPress={() => handleSelectMake(carMake)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 20,
                        backgroundColor: make === carMake ? Colors.primary : '#F3F4F6',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: make === carMake ? '#fff' : '#374151',
                          fontWeight: make === carMake ? '600' : '400',
                        }}
                      >
                        {carMake}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {filteredMakes.length === 0 && (
                  <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 20 }}>
                    No car makes found matching "{searchQuery}"
                  </Text>
                )}
              </View>
            ) : (
              // Categories
              <>
                {renderCategorySection('luxury')}
                {renderCategorySection('sedan')}
                {renderCategorySection('suv')}
              </>
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}
