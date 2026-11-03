import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export type AppMode = 'customer' | 'provider';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
  toggleMode: () => Promise<void>;
  isOnline: boolean;
  toggleOnline: () => void;
  hasChosenInitialRole: boolean;
  setHasChosenInitialRole: (chosen: boolean) => Promise<void>;
}

const MODE_KEY = 'servzit.app_mode';
const ROLE_CHOSEN_KEY = 'servzit.has_chosen_role';

const AppModeContext = createContext<AppModeContextType>({
  mode: 'customer',
  setMode: async () => {},
  toggleMode: async () => {},
  isOnline: true,
  toggleOnline: () => {},
  hasChosenInitialRole: false,
  setHasChosenInitialRole: async () => {},
});

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>('customer');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [hasChosenInitialRole, setChosenState] = useState<boolean>(true); // default true for immediate navigation

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync(MODE_KEY),
      SecureStore.getItemAsync(ROLE_CHOSEN_KEY),
    ])
      .then(([savedMode, savedChosen]) => {
        if (savedMode === 'provider' || savedMode === 'customer') {
          setModeState(savedMode);
        }
        if (savedChosen !== null) {
          setChosenState(savedChosen === 'true');
        }
      })
      .catch(() => {});
  }, []);

  const setMode = async (newMode: AppMode) => {
    setModeState(newMode);
    try {
      await SecureStore.setItemAsync(MODE_KEY, newMode);
    } catch {}
  };

  const toggleMode = async () => {
    const next = mode === 'customer' ? 'provider' : 'customer';
    await setMode(next);
  };

  const toggleOnline = () => {
    setIsOnline((prev) => !prev);
  };

  const setHasChosenInitialRole = async (chosen: boolean) => {
    setChosenState(chosen);
    try {
      await SecureStore.setItemAsync(ROLE_CHOSEN_KEY, chosen ? 'true' : 'false');
    } catch {}
  };

  return (
    <AppModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isOnline,
        toggleOnline,
        hasChosenInitialRole,
        setHasChosenInitialRole,
      }}
    >
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => useContext(AppModeContext);

