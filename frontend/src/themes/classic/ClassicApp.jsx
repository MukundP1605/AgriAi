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
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import History from './pages/History';
import TestEnhancedFeatures from './pages/TestEnhancedFeatures';
import EnhancedDashboard from './pages/EnhancedDashboard';
import ClassicThemeDemo from './components/ClassicThemeDemo';
import ThemeSwitcher from './components/ThemeSwitcher';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import { AuthProvider } from '../../context/AuthContext';
import './components/gridPattern.css';
import './components/darkModeAnimations.css';

const AppLayout = () => {
  const location = useLocation();  
  const hideHeroSection = ['/chat', '/crop', '/disease', '/profile', '/settings', '/history', '/test-enhanced', '/enhanced-dashboard', '/login', '/signup', '/marketplace', '/cart', '/order-history', '/order-success'].includes(location.pathname) || location.pathname.startsWith('/order-success/');  
  // Show footer on all pages
  const hideFooter = [];
  
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />      
      <div className="flex-grow flex flex-col">
      {!hideHeroSection && (
        <section className="bg-gradient-radial from-green-400 via-green-500 to-green-600 text-white py-16" style={{background: 'radial-gradient(ellipse at center, #16a34a 0%, #15803d 70%, #14532d 100%)'}}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">              <span className="text-white">Agri</span><span className="text-green-300">AI</span>
            </h1>
            <p className="text-lg mb-8 text-white max-w-2xl mx-auto">
              Your intelligent farming companion powered by AI. Get crop recommendations, disease 
              detection, and expert agricultural advice.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <a href="/crop" className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors duration-200 flex items-center gap-2 border border-white/30">                <span>🌱</span> Smart Crop Planning
              </a>
              <a href="/disease" className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors duration-200 flex items-center gap-2 border border-white/30">
                <span>🔬</span> Disease Detection
              </a>
              <a href="/chat" className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors duration-200 flex items-center gap-2 border border-white/30">
                <span>🤖</span> AI Assistant
              </a>
            </div>
            <div className="flex gap-4 justify-center">
              <a href="/signup" className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                Sign Up
              </a>
              <a href="/about" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors duration-200">
                Learn More
              </a>
            </div>
          </div>
          </section>
        )}
        </div>
      <div className={`relative flex-grow ${hideHeroSection ? 'min-h-0' : ''} bg-white text-gray-900`}>        <Routes>
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
          <Route path="/theme-demo" element={<ClassicThemeDemo />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
      <ThemeSwitcher />
    </div>
  );
};

export default function ClassicApp() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
