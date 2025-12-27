import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Car,
  MapPin,
  Crown,
  Moon,
  Globe,
  Bell,
  HelpCircle,
  Info,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  X,
  Check,
  Edit3,
  Headphones,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useThemeStore, useAuthStore, useLocaleStore } from '@/stores';
import { useAuth } from '@/hooks';
import Colors from '@/constants/Colors';
import { t, getLocale } from '@/lib/i18n';
import { Button } from '@/components/ui';
import { SupportSheet } from '@/components/shared';
import { updateProfile, getProfile } from '@/lib/api/profile';
import { getVehicles } from '@/lib/api/vehicles';
import { getLocations } from '@/lib/api/locations';
import type { Vehicle, Location as LocationType, CountryCode } from '@/types';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
  subtitle?: string;
}

function MenuItem({ icon, label, onPress, rightElement, danger, subtitle }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-4 bg-white dark:bg-gray-800"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-medium ${
            danger ? 'text-red-500' : 'text-gray-900 dark:text-white'
          }`}
        >
          {label}
        </Text>
        {subtitle && (
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || <ChevronRight size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );
}

function MenuDivider() {
  return <View className="h-px bg-gray-100 dark:bg-gray-700" />;
}

function MenuSection({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <View className="mb-4 mx-4">
      {title && (
        <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2 uppercase">
          {title}
        </Text>
      )}
      <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function EditProfileModal({
  visible,
  onClose,
  currentName,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    try {
      await onSave(name.trim());
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('profile.editProfile')}
          </Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 px-4 py-6">
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

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
    </Modal>
  );
}

function LanguageModal({
  visible,
  onClose,
  currentLocale,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  currentLocale: string;
  onSelect: (locale: 'en' | 'ar') => void;
}) {
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('profile.language')}
          </Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 px-4 py-4">
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => {
                onSelect(lang.code as 'en' | 'ar');
                onClose();
              }}
              className="flex-row items-center justify-between py-4 px-4 bg-white dark:bg-gray-800 rounded-xl mb-3"
            >
              <View>
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  {lang.nativeName}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {lang.name}
                </Text>
              </View>
              {currentLocale === lang.code && (
                <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                  <Check size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}

          <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 px-4">
            Note: Changing language may require app restart for full effect
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function CountryModal({
  visible,
  onClose,
  currentCountry,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  currentCountry: CountryCode;
  onSelect: (country: CountryCode) => void;
}) {
  const countries = [
    { code: 'EG', name: 'Egypt', flag: '🇪🇬', currency: 'EGP' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪', currency: 'AED' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Country
          </Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 px-4 py-4">
          {countries.map((country) => (
            <TouchableOpacity
              key={country.code}
              onPress={() => {
                onSelect(country.code as CountryCode);
                onClose();
              }}
              className="flex-row items-center justify-between py-4 px-4 bg-white dark:bg-gray-800 rounded-xl mb-3"
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">{country.flag}</Text>
                <View>
                  <Text className="text-base font-medium text-gray-900 dark:text-white">
                    {country.name}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Currency: {country.currency}
                  </Text>
                </View>
              </View>
              {currentCountry === country.code && (
                <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                  <Check size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function ProfileScreen() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { profile, setProfile } = useAuthStore();
  const { locale, setLocale: setStoreLocale } = useLocaleStore();
  const { signOut, isAuthenticated } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(profile?.push_enabled ?? true);
  const [country, setCountry] = useState<CountryCode>(profile?.country ?? 'EG');

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [vehiclesData, locationsData, profileData] = await Promise.all([
        getVehicles().catch(() => []),
        getLocations().catch(() => []),
        getProfile().catch(() => null),
      ]);
      setVehicles(vehiclesData);
      setLocations(locationsData);
      if (profileData) {
        setProfile(profileData);
        setPushEnabled(profileData.push_enabled);
        setCountry(profileData.country);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [setProfile]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, loadData]);

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      'Are you sure you want to logout?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleSaveProfile = async (name: string) => {
    const updated = await updateProfile({ full_name: name });
    setProfile(updated);
    Toast.show({
      type: 'success',
      text1: 'Profile Updated',
      text2: 'Your name has been updated',
    });
  };

  const handleLanguageChange = (newLocale: 'en' | 'ar') => {
    setStoreLocale(newLocale);
    // Update profile language in database
    updateProfile({ language: newLocale }).catch(console.error);
    Toast.show({
      type: 'info',
      text1: 'Language Changed',
      text2: 'Restart app for full effect',
    });
  };

  const handleCountryChange = async (newCountry: CountryCode) => {
    try {
      const updated = await updateProfile({ country: newCountry });
      setProfile(updated);
      setCountry(newCountry);
      Toast.show({
        type: 'success',
        text1: 'Country Updated',
        text2: `Switched to ${newCountry === 'EG' ? 'Egypt' : 'UAE'}`,
      });
    } catch (error) {
      console.error('Failed to update country:', error);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      setPushEnabled(value);
      const updated = await updateProfile({ push_enabled: value });
      setProfile(updated);
    } catch (error) {
      console.error('Failed to update notifications:', error);
      setPushEnabled(!value);
    }
  };

  const currentLocaleName = locale === 'ar' ? 'العربية' : 'English';
  const currentCountryFlag = country === 'EG' ? '🇪🇬' : '🇦🇪';

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 py-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('profile.title')}
          </Text>
        </View>

        {/* Profile Card */}
        <TouchableOpacity
          onPress={() => isAuthenticated && setShowEditProfile(true)}
          className="mx-4 mb-6 bg-white dark:bg-gray-800 rounded-2xl p-5"
          activeOpacity={isAuthenticated ? 0.7 : 1}
        >
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mr-4">
              <User size={32} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile?.full_name || 'Guest User'}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400">
                {profile?.phone || 'No phone number'}
              </Text>
              {profile?.email && (
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {profile.email}
                </Text>
              )}
            </View>
            {isAuthenticated && (
              <View className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Edit3 size={16} color="#6B7280" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        {isAuthenticated && !loading && (
          <View className="flex-row mx-4 mb-4 gap-3">
            <TouchableOpacity
              onPress={() => router.push('/vehicles')}
              className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4"
            >
              <View className="flex-row items-center gap-2 mb-1">
                <Car size={16} color={Colors.primary} />
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicles.length}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('profile.myVehicles')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/locations')}
              className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4"
            >
              <View className="flex-row items-center gap-2 mb-1">
                <MapPin size={16} color={Colors.primary} />
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {locations.length}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('profile.myLocations')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* My Items Section */}
        <MenuSection title="My Items">
          <MenuItem
            icon={<Car size={20} color={Colors.primary} />}
            label={t('profile.myVehicles')}
            subtitle={`${vehicles.length} vehicles`}
            onPress={() => router.push('/vehicles')}
          />
          <MenuDivider />
          <MenuItem
            icon={<MapPin size={20} color={Colors.primary} />}
            label={t('profile.myLocations')}
            subtitle={`${locations.length} locations`}
            onPress={() => router.push('/locations')}
          />
          <MenuDivider />
          <MenuItem
            icon={<Crown size={20} color={Colors.primary} />}
            label={t('profile.membership')}
            subtitle="Manage your plan"
            onPress={() => router.push('/membership')}
          />
        </MenuSection>

        {/* Preferences Section */}
        <MenuSection title="Preferences">
          <MenuItem
            icon={<Moon size={20} color="#6B7280" />}
            label={t('profile.darkMode')}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#D1D5DB', true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <MenuDivider />
          <MenuItem
            icon={<Globe size={20} color="#6B7280" />}
            label={t('profile.language')}
            onPress={() => setShowLanguageModal(true)}
            rightElement={
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-500">{currentLocaleName}</Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            }
          />
          <MenuDivider />
          <MenuItem
            icon={<Text className="text-xl">{currentCountryFlag}</Text>}
            label="Country"
            onPress={() => setShowCountryModal(true)}
            rightElement={
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-500">
                  {country === 'EG' ? 'Egypt' : 'UAE'}
                </Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            }
          />
          <MenuDivider />
          <MenuItem
            icon={<Bell size={20} color="#6B7280" />}
            label={t('profile.notifications')}
            rightElement={
              <Switch
                value={pushEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#D1D5DB', true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </MenuSection>

        {/* Support Section */}
        <MenuSection title="Support">
          <MenuItem
            icon={<Headphones size={20} color={Colors.primary} />}
            label="Contact Support"
            subtitle="Call, WhatsApp, or Email"
            onPress={() => setShowSupport(true)}
          />
          <MenuDivider />
          <MenuItem
            icon={<HelpCircle size={20} color="#6B7280" />}
            label={t('profile.help')}
          />
          <MenuDivider />
          <MenuItem
            icon={<Info size={20} color="#6B7280" />}
            label={t('profile.about')}
          />
          <MenuDivider />
          <MenuItem
            icon={<FileText size={20} color="#6B7280" />}
            label={t('profile.terms')}
          />
          <MenuDivider />
          <MenuItem
            icon={<Shield size={20} color="#6B7280" />}
            label={t('profile.privacy')}
          />
        </MenuSection>

        {/* Logout/Login Section */}
        <MenuSection>
          {isAuthenticated ? (
            <MenuItem
              icon={<LogOut size={20} color="#EF4444" />}
              label={t('auth.logout')}
              onPress={handleLogout}
              danger
            />
          ) : (
            <MenuItem
              icon={<User size={20} color={Colors.primary} />}
              label={t('auth.login')}
              onPress={handleLogin}
            />
          )}
        </MenuSection>

        {/* App Version */}
        <Text className="text-center text-gray-400 text-sm mt-4 mb-8">
          Washman v1.0.0
        </Text>
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentName={profile?.full_name || ''}
        onSave={handleSaveProfile}
      />

      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        currentLocale={locale}
        onSelect={handleLanguageChange}
      />

      <CountryModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        currentCountry={country}
        onSelect={handleCountryChange}
      />

      <SupportSheet
        visible={showSupport}
        onClose={() => setShowSupport(false)}
      />
    </SafeAreaView>
  );
}
