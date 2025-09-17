import React, { createContext, useContext, useState } from 'react';

// Create the Theme Context
const UIThemeContext = createContext();

// Theme Provider Component
export const UIThemeProvider = ({ children }) => {  
  // Always use classic theme since futuristic is removed
  const [theme, setTheme] = useState('classic');

  // Value to be provided to consumers
  const value = {
    theme,
    setTheme,
    isClassic: true,
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
