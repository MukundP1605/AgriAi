import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AgriAIFormsPage from './components/CropForm';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DiseaseUpload from './pages/Disease';
import Chat from './pages/Chat'; 
import Home from './pages/Home';
import Crop from './pages/Crop';
import About from './pages/About';
import './App.css';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import History from "./pages/History";
import TestEnhancedFeatures from "./pages/TestEnhancedFeatures";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import { AuthProvider } from './context/AuthContext';

// Layout component to conditionally render hero section and footer
const AppLayout = () => {
  const location = useLocation();
  const hideHeroSection = ['/chat', '/crop', '/disease', '/profile', '/settings', '/history', '/test-enhanced', '/enhanced-dashboard', '/login', '/signup'].includes(location.pathname);
  const hideFooter = ['/chat'].includes(location.pathname); // Only hide footer on chat page
  
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      
      {/* Hero Section - only show on routes that aren't chat, crop, or disease */}
{!hideHeroSection && (
  <section
    className="bg-gradient-radial from-green-400 via-green-500 to-green-600 text-white py-16"
    style={{
      background: 'radial-gradient(ellipse at center, #16a34a 0%, #15803d 70%, #14532d 100%)',
    }}
  >
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h1 className="text-5xl font-bold mb-6">
        <span className="text-white">Agri</span>
        <span className="text-green-300">AI</span>
      </h1>
      <p className="text-lg mb-8 text-white max-w-2xl mx-auto">
        Welcome to AgriAI — your smart agriculture partner. Our advanced AI technology helps farmers
        make better decisions, boost productivity, and protect crops with timely insights and expert guidance.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-4 justify-center">
        <a
          href="/signup"
          className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
        >
          Sign Up
        </a>
        <a
          href="/about"
          className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors duration-200"
        >
          Learn More
        </a>
      </div>
    </div>
  </section>
)}

      {/* Main Content */}
      <div className={`relative ${hideHeroSection ? 'h-[calc(100vh-4rem)]' : ''} bg-white text-gray-900`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crop" element={<Crop />} />
          <Route path="/disease" element={<DiseaseUpload />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/about" element={<About />} />
          <Route path="/forms" element={<AgriAIFormsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="/test-enhanced" element={<TestEnhancedFeatures />} />
          <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;

