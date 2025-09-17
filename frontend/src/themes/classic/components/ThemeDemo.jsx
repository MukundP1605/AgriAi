import React from 'react';

export default function ThemeDemo() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Classic Theme Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card with classic styling */}
        <div className="bg-white border border-agri-border rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-agri-green">Themed Card</h3>
          <p className="text-gray-600 mb-4">
            This card uses theme-specific Tailwind classes like bg-white and border-agri-border
            This is the classic theme component that provides a clean and traditional interface.
          </p>
          <button className="bg-agri-green hover:bg-agri-greenLight text-white px-4 py-2 rounded transition-all duration-300">
            Classic Button
          </button>
        </div>
        
        {/* Another card with different styling */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow">
          <h3 className="text-xl font-semibold mb-3 text-agri-accent">Light Card</h3>
          <p className="text-gray-600 mb-4">
            This card demonstrates the clean, minimalist design of the classic theme.
          </p>
          <div className="flex space-x-2">
            <span className="inline-block px-3 py-1 bg-agri-green/10 text-agri-green text-sm rounded-full border border-agri-green/30">
              Classic
            </span>
            <span className="inline-block px-3 py-1 bg-agri-greenLight/10 text-agri-greenLight text-sm rounded-full border border-agri-greenLight/30">
              Theme
            </span>
            <span className="inline-block px-3 py-1 bg-agri-accent/10 text-agri-accent text-sm rounded-full border border-agri-accent/30">
              Specific
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Theme Separation Testing</h3>
        <p className="text-gray-600 mb-4">
          This component demonstrates that the classic theme styles are correctly isolated and won't
          This provides a clean, traditional design within the classic theme.
        </p>
        <div className="bg-gradient-to-r from-agri-green to-agri-greenLight p-4 rounded-lg text-white">
          <p>This gradient uses the theme-specific agri colors.</p>
        </div>
      </div>
    </div>
  );
}
