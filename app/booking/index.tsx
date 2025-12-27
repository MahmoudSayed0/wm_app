import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Car,
  MapPin,
  Clock,
  CreditCard,
  Check,
  Plus,
  Home,
  Building2,
  Banknote,
  Smartphone,
  Sparkles,
  Droplets,
  Package,
  Sun,
  Moon,
  X,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { Button, BackButton, BottomSheet } from '@/components/ui';
import { useBookingStore, useAuthStore } from '@/stores';
import { VehicleImage } from '@/components/icons/CarIcons';
import { getVehicles } from '@/lib/api/vehicles';
import { getLocations } from '@/lib/api/locations';
import { createOrder } from '@/lib/api/orders';
import { getService, getAddons, getTimeSlots } from '@/lib/api/services';
import { getDefaultZone } from '@/lib/api/zones';
import type { Vehicle, Location as LocationType, TimeSlot, CountryCode, ServiceDisplay, AddonDisplay } from '@/types';
import { toServiceDisplay, toAddonDisplay } from '@/types';

// Demo services for fallback
const demoServices: Record<string, ServiceDisplay> = {
  'express-glow': {
    id: 'express-glow',
    category_id: 'car-wash',
    slug: 'express-glow',
    name: 'Express Glow',
    description: 'Quick exterior wash and interior refresh.',
    duration_minutes: 25,
    price_sedan_eg: 120,
    price_suv_eg: 150,
    price_luxury_eg: 180,
    price_sedan_ae: 45,
    price_suv_ae: 55,
    price_luxury_ae: 70,
    service_type: 'exterior_interior',
    is_recommended: true,
    is_active: true,
    display_order: 1,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    features: ['Exterior hand wash', 'Interior vacuum', 'Window cleaning', 'Dashboard wipe-down', 'Air freshener'],
  },
};

// Demo addons
const demoAddons: AddonDisplay[] = [
  {
    id: 'addon-1',
    service_id: null,
    name: 'Engine Cleaning',
    description: 'Deep clean engine bay',
    price_eg: 80,
    price_ae: 30,
    duration_minutes: 15,
    addon_type: 'exterior',
    is_active: true,
  },
  {
    id: 'addon-2',
    service_id: null,
    name: 'Ceramic Coating',
    description: 'Premium ceramic protection',
    price_eg: 150,
    price_ae: 55,
    duration_minutes: 20,
    addon_type: 'exterior',
    is_active: true,
  },
  {
    id: 'addon-3',
    service_id: null,
    name: 'Leather Treatment',
    description: 'Condition and protect leather',
    price_eg: 100,
    price_ae: 40,
    duration_minutes: 15,
    addon_type: 'interior',
    is_active: true,
  },
  {
    id: 'addon-4',
    service_id: null,
    name: 'Headlight Restoration',
    description: 'Restore foggy headlights',
    price_eg: 120,
    price_ae: 45,
    duration_minutes: 20,
    addon_type: 'exterior',
    is_active: true,
  },
];

// Demo fallback data
// Demo vehicles/locations are only for UI display - user must add real ones to create orders
const demoVehicles: Vehicle[] = [];
const demoLocations: LocationType[] = [];

type WashType = 'full' | 'exterior' | 'interior';

// Step configuration
interface StepConfig {
  id: string;
  label: string;
  shortLabel: string;
}

