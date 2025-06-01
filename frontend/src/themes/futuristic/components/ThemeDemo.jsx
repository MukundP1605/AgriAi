import React from 'react';

export default function ThemeDemo() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Futuristic Theme Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card with futuristic styling */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 shadow-glass">
          <h3 className="text-xl font-semibold mb-3 text-neon-purple">Themed Card</h3>
          <p className="text-gray-300 mb-4">
            This card uses theme-specific Tailwind classes like bg-dark-card and border-dark-border
            that won't interfere with the classic theme.
          </p>
          <button className="bg-dark-elevated hover:bg-dark-border text-neon-emerald px-4 py-2 rounded border border-neon-purple/30 transition-all duration-300 futuristic-button">
            Futuristic Button
          </button>
        </div>
        
        {/* Another card with different styling */}
        <div className="bg-dark-elevated/50 backdrop-blur-md border border-dark-border/50 rounded-lg p-6 shadow-neon">
          <h3 className="text-xl font-semibold mb-3 text-neon-pink">Glass Card</h3>
          <p className="text-gray-300 mb-4">
            This card demonstrates glass morphism using theme-specific classes and CSS variables.
          </p>
          <div className="flex space-x-2">
            <span className="inline-block px-3 py-1 bg-dark-bg text-neon-purple text-sm rounded-full border border-neon-purple/30">
              Futuristic
            </span>
            <span className="inline-block px-3 py-1 bg-dark-bg text-neon-emerald text-sm rounded-full border border-neon-emerald/30">
              Theme
            </span>
            <span className="inline-block px-3 py-1 bg-dark-bg text-neon-pink text-sm rounded-full border border-neon-pink/30">
              Specific
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-dark-bg border border-dark-border rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Theme Separation Testing</h3>
        <p className="text-gray-300 mb-4">
          This component demonstrates that the futuristic theme styles are correctly isolated and won't
          affect the classic theme. The theme-specific classes are prefixed with .theme-futuristic.
        </p>
        <div className="bg-gradient-to-r from-neon-purple to-neon-pink p-4 rounded-lg text-white">
          <p>This gradient uses the theme-specific neon colors.</p>
        </div>
      </div>
    </div>
  );
}
