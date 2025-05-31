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
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';

// Layout component to conditionally render hero section and footer
const AppLayout = () => {
  const location = useLocation();
  const { darkMode } = useTheme();
  const hideHeroSection = ['/chat', '/crop', '/disease', '/profile', '/settings', '/history', '/test-enhanced', '/enhanced-dashboard', '/login', '/signup'].includes(location.pathname);
  const hideFooter = ['/chat'].includes(location.pathname); // Only hide footer on chat page
  
  return (
    <div className="min-h-screen bg-white dark:bg-dark-300 text-gray-900 dark:text-gray-100 theme-transition dark:apple-dark-gradient">
      <Navbar />
      
      {/* Hero Section - only show on routes that aren't chat, crop, or disease */}
      {!hideHeroSection && (
        <section className="hero-section relative overflow-hidden aurora-bg theme-transition">
          {/* Aurora overlay for dark mode */}
          <div className="aurora-overlay" style={{ backgroundImage: "radial-gradient(circle at 50% 0, rgba(236,72,153,0.18) 0%, transparent 80%)" }}></div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight dark:drop-shadow-[0_5px_15px_rgba(16,185,129,0.2)]">
                Agri<span className="text-emerald-200 drop-shadow-lg dark:text-neon-pink">AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-emerald-50 max-w-4xl mx-auto leading-relaxed mb-12 font-light dark:drop-shadow-md">
                Your intelligent farming companion powered by AI. Get crop recommendations, 
                disease detection, and expert agricultural advice.
              </p>
              {/* Modern Feature Pills */}
              <div className="flex flex-wrap gap-4 justify-center mb-12">
                <a href="/crop" className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-dark-accent/30 dark:border-dark-accent dark:hover:bg-dark-accent/50 dark:glass dark:neon-glow dark:rise-on-hover">
                  <span className="text-2xl mr-3">🌱</span>
                  <span className="font-medium">Smart Crop Planning</span>
                </a>
                <a href="/disease" className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-dark-accent/30 dark:border-dark-accent dark:hover:bg-dark-accent/50 dark:glass dark:neon-glow dark:rise-on-hover">
                  <span className="text-2xl mr-3">🔬</span>
                  <span className="font-medium">Disease Detection</span>
                </a>
                <a href="/chat" className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-dark-accent/30 dark:border-dark-accent dark:hover:bg-dark-accent/50 dark:glass dark:neon-glow dark:rise-on-hover">
                  <span className="text-2xl mr-3">💬</span>
                  <span className="font-medium">AI Assistant</span>
                </a>
              </div>
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex gap-2">
                  <a href="/login" className="button neon-btn">Login</a>
                  <a href="/signup" className="button neon-btn">Sign Up</a>
                </div>
                <a href="/about" className="button neon-btn">Learn More</a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className={`relative ${hideHeroSection ? 'h-[calc(100vh-4rem)]' : ''} bg-white dark:bg-dark-300 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
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

      {/* Global Footer - Hidden only on Chat page */}
      {!hideFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppLayout />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

