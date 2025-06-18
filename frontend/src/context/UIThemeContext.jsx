import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Theme Context
const UIThemeContext = createContext();

// Theme Provider Component
export const UIThemeProvider = ({ children }) => {  // Initialize theme from localStorage or default to 'classic'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('uiTheme');
    return savedTheme || 'classic';
  });

  // Toggle between classic and futuristic themes
  const toggleTheme = () => {
    const newTheme = theme === 'classic' ? 'futuristic' : 'classic';
    setTheme(newTheme);
  };

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('uiTheme', theme);
  }, [theme]);

  // Value to be provided to consumers
  const value = {
    theme,
    setTheme,
    toggleTheme,
    isClassic: theme === 'classic',
    isFuturistic: theme === 'futuristic'
  };

  return (
    <UIThemeContext.Provider value={value}>
      {children}
    </UIThemeContext.Provider>
  );
};

// Custom hook for consuming the theme context
export const useUITheme = () => {
  const context = useContext(UIThemeContext);
  if (context === undefined) {
    throw new Error('useUITheme must be used within a UIThemeProvider');
  }
  return context;
};

export default UIThemeContext;
