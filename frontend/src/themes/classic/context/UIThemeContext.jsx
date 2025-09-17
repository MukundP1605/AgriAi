import React, { createContext, useContext } from 'react';

// Create the Theme Context
const UIThemeContext = createContext();

// Theme Provider Component - Always classic theme
export const UIThemeProvider = ({ children }) => {  
  const value = {
    theme: 'classic',
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