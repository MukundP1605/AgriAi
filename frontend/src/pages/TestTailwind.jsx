import React, { useState } from "react";

const TestTailwind = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Tailwind Test</h1>
        <p className="text-gray-600 mb-6">
          If you're seeing this styled nicely with a gradient background, rounded corners, and proper spacing, 
          then Tailwind CSS is working correctly!
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestTailwind;
