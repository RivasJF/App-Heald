import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await AsyncStorage.setItem('appTheme', newValue ? 'dark' : 'light');
  };

  const theme = useMemo(() => ({
    isDarkMode,
    statusBarStyle: isDarkMode ? 'light' : 'dark',
    colors: isDarkMode ? {
      background: '#121A2D', // Azul medianoche oscuro
      card: '#1C263F',       // Azul grisáceo para tarjetas
      text: '#E0E6ED',       // Blanco suave
      subtitle: '#94A3B8',   // Gris azulado claro
      primary: '#4CAFED',    // Azul acento original
      border: '#2D3748',
      error: '#FF6B6B',
      white: '#FFFFFF',
    } : {
      background: '#F5F8FF', // Azul muy claro original
      card: '#FFFFFF',       // Blanco original
      text: '#072B66',       // Azul oscuro original
      subtitle: '#6B82B1',   // Azul grisáceo original
      primary: '#3F51B5',    // Azul indigo
      border: '#E8EAF6',
      error: '#D9534F',
      white: '#FFFFFF',
    }
  }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);