import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region, Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Navigation, Info, CheckCircle2 } from 'lucide-react-native';
import * as ExpoLocation from 'expo-location';

import Colors from '@/constants/Colors';
import { getZones, checkServiceArea, type ZoneWithPolygon, type ZoneCheckResult } from '@/lib/api/zones';
import { useAuthStore } from '@/stores';
import { getLocale } from '@/lib/i18n';

const { width, height } = Dimensions.get('window');

export default function ZonesMapScreen() {
  const mapRef = useRef<MapView>(null);
  const { profile } = useAuthStore();
  const country = profile?.country || 'EG';
  const locale = getLocale();

  // Default coordinates based on country
  const defaultCoords = country === 'AE'
    ? { latitude: 25.2048, longitude: 55.2708, latitudeDelta: 0.3, longitudeDelta: 0.3 } // Dubai
    : { latitude: 30.0444, longitude: 31.2357, latitudeDelta: 0.3, longitudeDelta: 0.3 }; // Cairo

  const [zones, setZones] = useState<ZoneWithPolygon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<ZoneWithPolygon | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userZoneInfo, setUserZoneInfo] = useState<ZoneCheckResult | null>(null);
  const [checkingLocation, setCheckingLocation] = useState(false);

  // Load zones
  useEffect(() => {
    const loadZones = async () => {
      try {
        const zonesData = await getZones(country);
        setZones(zonesData);
      } catch (error) {
        console.error('Failed to load zones:', error);
      } finally {
        setLoading(false);
      }
    };
    loadZones();
  }, [country]);

  // Check user's current location
  const checkMyLocation = async () => {
    try {
      setCheckingLocation(true);
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(coords);

      // Animate to user location
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      // Check if in service area
      const zoneInfo = await checkServiceArea(coords.latitude, coords.longitude, country);
      setUserZoneInfo(zoneInfo);
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setCheckingLocation(false);
    }
  };

  // Focus on a specific zone
  const focusOnZone = (zone: ZoneWithPolygon) => {
    setSelectedZone(zone);

    if (zone.polygon?.coordinates?.[0]) {
      const coords = zone.polygon.coordinates[0];
      const lats = coords.map(c => c[1]);
      const lngs = coords.map(c => c[0]);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      mapRef.current?.animateToRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: (maxLat - minLat) * 1.5,
        longitudeDelta: (maxLng - minLng) * 1.5,
      });
    }
  };

  // Zone colors for variety
  const zoneColors = [
    { stroke: '#1F8783', fill: 'rgba(31, 135, 131, 0.2)' },
    { stroke: '#3B82F6', fill: 'rgba(59, 130, 246, 0.2)' },
    { stroke: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.2)' },
    { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.2)' },
    { stroke: '#EF4444', fill: 'rgba(239, 68, 68, 0.2)' },
  ];

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={defaultCoords}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Service Area Polygons */}
        {zones.map((zone, index) => {
          if (!zone.polygon?.coordinates?.[0]) return null;

          const coordinates = zone.polygon.coordinates[0].map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));

          const colors = zoneColors[index % zoneColors.length];
          const isSelected = selectedZone?.id === zone.id;

          return (
            <Polygon
              key={zone.id}
              coordinates={coordinates}
              strokeColor={isSelected ? Colors.primary : colors.stroke}
              fillColor={isSelected ? 'rgba(31, 135, 131, 0.35)' : colors.fill}
              strokeWidth={isSelected ? 3 : 2}
              tappable
              onPress={() => setSelectedZone(zone)}
            />
          );
        })}

        {/* User Location Marker */}
        {userLocation && (
          <Marker coordinate={userLocation}>
            <View style={styles.userMarker}>
              <MapPin size={20} color="white" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Areas</Text>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => {}}
          >
            <Info size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Check My Location Button */}
      <TouchableOpacity
        style={styles.checkLocationButton}
        onPress={checkMyLocation}
        disabled={checkingLocation}
      >
        {checkingLocation ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Navigation size={22} color={Colors.primary} />
        )}
      </TouchableOpacity>

      {/* User Zone Status */}
      {userZoneInfo && (
        <View style={[
          styles.userZoneStatus,
          { backgroundColor: userZoneInfo.inServiceArea ? '#D1FAE5' : '#FEE2E2' }
        ]}>
          <CheckCircle2
            size={20}
            color={userZoneInfo.inServiceArea ? '#10B981' : '#EF4444'}
          />
          <View style={styles.userZoneTextContainer}>
            <Text style={[
              styles.userZoneTitle,
              { color: userZoneInfo.inServiceArea ? '#065F46' : '#991B1B' }
            ]}>
              {userZoneInfo.inServiceArea ? 'You are in a service area!' : 'You are outside service areas'}
            </Text>
            {userZoneInfo.zone && (
              <Text style={styles.userZoneName}>
                {locale === 'ar' ? userZoneInfo.zone.name_ar : userZoneInfo.zone.name_en}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Bottom Panel - Zone List */}
      <View style={styles.bottomPanel}>
        <View style={styles.panelHandle} />
        <Text style={styles.panelTitle}>
          {zones.length} Service {zones.length === 1 ? 'Area' : 'Areas'} Available
        </Text>

        {loading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.zonesList}
          >
            {zones.map((zone, index) => {
              const colors = zoneColors[index % zoneColors.length];
              const isSelected = selectedZone?.id === zone.id;

              return (
                <TouchableOpacity
                  key={zone.id}
                  style={[
                    styles.zoneCard,
                    isSelected && styles.zoneCardSelected,
                    { borderColor: isSelected ? Colors.primary : '#E5E7EB' }
                  ]}
                  onPress={() => focusOnZone(zone)}
                >
                  <View style={[styles.zoneColorDot, { backgroundColor: colors.stroke }]} />
                  <View style={styles.zoneCardContent}>
                    <Text style={styles.zoneCardName} numberOfLines={1}>
                      {locale === 'ar' ? zone.name_ar : zone.name_en}
                    </Text>
                    <Text style={styles.zoneCardCountry}>
                      {zone.country === 'EG' ? '🇪🇬 Egypt' : '🇦🇪 UAE'}
                    </Text>
                  </View>
                  {isSelected && (
                    <CheckCircle2 size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}

            {zones.length === 0 && (
              <View style={styles.noZonesContainer}>
                <MapPin size={24} color="#9CA3AF" />
                <Text style={styles.noZonesText}>No service areas defined yet</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Selected Zone Info */}
      {selectedZone && (
        <View style={styles.selectedZoneInfo}>
          <View style={styles.selectedZoneHeader}>
            <Text style={styles.selectedZoneName}>
              {locale === 'ar' ? selectedZone.name_ar : selectedZone.name_en}
            </Text>
            <TouchableOpacity onPress={() => setSelectedZone(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.selectedZoneDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Country</Text>
              <Text style={styles.detailValue}>
                {selectedZone.country === 'EG' ? '🇪🇬 Egypt' : '🇦🇪 UAE'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.activeStatus}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
          </View>
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
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
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
    fontSize: 17,
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
  infoButton: {
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
  checkLocationButton: {
    position: 'absolute',
    right: 16,
    top: height * 0.15,
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
  userZoneStatus: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userZoneTextContainer: {
    flex: 1,
  },
  userZoneTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  userZoneName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  userMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  zonesList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1.5,
    gap: 10,
    minWidth: 160,
  },
  zoneCardSelected: {
    backgroundColor: 'rgba(31, 135, 131, 0.05)',
  },
  zoneColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  zoneCardContent: {
    flex: 1,
  },
  zoneCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  zoneCardCountry: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  noZonesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  noZonesText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  selectedZoneInfo: {
    position: 'absolute',
    bottom: 150,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectedZoneName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  selectedZoneDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  activeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
});
