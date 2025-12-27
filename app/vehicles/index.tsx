import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import {
  ArrowLeft,
  Car,
  Plus,
  Trash2,
  Star,
  Edit3,
  Crown,
  Truck,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { Button } from '@/components/ui';
import { t } from '@/lib/i18n';
import type { Vehicle, VehicleType } from '@/types';
import { VehicleImage } from '@/components/icons/CarIcons';
import {
  getVehicles,
  deleteVehicle,
  setDefaultVehicle,
} from '@/lib/api/vehicles';

function VehicleCard({
  vehicle,
  onSetDefault,
  onDelete,
  onEdit,
  loading,
}: {
  vehicle: Vehicle;
  onSetDefault: () => void;
  onDelete: () => void;
  onEdit: () => void;
  loading?: boolean;
}) {
  const TypeIcon = vehicle.type === 'luxury' ? Crown : vehicle.type === 'suv' || vehicle.type === 'pickup' ? Truck : Car;

  return (
    <TouchableOpacity
      onPress={onEdit}
      activeOpacity={0.7}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <View className="flex-row items-center gap-4">
        <View className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl items-center justify-center">
          <TypeIcon size={28} color={Colors.primary} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-gray-900 dark:text-white text-base">
              {vehicle.make} {vehicle.model}
            </Text>
            {vehicle.is_default && (
              <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                <Text className="text-primary text-[10px] font-semibold">
                  {t('vehicles.default')}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {vehicle.year}
            </Text>
            <Text className="text-gray-300">•</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {vehicle.type}
            </Text>
            <Text className="text-gray-300">•</Text>
            <Text className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {vehicle.plate}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {vehicle.color && (
            <View
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: vehicle.color }}
            />
          )}
          <Edit3 size={16} color="#9CA3AF" />
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        {!vehicle.is_default && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onSetDefault();
            }}
            disabled={loading}
            className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-xl bg-gray-100 dark:bg-gray-700"
          >
            <Star size={14} color="#6B7280" />
            <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t('vehicles.setDefault')}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={loading}
          className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-xl bg-red-50 dark:bg-red-900/20"
        >
          <Trash2 size={14} color="#EF4444" />
          <Text className="text-xs font-medium text-red-600">{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}


export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load vehicles',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload vehicles when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [loadVehicles])
  );

  const handleSetDefault = async (id: string) => {
    setActionLoading(true);
    try {
      await setDefaultVehicle(id);
      await loadVehicles();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Default vehicle updated',
      });
    } catch (error) {
      console.error('Failed to set default:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update default vehicle',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('common.delete'),
      'Are you sure you want to delete this vehicle?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteVehicle(id);
              await loadVehicles();
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Vehicle removed successfully',
              });
            } catch (error) {
              console.error('Failed to delete:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete vehicle',
              });
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAddVehicle = () => {
    router.push('/vehicles/add');
  };

  const handleEditVehicle = (id: string) => {
    router.push(`/vehicles/add?id=${id}`);
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
            {t('vehicles.title')}
          </Text>
          <TouchableOpacity
            onPress={handleAddVehicle}
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
          {vehicles.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                <Car size={40} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('booking.noVehicles')}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
                Add your first vehicle to get started
              </Text>
              <Button variant="primary" size="lg" onPress={handleAddVehicle}>
                <View className="flex-row items-center gap-2">
                  <Plus size={18} color="white" />
                  <Text className="text-white font-semibold">{t('vehicles.addVehicle')}</Text>
                </View>
              </Button>
            </View>
          ) : (
            vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSetDefault={() => handleSetDefault(vehicle.id)}
                onDelete={() => handleDelete(vehicle.id)}
                onEdit={() => handleEditVehicle(vehicle.id)}
                loading={actionLoading}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