function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: StepConfig[];
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      {steps.map((step, index) => {
        const isCompleted = index + 1 < currentStep;
        const isActive = index + 1 === currentStep;

        return (
          <View key={step.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Step Circle */}
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: isActive ? 38 : 30,
                  height: isActive ? 38 : 30,
                  borderRadius: 19,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCompleted ? Colors.primary : isActive ? Colors.brandBeige : '#F3F4F6',
                  borderWidth: isActive ? 2 : 0,
                  borderColor: Colors.primary,
                  shadowColor: isActive ? Colors.primary : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isActive ? 0.25 : 0,
                  shadowRadius: 4,
                  elevation: isActive ? 3 : 0,
                }}
              >
                {isCompleted ? (
                  <Check size={16} color="white" strokeWidth={3} />
                ) : (
                  <Text
                    style={{
                      fontSize: isActive ? 15 : 12,
                      fontWeight: '700',
                      color: isActive ? Colors.primary : '#9CA3AF',
                    }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 6,
                  fontWeight: isActive ? '600' : '500',
                  color: isCompleted || isActive ? Colors.primary : '#9CA3AF',
                }}
              >
                {step.shortLabel}
              </Text>
            </View>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <View style={{ marginHorizontal: 4, marginTop: -16, width: 16 }}>
                <View
                  style={{
                    height: 3,
                    width: '100%',
                    backgroundColor: isCompleted ? Colors.primary : '#E5E7EB',
                    borderRadius: 2,
                  }}
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function VehicleCard({
  vehicle,
  isSelected,
  onSelect,
}: {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.7}>
      <View
        className={`p-4 rounded-2xl border-2 ${
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}
      >
        <View className="flex-row items-center gap-4">
          <View
            className={`w-16 h-14 rounded-xl items-center justify-center overflow-hidden ${
              isSelected ? 'bg-primary/10' : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <VehicleImage type={vehicle.type as 'sedan' | 'suv' | 'luxury'} size={56} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </Text>
            <View className="flex-row items-center gap-2 mt-0.5">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {vehicle.year} • {vehicle.type.toUpperCase()}
              </Text>
              <Text className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {vehicle.plate}
              </Text>
            </View>
          </View>
          <View
            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              isSelected ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {isSelected && <Check size={12} color="white" />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function LocationCard({
  location,
  isSelected,
  onSelect,
}: {
  location: LocationType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = location.label.toLowerCase().includes('home') ? Home : Building2;
  const isInServiceArea = !!location.zone_id;

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.7}>
      <View
        className={`p-4 rounded-2xl border-2 ${
          isSelected
            ? 'border-primary bg-primary/5'
            : !isInServiceArea && location.latitude
            ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
            : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}
      >
        <View className="flex-row items-center gap-4">
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              isSelected ? 'bg-primary/10' : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <Icon size={20} color={isSelected ? Colors.primary : '#9CA3AF'} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-semibold text-gray-900 dark:text-white">
                {location.label}
              </Text>
              {location.latitude && location.longitude && (
                <View
                  className={`px-1.5 py-0.5 rounded ${
                    isInServiceArea ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  }`}
                >
                  <Text
                    className={`text-[8px] font-medium ${
                      isInServiceArea ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isInServiceArea ? 'IN AREA' : 'OUT OF AREA'}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className="text-sm text-gray-500 dark:text-gray-400"
              numberOfLines={1}
            >
              {location.address}
            </Text>
          </View>
          <View
            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              isSelected ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {isSelected && <Check size={12} color="white" />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function WashTypeCard({
  title,
  description,
  icon: Icon,
  features,
  isSelected,
  onSelect,
}: {
  title: string;
  description: string;
  icon: any;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.7}>
      <View
        className={`p-5 rounded-2xl border-2 ${
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}
      >
        <View className="flex-row items-start gap-4">
          <View
            className={`w-14 h-14 rounded-2xl items-center justify-center ${
              isSelected ? 'bg-primary/10' : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <Icon size={28} color={isSelected ? Colors.primary : '#9CA3AF'} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="font-bold text-gray-900 dark:text-white text-lg">
                {title}
              </Text>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  isSelected ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {isSelected && <Check size={14} color="white" />}
              </View>
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-3">
              {features.map((feature, index) => (
                <View
                  key={index}
                  className={`px-2.5 py-1 rounded-full ${
                    isSelected ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      isSelected ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function AddonCard({
  addon,
  isSelected,
  onToggle,
  country,
}: {
  addon: AddonDisplay;
  isSelected: boolean;
  onToggle: () => void;
  country: CountryCode;
}) {
  const price = country === 'EG' ? addon.price_eg : addon.price_ae;
  const currency = country === 'EG' ? 'EGP' : 'AED';

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <View
        className={`p-4 rounded-2xl border-2 ${
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}
      >
        <View className="flex-row items-center gap-3">
          <View
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              isSelected ? 'bg-primary/10' : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <Package size={20} color={isSelected ? Colors.primary : '#9CA3AF'} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 dark:text-white">
              {addon.name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
              {addon.description}
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-semibold text-primary">
              +{currency} {price}
            </Text>
            {addon.duration_minutes && (
              <Text className="text-[10px] text-gray-400">
                +{addon.duration_minutes} min
              </Text>
            )}
          </View>
          <View
            className={`w-5 h-5 rounded items-center justify-center ${
              isSelected ? 'bg-primary' : 'border border-gray-300 dark:border-gray-600'
            }`}
          >
            {isSelected && <Check size={12} color="white" />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PaymentMethodCard({
  title,
  description,
  icon: Icon,
  isSelected,
  onSelect,
}: {
  title: string;
  description: string;
  icon: any;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.7}>
      <View
        className={`p-4 rounded-2xl border-2 ${
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}
      >
        <View className="flex-row items-center gap-4">
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              isSelected ? 'bg-primary/10' : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <Icon size={20} color={isSelected ? Colors.primary : '#9CA3AF'} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 dark:text-white">
              {title}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </Text>
          </View>
          <View
            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              isSelected ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {isSelected && <Check size={12} color="white" />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BookingScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const { isAuthenticated, detectedCountry } = useAuthStore();
  const country: CountryCode = detectedCountry || 'EG';
  const currency = country === 'EG' ? 'EGP' : 'AED';

  // Booking store
  const bookingStore = useBookingStore();

  // Data state
  const [service, setService] = useState<ServiceDisplay | null>(null);
  const [addons, setAddons] = useState<AddonDisplay[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentZoneId, setCurrentZoneId] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form state
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedWashType, setSelectedWashType] = useState<WashType | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePeriod, setActivePeriod] = useState<'afternoon' | 'evening'>('afternoon');
  const [showIncludesSheet, setShowIncludesSheet] = useState(false);

  // Determine if wash type step is needed
  const needsWashTypeStep = service?.service_type === 'exterior_interior';
  const hasAddons = addons.length > 0;

  // Dynamic steps configuration
  const steps = useMemo(() => {
    const stepList: StepConfig[] = [
      { id: 'vehicle', label: 'Select Vehicle', shortLabel: 'Vehicle' },
    ];

    if (needsWashTypeStep) {
      stepList.push({ id: 'washType', label: 'Wash Type', shortLabel: 'Type' });
    }

    if (hasAddons) {
      stepList.push({ id: 'addons', label: 'Add-ons', shortLabel: 'Extras' });
    }

    stepList.push(
      { id: 'location', label: 'Select Location', shortLabel: 'Location' },
      { id: 'time', label: 'Date & Time', shortLabel: 'Time' },
      { id: 'payment', label: 'Payment', shortLabel: 'Pay' }
    );

    return stepList;
  }, [needsWashTypeStep, hasAddons]);

  const totalSteps = steps.length;

  // Get current step ID
  const getCurrentStepId = () => steps[step - 1]?.id || 'vehicle';

  // Load data
  useEffect(() => {
    loadData();
  }, [serviceId, isAuthenticated, country]);

  const loadData = async () => {
    setLoadingData(true);

    try {
      // Load service
      let loadedService: ServiceDisplay | null = null;
      if (serviceId) {
        try {
          const rawService = await getService(serviceId);
          if (rawService) {
            loadedService = toServiceDisplay(rawService, 'en');
          }
        } catch (e) {
          console.log('Service not found in DB, using demo');
        }
      }
      if (!loadedService) {
        loadedService = demoServices[serviceId || 'express-glow'] || demoServices['express-glow'];
      }
      setService(loadedService);

      // Load addons
      try {
        const rawAddons = await getAddons(loadedService.id, country);
        if (rawAddons.length > 0) {
          const displayAddons = rawAddons.map(a => toAddonDisplay(a, 'en'));
          setAddons(displayAddons);
        } else {
          setAddons(demoAddons);
        }
      } catch (e) {
        setAddons(demoAddons);
      }

      // Load vehicles and locations
      if (isAuthenticated) {
        const [vehiclesData, locationsData] = await Promise.all([
          getVehicles(),
          getLocations(),
        ]);

        const finalVehicles = vehiclesData.length > 0 ? vehiclesData : demoVehicles;
        const finalLocations = locationsData.length > 0 ? locationsData : demoLocations;

        setVehicles(finalVehicles);
        setLocations(finalLocations);

        // Set defaults
        const defaultVehicle = finalVehicles.find(v => v.is_default) || finalVehicles[0];
        if (defaultVehicle) setSelectedVehicle(defaultVehicle.id);

        const defaultLocation = finalLocations.find(l => l.is_default) || finalLocations[0];
        if (defaultLocation) setSelectedLocation(defaultLocation.id);
      } else {
        setVehicles(demoVehicles);
        setLocations(demoLocations);
        setSelectedVehicle(demoVehicles.find(v => v.is_default)?.id || null);
      }

      // Load time slots and store zone ID
      try {
        const zone = await getDefaultZone(country);
        if (zone) {
          setCurrentZoneId(zone.id);
          const todayStr = format(new Date(), 'yyyy-MM-dd');
          const slots = await getTimeSlots(zone.id, todayStr);
          setTimeSlots(slots);
        } else {
          // Generate demo slots if no zone
          setTimeSlots(generateDemoTimeSlots());
        }
      } catch (e) {
        // Generate demo slots on error
        setTimeSlots(generateDemoTimeSlots());
      }
    } catch (error) {
      console.error('Failed to load booking data:', error);
      setVehicles(demoVehicles);
      setLocations(demoLocations);
      setAddons(demoAddons);
      setSelectedVehicle(demoVehicles.find(v => v.is_default)?.id || null);
    } finally {
      setLoadingData(false);
    }
  };

  // Generate demo time slots (matching web app hours: 1PM-10PM)
  const generateDemoTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const maxCapacity = 4;

    // Operating hours: 1PM - 10PM (13-22)
    for (let hour = 13; hour < 22; hour++) {
      // Vary availability based on time
      let bookedCount = 0;
      const isPeakHour = hour >= 17 && hour <= 20;

      if (isPeakHour) {
        bookedCount = hour === 18 ? 4 : (hour === 19 ? 3 : 2);
      } else if (hour === 13 || hour === 21) {
        bookedCount = 3;
      } else {
        bookedCount = Math.floor(Math.random() * 2);
      }

      slots.push({
        id: `slot-${hour}`,
        zone_id: 'demo',
        slot_date: format(selectedDate, 'yyyy-MM-dd'),
        slot_hour: hour,
        max_capacity: maxCapacity,
        booked_count: bookedCount,
        created_at: new Date().toISOString(),
      });
    }
    return slots;
  };

  // Reload time slots when selected date changes
  useEffect(() => {
    const loadSlotsForDate = async () => {
      if (!currentZoneId) {
        // No zone, generate demo slots
        setTimeSlots(generateDemoTimeSlots());
        return;
      }

      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const slots = await getTimeSlots(currentZoneId, dateStr);
        setTimeSlots(slots);
        // Clear selected slot when date changes
        setSelectedTimeSlot(null);
      } catch (e) {
        console.error('Failed to load time slots:', e);
        setTimeSlots(generateDemoTimeSlots());
      } finally {
        setLoadingSlots(false);
      }
    };

    // Only run after initial data load
    if (!loadingData) {
      loadSlotsForDate();
    }
  }, [selectedDate, currentZoneId, loadingData]);

  // Get price based on vehicle type
  const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);
  const vehicleType = selectedVehicleData?.type || 'sedan';

  const getServicePrice = useCallback(() => {
    if (!service) return 0;
    if (country === 'EG') {
      if (vehicleType === 'luxury') return service.price_luxury_eg || 0;
      if (vehicleType === 'suv') return service.price_suv_eg || 0;
      return service.price_sedan_eg || 0;
    } else {
      if (vehicleType === 'luxury') return service.price_luxury_ae || 0;
      if (vehicleType === 'suv') return service.price_suv_ae || 0;
      return service.price_sedan_ae || 0;
    }
  }, [service, vehicleType, country]);

  const getAddonsTotal = useCallback(() => {
    return selectedAddons.reduce((total, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) {
        return total + (country === 'EG' ? (addon.price_eg || 0) : (addon.price_ae || 0));
      }
      return total;
    }, 0);
  }, [selectedAddons, addons, country]);

  const totalPrice = getServicePrice() + getAddonsTotal();

  // Auto-set wash type for single-type packages
  useEffect(() => {
    if (service && !needsWashTypeStep) {
      if (service.service_type === 'exterior_only') {
        setSelectedWashType('exterior');
      } else if (service.service_type === 'interior_only') {
        setSelectedWashType('interior');
      }
    }
  }, [needsWashTypeStep, service]);

  // Handle step navigation
  const handleContinue = async () => {
    if (step < totalSteps) {
      const currentStepId = getCurrentStepId();

      // Warn if location is outside service area
      if (currentStepId === 'location') {
        const selectedLocationData = locations.find(l => l.id === selectedLocation);
        if (selectedLocationData?.latitude && !selectedLocationData?.zone_id) {
          Alert.alert(
            'Location Outside Service Area',
            'The selected location is outside our service area. Continue anyway?',
            [
              { text: 'Go Back', style: 'cancel' },
              { text: 'Continue', onPress: () => setStep(step + 1) },
            ]
          );
          return;
        }
      }

      setStep(step + 1);
    } else {
      // Submit booking
      await handleSubmitBooking();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);

    try {
      if (!isAuthenticated) {
        Toast.show({
          type: 'info',
          text1: 'Demo Mode',
          text2: 'Login to save your bookings',
        });
        setTimeout(() => {
          setIsSubmitting(false);
          router.replace('/(tabs)/orders' as any);
        }, 1500);
        return;
      }

      if (!selectedVehicle || !selectedLocation || !selectedTimeSlot || !service) {
        Alert.alert('Error', 'Please complete all booking steps');
        setIsSubmitting(false);
        return;
      }

      const selectedLocationData = locations.find(l => l.id === selectedLocation);
      const timeSlotData = timeSlots.find(t => t.id === selectedTimeSlot);
      const timeString = timeSlotData ? `${timeSlotData.slot_hour}:00` : '09:00';

      // Create order
      const addonNames = selectedAddons.map(id => {
        const addon = addons.find(a => a.id === id);
        return addon?.name || '';
      }).filter(Boolean);

      const notes = [
        selectedWashType ? `Wash Type: ${selectedWashType}` : '',
        addonNames.length > 0 ? `Extras: ${addonNames.join(', ')}` : '',
      ].filter(Boolean).join('. ');

      const order = await createOrder({
        vehicleId: selectedVehicle,
        locationId: selectedLocation,
        scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
        scheduledTime: timeString,
        paymentMethod: paymentMethod as 'cash' | 'paymob',
        notes: notes || undefined,
        serviceName: service.name,
        servicePrice: totalPrice,
      });

      Toast.show({
        type: 'success',
        text1: 'Booking Confirmed!',
        text2: `Order #${order.order_number} has been placed`,
      });

      router.replace(`/orders/${order.id}` as any);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      Alert.alert(
        'Booking Failed',
        error.message || 'Unable to create your booking. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canContinue = () => {
    const currentStepId = getCurrentStepId();
    switch (currentStepId) {
      case 'vehicle':
        return selectedVehicle !== null;
      case 'washType':
        return selectedWashType !== null;
      case 'addons':
        return true; // Addons are optional
      case 'location':
        return selectedLocation !== null;
      case 'time':
        return selectedTimeSlot !== null;
      case 'payment':
        return paymentMethod !== null;
      default:
        return false;
    }
  };

  // Toggle addon selection
  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  // Generate dates for the next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDateDisplay = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      isToday: date.toDateString() === new Date().toDateString(),
    };
  };

  // Format time slot
  const formatTimeSlot = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Get slot status
  const getSlotStatus = (slot: TimeSlot): 'available' | 'limited' | 'full' => {
    const remaining = slot.max_capacity - slot.booked_count;
    if (remaining <= 0) return 'full';
    if (remaining <= 2) return 'limited';
    return 'available';
  };

  // Group slots by period (afternoon: 1-5PM, evening: 5-10PM)
  const groupedSlots = useMemo(() => {
    const afternoon = timeSlots.filter(s => s.slot_hour >= 13 && s.slot_hour < 17);
    const evening = timeSlots.filter(s => s.slot_hour >= 17 && s.slot_hour < 22);
    return { afternoon, evening };
  }, [timeSlots]);

  const displaySlots = activePeriod === 'afternoon' ? groupedSlots.afternoon : groupedSlots.evening;

  // Show loading while fetching data
  if (loadingData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading booking data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepId = getCurrentStepId();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center gap-3 px-4 h-16">
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
          >
            <ArrowLeft size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="font-semibold text-lg text-gray-900 dark:text-white">
            Book Service
          </Text>
        </View>
      </View>

      {/* Service Info Card */}
      {service && (
        <View className="mx-4 mt-4 mb-2">
          <View className="relative rounded-2xl overflow-hidden shadow-md">
            <Image
              source={{ uri: service.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop' }}
              style={{ width: '100%', aspectRatio: 3 }}
              contentFit="cover"
            />
            <View className="absolute inset-0 bg-black/60" />
            <View className="absolute top-3 left-3">
              <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-white/90">
                <Clock size={12} color="#6B7280" />
                <Text className="text-xs font-medium text-gray-700">
                  {service.duration_minutes} min
                </Text>
              </View>
            </View>
            <View className="absolute bottom-0 left-0 right-0 p-4">
              <View className="flex-row items-end justify-between gap-3">
                <View>
                  <Text className="text-white text-lg font-bold">
                    {service.name}
                  </Text>
                  <Text className="text-white/70 text-xs mt-0.5" numberOfLines={1}>
                    {service.description}
                  </Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">{currency} {totalPrice}</Text>
                  {selectedAddons.length > 0 && (
                    <Text className="text-[10px] text-white/70 text-right">
                      +{selectedAddons.length} extras
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Includes Chip - Tap to see all */}
          {service.features && service.features.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowIncludesSheet(true)}
              activeOpacity={0.7}
              className="mt-3 flex-row items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            >
              <View className="flex-row items-center gap-2">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: Colors.brandBeige }}
                >
                  <Sparkles size={16} color={Colors.primary} />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    {service.features.length} items included
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Tap to see what's included
                  </Text>
                </View>
              </View>
              <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center">
                <Plus size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Step Indicator */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-4">
        <StepIndicator currentStep={step} steps={steps} />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Selection */}
        {currentStepId === 'vehicle' && (
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Car size={20} color={Colors.primary} />
                <Text className="font-semibold text-gray-900 dark:text-white">
                  Select Your Vehicle
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/vehicles' as any)}
                className="flex-row items-center gap-1"
              >
                <Plus size={16} color={Colors.primary} />
                <Text className="text-primary text-sm font-medium">Add</Text>
              </TouchableOpacity>
            </View>
            {vehicles.length === 0 ? (
              <View className="items-center py-12 px-6">
                <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                  <Car size={40} color="#9CA3AF" />
                </View>
                <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                  No Vehicles Yet
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
                  Add your first vehicle to start booking car wash services
                </Text>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => router.push('/vehicles' as any)}
                >
                  <View className="flex-row items-center gap-2">
                    <Plus size={18} color="white" />
                    <Text className="text-white font-semibold">Add Vehicle</Text>
                  </View>
                </Button>
              </View>
            ) : (
              <View className="gap-3">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isSelected={selectedVehicle === vehicle.id}
                    onSelect={() => setSelectedVehicle(vehicle.id)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Wash Type Selection */}
        {currentStepId === 'washType' && (
          <View className="gap-4">
            <View>
              <View className="flex-row items-center gap-2">
                <Sparkles size={20} color={Colors.primary} />
                <Text className="font-semibold text-gray-900 dark:text-white">
                  Choose Wash Type
                </Text>
              </View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select the type of service you need
              </Text>
            </View>
            <View className="gap-4">
              <WashTypeCard
                title="Full Wash"
                description="Complete exterior & interior cleaning"
                icon={Sparkles}
                features={['Exterior wash', 'Interior clean', 'Vacuum', 'Polish']}
                isSelected={selectedWashType === 'full'}
                onSelect={() => setSelectedWashType('full')}
              />
              <WashTypeCard
                title="Exterior Only"
                description="Exterior body wash & polish only"
                icon={Droplets}
                features={['Exterior wash', 'Wheel cleaning', 'Polish']}
                isSelected={selectedWashType === 'exterior'}
                onSelect={() => setSelectedWashType('exterior')}
              />
            </View>
          </View>
        )}

        {/* Addons Selection */}
        {currentStepId === 'addons' && (
          <View className="gap-4">
            <View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Package size={20} color={Colors.primary} />
                  <Text className="font-semibold text-gray-900 dark:text-white">
                    Add Extras
                  </Text>
                </View>
                {selectedAddons.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSelectedAddons([])}
                    className="flex-row items-center gap-1"
                  >
                    <X size={14} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm">Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Optional add-ons to enhance your service
              </Text>
            </View>
            <View className="gap-3">
              {addons.map((addon) => (
                <AddonCard
                  key={addon.id}
                  addon={addon}
                  isSelected={selectedAddons.includes(addon.id)}
                  onToggle={() => toggleAddon(addon.id)}
                  country={country}
                />
              ))}
            </View>
            {selectedAddons.length > 0 && (
              <View className="bg-primary/10 rounded-xl p-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-primary font-medium">
                    {selectedAddons.length} extra{selectedAddons.length > 1 ? 's' : ''} selected
                  </Text>
                  <Text className="text-primary font-bold">
                    +{currency} {getAddonsTotal()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Location Selection */}
        {currentStepId === 'location' && (
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MapPin size={20} color={Colors.primary} />
                <Text className="font-semibold text-gray-900 dark:text-white">
                  Select Location
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/locations' as any)}
                className="flex-row items-center gap-1"
              >
                <Plus size={16} color={Colors.primary} />
                <Text className="text-primary text-sm font-medium">Add</Text>
              </TouchableOpacity>
            </View>
            {locations.length === 0 ? (
              <View className="items-center py-12 px-6">
                <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                  <MapPin size={40} color="#9CA3AF" />
                </View>
                <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                  No Locations Yet
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
                  Add your first location to continue with booking
                </Text>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => router.push('/locations' as any)}
                >
                  <View className="flex-row items-center gap-2">
                    <Plus size={18} color="white" />
                    <Text className="text-white font-semibold">Add Location</Text>
                  </View>
                </Button>
              </View>
            ) : (
              <View className="gap-3">
                {locations.map((location) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    isSelected={selectedLocation === location.id}
                    onSelect={() => setSelectedLocation(location.id)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Time Selection */}
        {currentStepId === 'time' && (
          <View className="gap-6">
            <View>
              <View className="flex-row items-center gap-2 mb-4">
                <Clock size={20} color={Colors.primary} />
                <Text className="font-semibold text-gray-900 dark:text-white">
                  Select Date & Time
                </Text>
              </View>

              {/* Date Selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
                contentContainerStyle={{ gap: 10 }}
              >
                {dates.map((date, index) => {
                  const { day, date: dateNum, isToday } = formatDateDisplay(date);
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  const monthName = format(date, 'MMM');
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedDate(date)}
                      activeOpacity={0.7}
                    >
                      <View
                        className={`w-16 h-[76px] rounded-2xl items-center justify-center ${
                          isSelected
                            ? 'bg-primary'
                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-semibold tracking-wide ${
                            isSelected ? 'text-white/80' : 'text-gray-400'
                          }`}
                        >
                          {isToday ? 'TODAY' : day.toUpperCase()}
                        </Text>
                        <Text
                          className={`text-xl font-bold mt-0.5 ${
                            isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {dateNum}
                        </Text>
                        <Text
                          className={`text-[10px] font-medium ${
                            isSelected ? 'text-white/70' : 'text-gray-400'
                          }`}
                        >
                          {monthName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Period Tabs */}
              <View className="flex-row gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                <TouchableOpacity
                  onPress={() => setActivePeriod('afternoon')}
                  className="flex-1"
                  activeOpacity={0.7}
                >
                  <View
                    className={`flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl ${
                      activePeriod === 'afternoon'
                        ? 'bg-white dark:bg-gray-700'
                        : ''
                    }`}
                  >
                    <Sun size={16} color={activePeriod === 'afternoon' ? Colors.primary : '#9CA3AF'} />
                    <Text
                      className={`text-sm font-semibold ${
                        activePeriod === 'afternoon'
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500'
                      }`}
                    >
                      Afternoon
                    </Text>
                    <View
                      className={`px-1.5 py-0.5 rounded-full ${
                        activePeriod === 'afternoon'
                          ? 'bg-primary/10'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-medium ${
                          activePeriod === 'afternoon'
                            ? 'text-primary'
                            : 'text-gray-500'
                        }`}
                      >
                        1-5 PM
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActivePeriod('evening')}
                  className="flex-1"
                  activeOpacity={0.7}
                >
                  <View
                    className={`flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl ${
                      activePeriod === 'evening'
                        ? 'bg-white dark:bg-gray-700'
                        : ''
                    }`}
                  >
                    <Moon size={16} color={activePeriod === 'evening' ? Colors.primary : '#9CA3AF'} />
                    <Text
                      className={`text-sm font-semibold ${
                        activePeriod === 'evening'
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500'
                      }`}
                    >
                      Evening
                    </Text>
                    <View
                      className={`px-1.5 py-0.5 rounded-full ${
                        activePeriod === 'evening'
                          ? 'bg-primary/10'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-medium ${
                          activePeriod === 'evening'
                            ? 'text-primary'
                            : 'text-gray-500'
                        }`}
                      >
                        5-10 PM
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Time Slots Grid */}
              {loadingSlots ? (
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center">
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Loading available times...
                  </Text>
                </View>
              ) : displaySlots.length === 0 ? (
                <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 items-center">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    No slots in this period
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActivePeriod(activePeriod === 'afternoon' ? 'evening' : 'afternoon')}
                    className="mt-2"
                  >
                    <Text className="text-sm text-primary font-medium">
                      Try another period
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-row flex-wrap gap-2.5">
                  {displaySlots.map((slot) => {
                    const status = getSlotStatus(slot);
                    const isAvailable = status !== 'full';
                    const isSelected = selectedTimeSlot === slot.id;
                    const remaining = slot.max_capacity - slot.booked_count;

                    // Get slot style based on status
                    const getSlotStyle = () => {
                      if (isSelected) return 'bg-primary border-primary';
                      switch (status) {
                        case 'available':
                          return 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700';
                        case 'limited':
                          return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700';
                        case 'full':
                          return 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60';
                        default:
                          return 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700';
                      }
                    };

                    // Get status label
                    const getStatusLabel = () => {
                      if (isSelected) return { text: 'Selected', bg: 'bg-white/20', textColor: 'text-white' };
                      switch (status) {
                        case 'available':
                          return { text: 'Available', bg: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400' };
                        case 'limited':
                          return { text: `${remaining} left`, bg: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-700 dark:text-amber-400' };
                        case 'full':
                          return { text: 'Full', bg: 'bg-gray-100 dark:bg-gray-700', textColor: 'text-gray-400' };
                        default:
                          return { text: '', bg: '', textColor: '' };
                      }
                    };

                    const statusLabel = getStatusLabel();

                    return (
                      <TouchableOpacity
                        key={slot.id}
                        onPress={() => isAvailable && setSelectedTimeSlot(slot.id)}
                        activeOpacity={isAvailable ? 0.7 : 1}
                        disabled={!isAvailable}
                        style={{ width: '31%' }}
                      >
                        <View
                          className={`relative py-3.5 px-2 rounded-xl border-2 items-center ${getSlotStyle()}`}
                        >
                          {isSelected && (
                            <View className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/20 items-center justify-center">
                              <Check size={10} color="white" />
                            </View>
                          )}
                          <Text
                            className={`text-sm font-bold ${
                              isSelected
                                ? 'text-white'
                                : !isAvailable
                                ? 'text-gray-400'
                                : 'text-gray-800 dark:text-white'
                            }`}
                          >
                            {formatTimeSlot(slot.slot_hour)}
                          </Text>
                          <View className={`mt-1 px-2 py-0.5 rounded-full ${statusLabel.bg}`}>
                            <Text className={`text-[9px] font-medium ${statusLabel.textColor}`}>
                              {statusLabel.text}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Payment */}
        {currentStepId === 'payment' && (
          <View className="gap-6">
            {/* Order Summary */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
              <Text className="font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </Text>
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Service</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {service?.name}
                  </Text>
                </View>
                {selectedWashType && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Wash Type</Text>
                    <Text className="font-medium text-gray-900 dark:text-white">
                      {selectedWashType === 'full'
                        ? 'Full (Ext + Int)'
                        : selectedWashType === 'interior'
                        ? 'Interior Only'
                        : 'Exterior Only'}
                    </Text>
                  </View>
                )}
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Vehicle</Text>
                  <Text className="font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                    {selectedVehicleData ? `${selectedVehicleData.make} ${selectedVehicleData.model}` : '-'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Location</Text>
                  <Text className="font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                    {locations.find(l => l.id === selectedLocation)?.label || '-'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Date & Time</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {format(selectedDate, 'MMM d')} at {timeSlots.find(t => t.id === selectedTimeSlot)?.slot_hour ? formatTimeSlot(timeSlots.find(t => t.id === selectedTimeSlot)!.slot_hour) : '-'}
                  </Text>
                </View>
                {selectedAddons.length > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Add-ons</Text>
                    <Text className="font-medium text-gray-900 dark:text-white">
                      {selectedAddons.length} extra{selectedAddons.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                <View className="h-px bg-gray-100 dark:bg-gray-700" />
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Service Price</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {currency} {getServicePrice()}
                  </Text>
                </View>
                {getAddonsTotal() > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400">Extras</Text>
                    <Text className="font-medium text-gray-900 dark:text-white">
                      +{currency} {getAddonsTotal()}
                    </Text>
                  </View>
                )}
                <View className="h-px bg-gray-100 dark:bg-gray-700" />
                <View className="flex-row justify-between">
                  <Text className="font-semibold text-gray-900 dark:text-white">Total</Text>
                  <Text className="font-bold text-primary text-lg">{currency} {totalPrice}</Text>
                </View>
              </View>
            </View>

            {/* Promo Code */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
              <Text className="font-semibold text-gray-900 dark:text-white mb-3">
                Promo Code
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={promoCode}
                  onChangeText={setPromoCode}
                  placeholder="Enter code"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                />
                <TouchableOpacity className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600">
                  <Text className="font-medium text-gray-700 dark:text-gray-300">
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Methods */}
            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <CreditCard size={20} color={Colors.primary} />
                <Text className="font-semibold text-gray-900 dark:text-white">
                  Payment Method
                </Text>
              </View>
              <PaymentMethodCard
                title="Cash Payment"
                description="Pay the washer on arrival"
                icon={Banknote}
                isSelected={paymentMethod === 'cash'}
                onSelect={() => setPaymentMethod('cash')}
              />
              <PaymentMethodCard
                title="Paymob"
                description="Secure online payment"
                icon={Smartphone}
                isSelected={paymentMethod === 'paymob'}
                onSelect={() => setPaymentMethod('paymob')}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pt-4 pb-8">
        <View className="flex-row gap-3">
          {step > 1 && (
            <TouchableOpacity
              onPress={handleBack}
              disabled={isSubmitting}
              className="flex-row items-center justify-center gap-2 px-6 py-4 rounded-full bg-white dark:bg-gray-800 border border-primary"
              style={{ opacity: isSubmitting ? 0.5 : 1 }}
            >
              <ArrowLeft size={20} color={Colors.primary} />
              <Text style={{ color: Colors.primary }} className="font-semibold text-lg">
                Back
              </Text>
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleContinue}
              disabled={!canContinue() || isSubmitting}
              loading={isSubmitting}
            >
              {step === totalSteps ? 'Confirm Booking' : 'Continue'}
            </Button>
          </View>
        </View>
      </View>

      {/* Includes Sheet */}
      <BottomSheet
        visible={showIncludesSheet}
        onClose={() => setShowIncludesSheet(false)}
        showCloseButton
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 px-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: Colors.brandBeige }}
          >
            <Sparkles size={20} color={Colors.primary} />
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              What's Included
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {service?.name}
            </Text>
          </View>
        </View>

        {/* Features List */}
        <View className="px-5 py-4 gap-3">
          {service?.features?.map((feature, index) => (
            <View
              key={index}
              className="flex-row items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
            >
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: `${Colors.primary}15` }}
              >
                <Check size={16} color={Colors.primary} />
              </View>
              <Text className="flex-1 text-base text-gray-800 dark:text-gray-200 font-medium">
                {feature}
              </Text>
            </View>
          ))}

          {/* Duration Note */}
          <View className="mt-2 flex-row items-center gap-2 p-4 rounded-xl bg-primary/10">
            <Clock size={18} color={Colors.primary} />
            <Text className="flex-1 text-sm text-primary font-medium">
              Estimated duration: {service?.duration_minutes} minutes
            </Text>
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
