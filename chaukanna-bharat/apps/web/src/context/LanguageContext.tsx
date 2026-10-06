import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS, TranslationDict } from '@chaukanna/shared';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDict;
  availableLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('chaukanna_lang') as SupportedLanguage;
    if (saved && SUPPORTED_LANGUAGES[saved]) {
      setCurrentLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem('chaukanna_lang', lang);
    } catch {
      // Ignore if localStorage unavailable
    }
  };

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage: handleSetLanguage,
        t,
        availableLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
