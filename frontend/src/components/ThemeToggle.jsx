import React from 'react';
import { useUITheme } from '../context/UIThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useUITheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
      aria-label={`Switch to ${theme === 'classic' ? 'futuristic' : 'classic'} theme`}
    >
      <span className="mr-2">
        {theme === 'classic' ? '🌙' : '☀️'}
      </span>
      <span className="text-sm font-medium">
        {theme === 'classic' ? 'Futuristic' : 'Classic'}
      </span>
    </button>
  );
};

export default ThemeToggle;
