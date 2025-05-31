import React, { createContext, useContext, useState, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check for user preference or saved theme in local storage
  const [darkMode, setDarkMode] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return false; // Default to light mode on server
    }
    
    try {
      const savedTheme = localStorage.getItem('theme');
      
      // If user has previously selected a theme, use it
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // Otherwise check for system preference
      const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemPrefersDark;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return false; // Default to light mode on error
    }
  });  // Update local storage and apply class to HTML element when theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }    
    
    // Apply transition class before changing theme
    document.documentElement.classList.add('theme-transition');
    
    // Apply dark mode classes to HTML and body elements
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#171923'; // Dark background (matches dark.300)
      document.body.style.color = '#f3f4f6'; // Light text
      
      // Add meta theme-color for mobile devices
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.content = '#171923';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff'; // Explicitly set white for light mode
      document.body.style.color = '#1a202c'; // Default text color
      
      // Reset meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.content = '#ffffff';      }
    }
  }, [darkMode]);

  // Remove transition class after theme change completes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [darkMode]);

  // Toggle theme function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
