import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Home = () => {
  const features = [
    {
      icon: '🌾',
      title: 'Smart Crop Planning',
      description: 'Get AI-powered crop recommendations based on your soil conditions, climate, and farming goals.',
      path: '/crop',
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      icon: '🔍',
      title: 'Disease Detection',
      description: 'Upload plant images for instant disease identification and treatment recommendations.',
      path: '/disease',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: '💬',
      title: 'AI Farm Assistant',
      description: 'Chat with our agricultural AI expert for personalized farming advice and tips.',
      path: '/chat',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: '📊',
      title: 'Farm Analytics',
      description: 'Track your farming progress and get insights to optimize your agricultural practices.',
      path: '/forms',
      gradient: 'from-orange-500 to-red-600'
    }
  ];  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

          {/* Welcome Section */}
          <div className="text-center mb-20 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">AgriAI</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              Revolutionize your farming with AI-powered insights. Make smarter decisions, 
              increase yields, and grow sustainably with our comprehensive agricultural platform.
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-emerald-100 dark:bg-emerald-900 rounded-full text-emerald-800 dark:text-emerald-200 font-medium">
              🚀 Now powered by advanced AI models
            </div>
          </div>          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.path}
                className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] border border-white/20 dark:border-gray-700/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-15 transition-opacity duration-500`}></div>

                <div className="relative p-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <span className="text-4xl">{feature.icon}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                    {feature.description}
                  </p>

                  <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    <span>Get Started</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Floating visual effects */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-green-300 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full opacity-10 group-hover:scale-125 transition-transform duration-700"></div>
              </Link>
            ))}
          </div>

          {/* CTA Section */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                Ready to Transform Your Farm?
              </h2>
              <p className="text-xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of farmers who are already using AgriAI to boost their productivity and sustainability.
              </p>              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  to="/login"
                  className="inline-flex items-center px-10 py-5 bg-white dark:bg-gray-100 text-emerald-600 dark:text-emerald-700 rounded-2xl font-bold text-lg hover:bg-emerald-50 dark:hover:bg-emerald-50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  <span>Start Your Journey</span>
                  <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                <Link
                  to="/chat"
                  className="inline-flex items-center px-10 py-5 bg-transparent border-2 border-white dark:border-gray-200 text-white dark:text-gray-200 rounded-2xl font-bold text-lg hover:bg-white dark:hover:bg-gray-200 hover:text-emerald-600 dark:hover:text-emerald-700 transition-all duration-300"
                >
                  <span>Try AI Assistant</span>
                  <span className="ml-3 text-xl">🤖</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Footer wrapper with dark mode support */}
      <div className="bg-gray-950 dark:bg-black text-gray-300">
        <Footer />
      </div>
    </>
  );
};

export default Home;
