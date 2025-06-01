import React from 'react';
import { useUITheme } from '../../../context/UIThemeContext';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useUITheme();
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center p-3 rounded-full bg-white shadow-md border border-agri-border hover:bg-gray-100 transition-all duration-300"
        aria-label="Toggle theme"
      >
        {theme === 'classic' ? (
          <span className="text-xl">🚀</span>
        ) : (
          <span className="text-agri-green text-xl">🌱</span>
        )}
      </button>
      <div className="mt-2 text-xs text-center text-agri-green">
        Switch to {theme === 'classic' ? 'Futuristic' : 'Classic'}
      </div>
    </div>
  );
}
