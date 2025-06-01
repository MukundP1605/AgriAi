import React from 'react';
import { useUITheme } from '../context/UIThemeContext';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useUITheme();
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={toggleTheme}
        className={`flex items-center justify-center p-3 rounded-full shadow-lg transition-all duration-300
          ${theme === 'classic' 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-dark-elevated text-neon-purple hover:bg-dark-border'
          }`}
        title={`Switch to ${theme === 'classic' ? 'Futuristic' : 'Classic'} theme`}
      >
        {theme === 'classic' ? (
          // Icon for switching to futuristic
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        ) : (
          // Icon for switching to classic
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )}
      </button>
    </div>
  );
}
