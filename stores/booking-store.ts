import { create } from 'zustand';
import type {
  Vehicle,
  Location,
  Service,
  Addon,
  TimeSlot,
  PaymentMethod,
  CountryCode,
} from '@/types';

interface BookingState {
  // Current step
  step: number;
  country: CountryCode;

  // Selected items
  selectedVehicle: Vehicle | null;
  selectedLocation: Location | null;
  selectedService: Service | null;
  selectedAddons: Addon[];
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  specialInstructions: string;
  promoCode: string | null;
  paymentMethod: PaymentMethod | null;

  // Pricing
  basePrice: number;
  addonsPrice: number;
  discountAmount: number;
  membershipDiscount: number;
  totalAmount: number;
  currency: string;
}

interface BookingActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCountry: (country: CountryCode) => void;
  setVehicle: (vehicle: Vehicle | null) => void;
  setLocation: (location: Location | null) => void;
  setService: (service: Service | null) => void;
  addAddon: (addon: Addon) => void;
  removeAddon: (addonId: string) => void;
  clearAddons: () => void;
  setDate: (date: Date | null) => void;
  setTimeSlot: (slot: TimeSlot | null) => void;
  setInstructions: (instructions: string) => void;
  setPromoCode: (code: string | null) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setDiscount: (amount: number) => void;
  setMembershipDiscount: (amount: number) => void;
  calculatePricing: () => void;
  reset: () => void;
}

const initialState: BookingState = {
  step: 1,
  country: 'EG',
  selectedVehicle: null,
  selectedLocation: null,
  selectedService: null,
  selectedAddons: [],
  selectedDate: null,
  selectedTimeSlot: null,
  specialInstructions: '',
  promoCode: null,
  paymentMethod: null,
  basePrice: 0,
  addonsPrice: 0,
  discountAmount: 0,
  membershipDiscount: 0,
  totalAmount: 0,
  currency: 'EGP',
};

export const useBookingStore = create<BookingState & BookingActions>(
  (set, get) => ({
    ...initialState,

    setStep: (step) => set({ step }),

    nextStep: () => set((state) => ({ step: state.step + 1 })),

    prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

    setCountry: (country) =>
      set({
        country,
        currency: country === 'EG' ? 'EGP' : 'AED',
      }),

    setVehicle: (vehicle) => {
      set({ selectedVehicle: vehicle });
      get().calculatePricing();
    },

    setLocation: (location) => set({ selectedLocation: location }),

    setService: (service) => {
      set({
        selectedService: service,
        selectedAddons: [],
        basePrice: 0,
        addonsPrice: 0,
        totalAmount: 0,
      });
      get().calculatePricing();
    },

    addAddon: (addon) => {
      const currentAddons = get().selectedAddons;
      if (!currentAddons.find((a) => a.id === addon.id)) {
        set({ selectedAddons: [...currentAddons, addon] });
        get().calculatePricing();
      }
    },

    removeAddon: (addonId) => {
      set((state) => ({
        selectedAddons: state.selectedAddons.filter((a) => a.id !== addonId),
      }));
      get().calculatePricing();
    },

    clearAddons: () => {
      set({ selectedAddons: [] });
      get().calculatePricing();
    },

    setDate: (date) => set({ selectedDate: date, selectedTimeSlot: null }),

    setTimeSlot: (slot) => set({ selectedTimeSlot: slot }),

    setInstructions: (instructions) =>
      set({ specialInstructions: instructions }),

    setPromoCode: (code) => {
      set({ promoCode: code });
      // Promo code validation and discount calculation should be done via API
    },

    setPaymentMethod: (method) => set({ paymentMethod: method }),

    setDiscount: (amount) => {
      set({ discountAmount: amount });
      get().calculatePricing();
    },

    setMembershipDiscount: (amount) => {
      set({ membershipDiscount: amount });
      get().calculatePricing();
    },

    calculatePricing: () => {
      const state = get();
      const vehicleType = state.selectedVehicle?.type || 'sedan';
      const country = state.country;

      // Calculate base price based on vehicle type and country
      let basePrice = 0;
      if (state.selectedService) {
        if (country === 'EG') {
          if (vehicleType === 'luxury') {
            basePrice = state.selectedService.price_luxury_eg || 0;
          } else if (vehicleType === 'suv') {
            basePrice = state.selectedService.price_suv_eg || 0;
          } else {
            basePrice = state.selectedService.price_sedan_eg || 0;
          }
        } else {
          // AE (UAE/Dubai)
          if (vehicleType === 'luxury') {
            basePrice = state.selectedService.price_luxury_ae || 0;
          } else if (vehicleType === 'suv') {
            basePrice = state.selectedService.price_suv_ae || 0;
          } else {
            basePrice = state.selectedService.price_sedan_ae || 0;
          }
        }
      }

      // Calculate addons total (flat pricing based on country)
      const addonsPrice = state.selectedAddons.reduce((sum, addon) => {
        const price =
          country === 'EG' ? addon.price_eg || 0 : addon.price_ae || 0;
        return sum + price;
      }, 0);

      // Calculate total
      const subtotal = basePrice + addonsPrice;
      const totalAmount = Math.max(
        0,
        subtotal - state.discountAmount - state.membershipDiscount
      );

      set({ basePrice, addonsPrice, totalAmount });
    },

    reset: () => set(initialState),
  })
);

// Selectors
export const selectBookingTotal = (state: BookingState) => state.totalAmount;
export const selectBookingStep = (state: BookingState) => state.step;
export const selectHasValidBooking = (state: BookingState) =>
  state.selectedVehicle !== null &&
  state.selectedLocation !== null &&
  state.selectedService !== null &&
  state.selectedDate !== null &&
  state.selectedTimeSlot !== null;
