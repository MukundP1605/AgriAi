import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgriAIFormsPage from './components/CropForm';
import Navbar from './components/Navbar';
import DiseaseUpload from './pages/Disease';
import Chat from './pages/Chat'; 
import Home from './pages/Home';
import Crop from './pages/Crop';
import './App.css';
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/crop" element={<Crop />} />
            <Route path="/disease" element={<DiseaseUpload />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/forms" element={<AgriAIFormsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

