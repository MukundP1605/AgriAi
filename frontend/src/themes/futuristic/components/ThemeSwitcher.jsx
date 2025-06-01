import React from 'react';
import { useUITheme } from '../../../context/UIThemeContext';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useUITheme();
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center p-3 rounded-full bg-dark-elevated shadow-neon border border-dark-border hover:bg-dark-border transition-all duration-300"
        aria-label="Toggle theme"
      >
        {theme === 'futuristic' ? (
          <span className="text-neon-emerald text-xl">🌱</span>
        ) : (
          <span className="text-xl">🚀</span>
        )}
      </button>
      <div className="mt-2 text-xs text-center text-neon-purple">
        Switch to {theme === 'futuristic' ? 'Classic' : 'Futuristic'}
      </div>
    </div>
  );
}
