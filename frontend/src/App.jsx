import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AgriAIFormsPage from './components/CropForm';
import Navbar from './components/Navbar';
import DiseaseUpload from './pages/Disease';
import Chat from './pages/Chat'; 
import Home from './pages/Home';
import Crop from './pages/Crop';
import './App.css';
import Login from "./pages/Login";
import TestTailwind from "./pages/TestTailwind";
import TailwindTest from "./pages/TailwindTest";

// Layout component to conditionally render hero section
const AppLayout = () => {
  const location = useLocation();
  const hideHeroSection = ['/chat', '/crop', '/disease'].includes(location.pathname);
  
  return (
    <>
      <Navbar />
      
      {/* Hero Section - only show on routes that aren't chat, crop, or disease */}
      {!hideHeroSection && (
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-green-600/80 to-teal-700/90"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                Agri<span className="text-emerald-200 drop-shadow-lg">AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-emerald-50 max-w-4xl mx-auto leading-relaxed mb-12 font-light">
                Your intelligent farming companion powered by AI. Get crop recommendations, 
                disease detection, and expert agricultural advice.
              </p>
              
              {/* Modern Feature Pills */}
              <div className="flex flex-wrap gap-4 justify-center mb-12">
                <div className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <span className="text-2xl mr-3">🌱</span>
                  <span className="font-medium">Smart Crop Planning</span>
                </div>
                <div className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <span className="text-2xl mr-3">🔬</span>
                  <span className="font-medium">Disease Detection</span>
                </div>
                <div className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <span className="text-2xl mr-3">💬</span>
                  <span className="font-medium">AI Assistant</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-2xl hover:bg-emerald-50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  Get Started
                </button>
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-emerald-600 transition-all duration-300 hover:scale-105">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`relative ${hideHeroSection ? 'h-[calc(100vh-4rem)]' : ''} bg-gradient-to-br from-slate-50 to-emerald-50`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crop" element={<Crop />} />
          <Route path="/disease" element={<DiseaseUpload />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/forms" element={<AgriAIFormsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/test" element={<TestTailwind />} />
          <Route path="/tailwind-test" element={<TailwindTest />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <Router>
        <div className="app-container">
          <AppLayout />
        </div>
      </Router>
    </div>
  );
}

export default App;

