import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Region, Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import { MapPin, Locate, Check, X } from 'lucide-react-native';
import * as ExpoLocation from 'expo-location';

import Colors from '@/constants/Colors';
import { getZones, checkServiceArea, type ZoneCheckResult, type ZoneWithPolygon } from '@/lib/api/zones';
import { reverseGeocode } from '@/lib/api/locations';
import { useAuthStore } from '@/stores';

const { width, height } = Dimensions.get('window');

interface MapLocationPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    zoneInfo: ZoneCheckResult | null;
  }) => void;
  onClose: () => void;
}

export default function MapLocationPicker({
  initialLatitude,
  initialLongitude,
  onLocationSelect,
  onClose,
}: MapLocationPickerProps) {
  const mapRef = useRef<MapView>(null);
  const { profile } = useAuthStore();
  const country = profile?.country || 'EG';

  // Default coordinates based on country
  const defaultCoords = country === 'AE'
    ? { latitude: 25.2048, longitude: 55.2708 } // Dubai
    : { latitude: 30.0444, longitude: 31.2357 }; // Cairo

  const [region, setRegion] = useState<Region>({
    latitude: initialLatitude || defaultCoords.latitude,
    longitude: initialLongitude || defaultCoords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLatitude || defaultCoords.latitude,
    longitude: initialLongitude || defaultCoords.longitude,
  });

  const [zones, setZones] = useState<ZoneWithPolygon[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zoneInfo, setZoneInfo] = useState<ZoneCheckResult | null>(null);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Load zones on mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        const zonesData = await getZones(country);
        setZones(zonesData);
      } catch (error) {
        console.error('Failed to load zones:', error);
      } finally {
        setLoadingZones(false);
      }
    };
    loadZones();
  }, [country]);

  // Get current location
  const handleGetCurrentLocation = async () => {
    try {
      setLocating(true);
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      const newPosition = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setMarkerPosition(newPosition);
      mapRef.current?.animateToRegion({
        ...newPosition,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Geocode and check zone
      await updateLocationInfo(newPosition.latitude, newPosition.longitude);
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLocating(false);
    }
  };

  // Update address and zone info when marker moves
  const updateLocationInfo = async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      // Reverse geocode
      const geocoded = await reverseGeocode(lat, lng);
      if (geocoded) {
        setAddress(geocoded.address);
        setCity(geocoded.city);
      }

      // Check service area
      const zone = await checkServiceArea(lat, lng, country);
      setZoneInfo(zone);
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setGeocoding(false);
    }
  };

  // Handle map region change
  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    setMarkerPosition({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    });
    await updateLocationInfo(newRegion.latitude, newRegion.longitude);
  };

  // Confirm location
  const handleConfirm = () => {
    onLocationSelect({
      latitude: markerPosition.latitude,
      longitude: markerPosition.longitude,
      address,
      city,
      zoneInfo,
    });
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Service Area Polygons */}
        {zones.map((zone) => {
          if (!zone.polygon?.coordinates?.[0]) return null;

          const coordinates = zone.polygon.coordinates[0].map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));

          return (
            <Polygon
              key={zone.id}
              coordinates={coordinates}
              strokeColor={Colors.primary}
              fillColor="rgba(31, 135, 131, 0.15)"
              strokeWidth={2}
            />
          );
        })}
      </MapView>

      {/* Center Pin (fixed in center) */}
      <View style={styles.centerPin}>
        <View style={[
          styles.pinContainer,
          { backgroundColor: zoneInfo?.inServiceArea ? Colors.primary : '#EF4444' }
        ]}>
          <MapPin size={24} color="white" />
        </View>
        <View style={[
          styles.pinShadow,
          { backgroundColor: zoneInfo?.inServiceArea ? Colors.primary : '#EF4444' }
        ]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.locateButton}
        onPress={handleGetCurrentLocation}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Locate size={22} color={Colors.primary} />
        )}
      </TouchableOpacity>

      {/* Bottom Info Panel */}
      <View style={styles.bottomPanel}>
        {/* Zone Status */}
        <View style={[
          styles.zoneStatus,
          { backgroundColor: zoneInfo?.inServiceArea ? '#D1FAE5' : '#FEE2E2' }
        ]}>
          {geocoding ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <>
              <View style={[
                styles.statusDot,
                { backgroundColor: zoneInfo?.inServiceArea ? '#10B981' : '#EF4444' }
              ]} />
              <Text style={[
                styles.zoneStatusText,
                { color: zoneInfo?.inServiceArea ? '#065F46' : '#991B1B' }
              ]}>
                {zoneInfo?.inServiceArea
                  ? `In Service Area${zoneInfo.zone ? ` - ${zoneInfo.zone.name_en}` : ''}`
                  : 'Outside Service Area'}
              </Text>
            </>
          )}
        </View>

        {/* Address */}
        <View style={styles.addressContainer}>
          <MapPin size={18} color="#6B7280" />
          <Text style={styles.addressText} numberOfLines={2}>
            {geocoding ? 'Getting address...' : address || 'Move the map to select location'}
          </Text>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { opacity: !address ? 0.5 : 1 }
          ]}
          onPress={handleConfirm}
          disabled={!address || geocoding}
        >
          <Check size={20} color="white" />
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Zones Overlay */}
      {loadingZones && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading service areas...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
  },
  pinContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pinShadow: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: -4,
    opacity: 0.3,
  },
  locateButton: {
    position: 'absolute',
    right: 16,
    top: height * 0.5 - 80,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  zoneStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  zoneStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});
