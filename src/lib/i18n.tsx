import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, Translations } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'phishlab-language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }

    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return (stored as Language) || 'en';
    } catch (error) {
      console.warn('Unable to read language from storage', error);
      return 'en';
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.warn('Unable to persist language selection', error);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}

// Helper to get language display name
export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    ru: 'Русский',
    uz: "O'zbek",
  };
  return names[lang];
}

// Helper to get language flag emoji
export function getLanguageFlag(lang: Language): string {
  const flags: Record<Language, string> = {
    en: '🇬🇧',
    ru: '🇷🇺',
    uz: '🇺🇿',
  };
  return flags[lang];
}
