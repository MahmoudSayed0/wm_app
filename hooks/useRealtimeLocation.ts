import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Location {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

interface WasherLocationUpdate extends Location {
  washer_id: string;
  order_id: string;
}

interface UseRealtimeLocationOptions {
  orderId: string;
  washerId?: string;
  onLocationUpdate?: (location: Location) => void;
  interpolate?: boolean;
}

interface UseRealtimeLocationReturn {
  currentLocation: Location | null;
  previousLocation: Location | null;
  isTracking: boolean;
  error: string | null;
  eta: number | null;
  startTracking: () => void;
  stopTracking: () => void;
}

// Calculate distance between two points in meters using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Calculate ETA based on distance and average speed
export function calculateETA(
  currentLocation: Location,
  destinationLat: number,
  destinationLng: number,
  averageSpeedKmh = 30
): number {
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    destinationLat,
    destinationLng
  );

  // Use actual speed if available, otherwise use average
  const speed = currentLocation.speed || (averageSpeedKmh * 1000) / 3600; // Convert to m/s

  if (speed <= 0) return 0;

  return Math.round(distance / speed / 60); // Return minutes
}

export function useRealtimeLocation({
  orderId,
  washerId,
  onLocationUpdate,
  interpolate = true,
}: UseRealtimeLocationOptions): UseRealtimeLocationReturn {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [previousLocation, setPreviousLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eta, setEta] = useState<number | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const interpolationFrameRef = useRef<number | null>(null);
  const destinationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Set destination for ETA calculation
  const setDestination = useCallback((lat: number, lng: number) => {
    destinationRef.current = { lat, lng };
  }, []);

  // Smooth location interpolation for fluid map movement
  const interpolateLocation = useCallback(
    (from: Location, to: Location, duration = 1000) => {
      if (!interpolate) {
        setCurrentLocation(to);
        return;
      }

      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);

        const interpolated: Location = {
          latitude: from.latitude + (to.latitude - from.latitude) * eased,
          longitude: from.longitude + (to.longitude - from.longitude) * eased,
          heading: to.heading,
          speed: to.speed,
          timestamp: to.timestamp,
        };

        setCurrentLocation(interpolated);

        // Calculate ETA if destination is set
        if (destinationRef.current) {
          const newEta = calculateETA(
            interpolated,
            destinationRef.current.lat,
            destinationRef.current.lng
          );
          setEta(newEta);
        }

        if (progress < 1) {
          interpolationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      if (interpolationFrameRef.current) {
        cancelAnimationFrame(interpolationFrameRef.current);
      }

      interpolationFrameRef.current = requestAnimationFrame(animate);
    },
    [interpolate]
  );

  const startTracking = useCallback(() => {
    if (channelRef.current) return;

    const channel = supabase
      .channel(`washer-location:${orderId}`)
      .on('broadcast', { event: 'location' }, (payload) => {
        const update = payload.payload as WasherLocationUpdate;

        // Only process if for our washer (if specified)
        if (washerId && update.washer_id !== washerId) return;

        const newLocation: Location = {
          latitude: update.latitude,
          longitude: update.longitude,
          heading: update.heading,
          speed: update.speed,
          timestamp: update.timestamp,
        };

        setCurrentLocation((prev) => {
          if (prev) {
            setPreviousLocation(prev);
            interpolateLocation(prev, newLocation);
          } else {
            setCurrentLocation(newLocation);
            // Calculate initial ETA
            if (destinationRef.current) {
              const newEta = calculateETA(
                newLocation,
                destinationRef.current.lat,
                destinationRef.current.lng
              );
              setEta(newEta);
            }
          }
          return prev;
        });

        onLocationUpdate?.(newLocation);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsTracking(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Failed to connect to location tracking');
          setIsTracking(false);
        }
      });

    channelRef.current = channel;
  }, [orderId, washerId, onLocationUpdate, interpolateLocation]);

  const stopTracking = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (interpolationFrameRef.current) {
      cancelAnimationFrame(interpolationFrameRef.current);
      interpolationFrameRef.current = null;
    }

    setIsTracking(false);
  }, []);

  // Auto-start tracking when component mounts
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (interpolationFrameRef.current) {
        cancelAnimationFrame(interpolationFrameRef.current);
      }
    };
  }, []);

  return {
    currentLocation,
    previousLocation,
    isTracking,
    error,
    eta,
    startTracking,
    stopTracking,
  };
}
