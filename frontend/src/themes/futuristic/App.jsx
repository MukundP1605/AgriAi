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

// Layout component without hero section
const AppLayout = () => {
  const location = useLocation();
  const hideFooter = ['/chat'].includes(location.pathname); // Only hide footer on chat page
  
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Main Content */}
      <div className="relative h-[calc(100vh-4rem)] bg-white text-gray-900">
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

