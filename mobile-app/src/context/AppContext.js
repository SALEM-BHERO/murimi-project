import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, saveToken, saveUser, clearStorage } from '../services/storage';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [language, setLanguage] = useState('en');
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved auth state and language on app start
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedToken = await getToken();
        const savedUser = await getUser();
        // Assume getLanguage is in storage.js, we'll add it if missing
        // const savedLang = await getLanguage(); 
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
        }
        // if (savedLang) setLanguage(savedLang);
      } catch (e) {
        console.warn('Failed to load auth state:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = async (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    await saveToken(tokenValue);
    await saveUser(userData);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setDetectionHistory([]);
    await clearStorage();
  };

  const changeLanguage = async (lang) => {
    setLanguage(lang);
    // await saveLanguage(lang);
  };

  const value = {
    user,
    setUser,
    token,
    language,
    changeLanguage,
    isLoading,
    login,
    logout,
    detectionHistory,
    setDetectionHistory
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
