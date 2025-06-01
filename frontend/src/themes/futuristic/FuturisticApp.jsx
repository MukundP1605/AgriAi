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
import ThemeDemo from './components/ThemeDemo';
import ThemeSwitcher from './components/ThemeSwitcher';
import { AuthProvider } from '../../context/AuthContext';
import './styles/dashboard.css';

const AppLayout = () => {
  const location = useLocation();
  const hideFooter = ['/chat'].includes(location.pathname);
  return (
    <div className="theme-futuristic min-h-screen w-full h-full bg-[#0a0a0f] text-white overflow-hidden">
      <Navbar />
      <div className="relative h-screen w-full bg-transparent text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crop" element={<Crop />} />
          <Route path="/disease" element={<DiseaseUpload />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/about" element={<About />} />
          <Route path="/forms" element={<AgriAIFormsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="/test-enhanced" element={<TestEnhancedFeatures />} />
          <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
          <Route path="/theme-demo" element={<ThemeDemo />} />
          <Route path="*" element={<Login />} />
        </Routes>      </div>
      {!hideFooter && <Footer />}
      <ThemeSwitcher />
    </div>
  );
};

export default function FuturisticApp() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

