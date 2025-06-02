import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const features = [
    { 
      icon: '🌱',
      title: 'Smart Crop Planning', 
      description: 'AI-powered crop recommendations based on soil conditions, climate, and market trends.' 
    },
    { 
      icon: '🔍',
      title: 'Disease Detection', 
      description: 'Advanced image analysis for instant plant disease identification and treatment advice.' 
    },
    { 
      icon: '🤖',
      title: 'AI Assistant', 
      description: '24/7 agricultural support and guidance from our intelligent farming companion.' 
    },
    { 
      icon: '🧪',
      title: 'Fertilizer Advisor', 
      description: 'Smart fertilizer recommendations based on soil analysis and crop requirements.' 
    },
    { 
      icon: '🛒',
      title: 'Marketplace', 
      description: 'Shop for premium agricultural products with AI-powered recommendations and reviews.' 
    }
  ];

  const team = [
    { name: 'Dr. Sarah Smith', role: 'Agricultural Expert & Founder', background: 'PhD in Agricultural Science, 15+ years experience' },
    { name: 'Alex Chen', role: 'AI Research Director', background: 'Machine Learning specialist, former Google researcher' },
    { name: 'Mike Johnson', role: 'Software Engineering Lead', background: 'Full-stack developer, agricultural technology expert' },
    { name: 'Dr. Maria Rodriguez', role: 'Soil Science Advisor', background: 'Soil chemistry specialist, sustainable farming advocate' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 text-white">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            About AgriAI
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing agriculture through artificial intelligence and smart farming solutions for a sustainable future.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20 bg-gradient-to-r from-slate-800/50 to-blue-800/50 rounded-3xl p-8 backdrop-blur-sm border border-blue-500/20">
          <h2 className="text-3xl font-bold text-center mb-8 text-emerald-400">Our Mission</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                AgriAI is your intelligent farming companion, blending the wisdom of agriculture with the power of artificial intelligence. 
                Our mission is to make advanced agri-tech accessible, sustainable, and impactful for every grower.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Founded in 2023, we've been working closely with farmers, agricultural scientists, and AI experts to develop 
                solutions that address real-world farming challenges while promoting environmental sustainability.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mb-4">
                <span className="text-6xl">🌍</span>
              </div>
              <p className="text-emerald-400 font-semibold">Farming for the Future</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-emerald-400">What Makes Us Unique?</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {features.slice(0, 3).map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 p-8 rounded-3xl border border-blue-500/30 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105 backdrop-blur-sm">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mb-6">
                    <span className="text-4xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.slice(3, 5).map((feature, index) => (
              <div key={index + 3} className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 p-8 rounded-3xl border border-blue-500/30 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105 backdrop-blur-sm">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mb-6">
                    <span className="text-4xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-20 bg-gradient-to-r from-slate-800/50 to-emerald-800/50 rounded-3xl p-8 backdrop-blur-sm border border-emerald-500/20">
          <h2 className="text-3xl font-bold text-center mb-8 text-emerald-400">Our Technology</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-500/20">
              <h3 className="text-xl font-bold text-blue-400 mb-4">🧠 AI & Machine Learning</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Deep learning for plant disease recognition</li>
                <li>• Predictive analytics for yield optimization</li>
                <li>• Natural language processing for smart chat</li>
                <li>• Computer vision for growth analysis</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/20">
              <h3 className="text-xl font-bold text-emerald-400 mb-4">📊 Data Integration</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Real-time climate data integration</li>
                <li>• IoT sensor compatibility</li>
                <li>• Satellite imagery analysis</li>
                <li>• Historical data pattern recognition</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-emerald-400">Our Expert Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 p-6 rounded-2xl border border-blue-500/30 text-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <h4 className="text-lg font-bold text-emerald-400 mb-2">{member.name}</h4>
                <p className="text-blue-300 font-medium mb-2">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.background}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-3xl p-12 border border-emerald-500/30 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Ready to Transform Your Farm?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who are already using AgriAI to boost their productivity and sustainability.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/login" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 hover:scale-105"
            >
              Get Started Today
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              to="/chat" 
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-emerald-500 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500 hover:text-white transition-all duration-300"
            >
              Try AI Assistant
              <span className="ml-2">🤖</span>
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-gray-600">
            <h3 className="text-xl font-bold text-emerald-400 mb-4">Contact Us</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-gray-300">
              <p>📧 contact@agriai.com</p>
              <p>📱 +1 (555) 123-4567</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
