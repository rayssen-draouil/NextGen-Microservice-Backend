import { createContext, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('foodly-lang', lang);
  };

  const value = useMemo(
    () => ({ language: i18n.language?.startsWith('fr') ? 'fr' : 'en', setLanguage }),
    [i18n.language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return context;
}
