import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Home = () => {
  const features = [
    {
      
      title: 'Smart Crop Planning',
      description: 'Get AI-powered crop recommendations based on your soil conditions, climate, and farming goals.',
      path: '/crop',
      
    },
    {
      
      title: 'Disease Detection',
      description: 'Upload plant images for instant disease identification and treatment recommendations.',
      path: '/disease',
      
    },
    {
         title: 'AI Farm Assistant',
      description: 'Chat with our agricultural AI expert for personalized farming advice and tips.',
      path: '/chat',
      
    },
    {
      
      title: 'Farm Analytics',
      description: 'Track your farming progress and get insights to optimize your agricultural practices.',
      path: '/forms',
      
    }
  ]; 

  return (
    <div>
      <h1>Welcome to AgriAI</h1>
      <div className="features">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <Link to={feature.path}>Learn More</Link>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
