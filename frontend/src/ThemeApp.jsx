import React, { useEffect, useState } from 'react';
import { useUITheme } from './context/UIThemeContext';
import ClassicApp from './themes/classic/ClassicApp';
import FuturisticApp from './themes/futuristic/FuturisticApp';
import ThemeSwitcher from './components/ThemeSwitcher';

// Theme debug panel component
const ThemeDebugPanel = ({ theme, showDebug, onToggleDebug }) => {
  if (!showDebug) return null;
  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Theme Debug Info</h3>
        <button onClick={onToggleDebug} className="text-xs bg-gray-700 px-2 py-1 rounded">
          Hide
        </button>
      </div>
      <div className="text-sm space-y-1">
        <p>Active Theme: {theme}</p>
        <p>HTML Classes: {document.documentElement.className}</p>
        <p>Body Classes: {document.body.className}</p>
        <p>localStorage Theme: {localStorage.getItem('uiTheme')}</p>
      </div>
    </div>
  );
};

// Debug mode - set to true to show theme debug information
const DEBUG_THEME = true;

export default function ThemeApp() {
  const { theme, toggleTheme } = useUITheme();
  const [showDebug, setShowDebug] = useState(DEBUG_THEME);
  
  // Apply theme-specific class to the root element to help with CSS scoping
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove('theme-classic', 'theme-futuristic');
    // Add the current theme class
    document.documentElement.classList.add(`theme-${theme}`);
    // Update the body class as well for additional styling hooks
    document.body.classList.remove('theme-classic', 'theme-futuristic');
    document.body.classList.add(`theme-${theme}`);
      console.log(`Theme changed to: ${theme}`);
    console.log(`HTML classes: ${document.documentElement.className}`);
    console.log(`BODY classes: ${document.body.className}`);
  }, [theme]);

  // Add keyboard shortcut for debug panel
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Shift+D to toggle debug panel
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      {theme === 'futuristic' ? <FuturisticApp /> : <ClassicApp />}
      <ThemeSwitcher />
      <ThemeDebugPanel 
        theme={theme} 
        showDebug={showDebug} 
        onToggleDebug={() => setShowDebug(!showDebug)} 
      />
      {/* Keyboard shortcut for debug panel */}
      <div className="sr-only" aria-hidden="true">
        Press Ctrl+Shift+D to toggle debug panel
      </div>
    </>
  );
}
