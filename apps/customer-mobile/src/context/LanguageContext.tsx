import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Language, TRANSLATIONS, Translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: Translations;
}

const LANGUAGE_KEY = 'servzit.preferred_language';

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: TRANSLATIONS.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Language>('en');

  useEffect(() => {
    SecureStore.getItemAsync(LANGUAGE_KEY)
      .then((saved) => {
        if (saved && (saved === 'en' || saved === 'te' || saved === 'hi')) {
          setLangState(saved as Language);
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = async (lang: Language) => {
    setLangState(lang);
    try {
      await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
    } catch {}
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

