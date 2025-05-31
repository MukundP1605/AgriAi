import React from 'react';

const TailwindTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-green-800 mb-4">AgriAI Tailwind Test</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Tailwind CSS is Working!</h2>
          <p className="text-gray-600">This component is styled entirely with Tailwind CSS classes.</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm">Plant Health</span>
          <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm">Crop Analysis</span>
          <span className="px-4 py-2 bg-amber-500 text-white rounded-full text-sm">Soil Testing</span>
        </div>
        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition duration-300">
          Continue to Dashboard
        </button>
      </div>
      <p className="mt-4 text-sm text-gray-600">Tailwind CSS v3 with Vite</p>
    </div>
  );
};

export default TailwindTest;
