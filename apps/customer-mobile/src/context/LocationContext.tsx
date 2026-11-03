import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface Area {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  formattedAddress?: string;
}

export const POPULAR_AREAS: Area[] = [
  { id: 'hyd-madhapur', name: 'Madhapur', city: 'Hyderabad', state: 'Telangana', pincode: '500081', lat: 17.4483, lng: 78.3915, formattedAddress: 'Cyber Towers, Madhapur, Hyderabad • 500081' },
  { id: 'hyd-gachibowli', name: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', pincode: '500032', lat: 17.4401, lng: 78.3489, formattedAddress: 'Financial District, Gachibowli, Hyderabad • 500032' },
  { id: 'hyd-kondapur', name: 'Kondapur', city: 'Hyderabad', state: 'Telangana', pincode: '500084', lat: 17.4699, lng: 78.3578, formattedAddress: 'Botanical Garden Rd, Kondapur, Hyderabad • 500084' },
  { id: 'hyd-jubilee', name: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', lat: 17.4319, lng: 78.4073, formattedAddress: 'Road No 36, Jubilee Hills, Hyderabad • 500033' },
  { id: 'hyd-banjara', name: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', lat: 17.4156, lng: 78.4357, formattedAddress: 'Road No 12, Banjara Hills, Hyderabad • 500034' },
  { id: 'hyd-kukatpally', name: 'Kukatpally', city: 'Hyderabad', state: 'Telangana', pincode: '500072', lat: 17.4933, lng: 78.3986, formattedAddress: 'KPHB Colony, Kukatpally, Hyderabad • 500072' },
  { id: 'vja-benzcircle', name: 'Benz Circle', city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520010', lat: 16.4971, lng: 80.6554, formattedAddress: 'MG Road, Benz Circle, Vijayawada • 520010' },
  { id: 'vizag-mvp', name: 'MVP Colony', city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530017', lat: 17.7431, lng: 83.3374, formattedAddress: 'Beach Road, MVP Colony, Visakhapatnam • 530017' },
];

interface LocationContextType {
  currentArea: Area;
  setCurrentArea: (area: Area) => void;
  isDetecting: boolean;
  detectLocation: () => Promise<void>;
  permissionGranted: boolean;
  isAreaModalVisible: boolean;
  openAreaModal: () => void;
  closeAreaModal: () => void;
  lastDetectedCoords?: { lat: number; lng: number };
}

const LocationContext = createContext<LocationContextType>({
  currentArea: POPULAR_AREAS[0],
  setCurrentArea: () => {},
  isDetecting: false,
  detectLocation: async () => {},
  permissionGranted: false,
  isAreaModalVisible: false,
  openAreaModal: () => {},
  closeAreaModal: () => {},
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentArea, setCurrentArea] = useState<Area>(POPULAR_AREAS[0]); // Default Madhapur
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isAreaModalVisible, setIsAreaModalVisible] = useState<boolean>(false);
  const [lastDetectedCoords, setLastDetectedCoords] = useState<{ lat: number; lng: number } | undefined>();

  // Attempt to fetch GPS location on startup
  useEffect(() => {
    void detectLocation();
  }, []);

  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);

        // Step 1: Immediately read last known position for near-instant response
        const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
        if (lastKnown) {
          applyCoords(lastKnown.coords.latitude, lastKnown.coords.longitude);
        }

        // Step 2: Query precise current position
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        await applyCoords(position.coords.latitude, position.coords.longitude);
      }
    } catch (e) {
      // Keep existing area if permission denied or GPS unavailable
    } finally {
      setIsDetecting(false);
    }
  };

  const applyCoords = async (latitude: number, longitude: number) => {
    setLastDetectedCoords({ lat: latitude, lng: longitude });

    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode && geocode.length > 0) {
        const item = geocode[0];
        const locality =
          item.district ||
          item.subregion ||
          item.name ||
          item.street ||
          'Current Location';
        const city = item.city || item.region || 'Hyderabad';
        const pincode = item.postalCode || '500081';
        const state = item.region || 'Telangana';

        setCurrentArea({
          id: `gps-${Date.now()}`,
          name: locality,
          city,
          state,
          pincode,
          lat: latitude,
          lng: longitude,
          formattedAddress: `${locality}, ${city} • ${pincode}`,
        });
      }
    } catch {
      // Reverse geocode fallback
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentArea,
        setCurrentArea,
        isDetecting,
        detectLocation,
        permissionGranted,
        isAreaModalVisible,
        openAreaModal: () => setIsAreaModalVisible(true),
        closeAreaModal: () => setIsAreaModalVisible(false),
        lastDetectedCoords,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
