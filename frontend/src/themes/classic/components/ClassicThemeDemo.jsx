import React from 'react';

export default function ClassicThemeDemo() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-agri-green">Classic Theme Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card with classic styling */}
        <div className="bg-agri-card border border-agri-border rounded-lg p-6 shadow">
          <h3 className="text-xl font-semibold mb-3 text-agri-green">Themed Card</h3>
          <p className="text-gray-700 mb-4">
            This card uses theme-specific Tailwind classes like bg-agri-card and border-agri-border
            that won't interfere with the futuristic theme.
          </p>
          <button className="bg-agri-green hover:bg-agri-greenLight text-white px-4 py-2 rounded transition-all duration-300">
            Classic Button
          </button>
        </div>
        
        {/* Another card with different styling */}
        <div className="bg-white border border-agri-border rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-agri-accent">Light Card</h3>
          <p className="text-gray-700 mb-4">
            This card demonstrates classic styling using theme-specific classes.
          </p>
          <div className="flex space-x-2">
            <span className="inline-block px-3 py-1 bg-agri-green text-white text-sm rounded-full">
              Classic
            </span>
            <span className="inline-block px-3 py-1 bg-agri-greenLight text-white text-sm rounded-full">
              Theme
            </span>
            <span className="inline-block px-3 py-1 bg-agri-accent text-white text-sm rounded-full">
              Specific
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-agri-border rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Theme Separation Testing</h3>
        <p className="text-gray-700 mb-4">
          This component demonstrates that the classic theme styles are correctly isolated and won't
          affect the futuristic theme. The theme-specific classes are prefixed with .theme-classic.
        </p>
        <div className="bg-gradient-to-r from-agri-green to-agri-greenLight p-4 rounded-lg text-white">
          <p>This gradient uses the theme-specific agri colors.</p>
        </div>
      </div>
    </div>
  );
}
