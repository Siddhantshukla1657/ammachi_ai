import React, { createContext, useState, useContext, useEffect } from 'react';
import { getLanguage, setLanguage } from '../utils/translate';

// Create a context for language
const LanguageContext = createContext();

/**
 * Provider component for language context
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Provider component
 */
export function LanguageProvider({ children }) {
  // Initialize state with the current language from localStorage or default to English
  const [language, setCurrentLanguage] = useState(getLanguage());

  // Update language in both state and utility when it changes
  const changeLanguage = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  // Sync with localStorage on mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem('ammachi_language');
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
      setLanguage(storedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Custom hook to use the language context
 * @returns {Object} - Language context value
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}