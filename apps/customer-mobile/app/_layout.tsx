import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AreaPickerModal } from '../src/components/home/AreaPickerModal';
import { AppModeProvider } from '../src/context/AppModeContext';
import { LanguageProvider } from '../src/context/LanguageContext';
import { LocationProvider } from '../src/context/LocationContext';
import { MarketplaceProvider } from '../src/context/MarketplaceContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppModeProvider>
          <LocationProvider>
            <MarketplaceProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
              <AreaPickerModal />
            </MarketplaceProvider>
          </LocationProvider>
        </AppModeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
