import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { MOCK_PROVIDERS, MockProvider } from '../data/mockMarketplace';

interface MarketplaceContextType {
  providers: MockProvider[];
  currentPartnerProvider: MockProvider | null;
  addProviderListing: (newProvider: MockProvider) => Promise<void>;
  setCurrentPartnerProvider: (provider: MockProvider | null) => void;
  getProviderById: (id: string) => MockProvider | undefined;
}

const CUSTOM_LISTINGS_KEY = 'servzit.custom_partner_listings';
const CURRENT_PARTNER_KEY = 'servzit.current_partner_provider_id';

const MarketplaceContext = createContext<MarketplaceContextType>({
  providers: MOCK_PROVIDERS,
  currentPartnerProvider: null,
  addProviderListing: async () => {},
  setCurrentPartnerProvider: () => {},
  getProviderById: () => undefined,
});

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [providers, setProviders] = useState<MockProvider[]>(MOCK_PROVIDERS);
  const [currentPartnerProvider, setCurrentPartnerProviderState] = useState<MockProvider | null>(null);

  // Restore custom listings and partner state on app load
  useEffect(() => {
    (async () => {
      try {
        const storedListingsJson = await SecureStore.getItemAsync(CUSTOM_LISTINGS_KEY);
        const storedPartnerId = await SecureStore.getItemAsync(CURRENT_PARTNER_KEY);

        let mergedList = [...MOCK_PROVIDERS];
        if (storedListingsJson) {
          const parsed: MockProvider[] = JSON.parse(storedListingsJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Prepend custom listings so they appear at top of results
            mergedList = [...parsed, ...MOCK_PROVIDERS.filter((p) => !parsed.some((x) => x.id === p.id))];
          }
        }
        setProviders(mergedList);

        if (storedPartnerId) {
          const matched = mergedList.find((p) => p.id === storedPartnerId);
          if (matched) setCurrentPartnerProviderState(matched);
        } else if (mergedList.length > 0) {
          setCurrentPartnerProviderState(mergedList[0]);
        }
      } catch (err) {
        // fallback to default mock providers
        setProviders(MOCK_PROVIDERS);
      }
    })();
  }, []);

  const addProviderListing = async (newProvider: MockProvider) => {
    setProviders((prev) => {
      const updated = [newProvider, ...prev.filter((p) => p.id !== newProvider.id)];
      // persist custom listings
      const customOnly = updated.filter((p) => p.id.startsWith('custom-') || !MOCK_PROVIDERS.some((m) => m.id === p.id));
      SecureStore.setItemAsync(CUSTOM_LISTINGS_KEY, JSON.stringify(customOnly)).catch(() => {});
      return updated;
    });

    setCurrentPartnerProviderState(newProvider);
    try {
      await SecureStore.setItemAsync(CURRENT_PARTNER_KEY, newProvider.id);
    } catch {}
  };

  const setCurrentPartnerProvider = (provider: MockProvider | null) => {
    setCurrentPartnerProviderState(provider);
    if (provider) {
      SecureStore.setItemAsync(CURRENT_PARTNER_KEY, provider.id).catch(() => {});
    } else {
      SecureStore.deleteItemAsync(CURRENT_PARTNER_KEY).catch(() => {});
    }
  };

  const getProviderById = (id: string) => {
    return providers.find((p) => p.id === id);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        providers,
        currentPartnerProvider,
        addProviderListing,
        setCurrentPartnerProvider,
        getProviderById,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => useContext(MarketplaceContext);

