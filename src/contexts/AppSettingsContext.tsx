import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface AppSettingsContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isDarkTheme: boolean;
  setIsDarkTheme: (dark: boolean) => void;
  toggleTheme: () => void;
  t: (typeof TRANSLATIONS)['es'] | (typeof TRANSLATIONS)['en'];
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('devagile_lang');
      return saved === 'en' || saved === 'es' ? saved : 'es';
    } catch {
      return 'es';
    }
  });

  // Default to light mode so the "Modo Oscuro" toggle visibly activates dark mode
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('devagile_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('devagile_lang', language);
    } catch {
      // ignore storage errors
    }
    document.documentElement.lang = language;
    document.title =
      language === 'es'
        ? 'DevAgile & AgileStack - Microservicios Docker, Kubernetes y Gestión Ágil'
        : 'DevAgile & AgileStack - Docker Microservices, Kubernetes & Agile Management';
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('devagile_theme', isDarkTheme ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  const t = TRANSLATIONS[language];

  return (
    <AppSettingsContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isDarkTheme,
        setIsDarkTheme,
        toggleTheme,
        t,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = (): AppSettingsContextValue => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return ctx;
};
