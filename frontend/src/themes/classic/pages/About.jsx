import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
const About = () => {
  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-950 dark:via-blue-950 dark:to-emerald-950 transition-colors duration-300">
        {/* Modern subtle background shape */}
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-blue-100 dark:bg-blue-950 rounded-full opacity-20 blur-3xl z-0" />
        
        <div className="relative z-10 container mx-auto px-6 py-16 max-w-5xl">
          <h1 className="text-5xl font-bold text-blue-800 dark:text-blue-200 mb-10 text-center tracking-tight">
            About <span className="text-indigo-600 dark:text-indigo-300">AgriAI</span>
          </h1>

          <section className="mb-16 bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
            <div>
              <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-3">Empowering Agriculture with Intelligence</h2>
              <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed mb-4">
                AgriAI is your intelligent farming companion, blending the wisdom of agriculture with the power of artificial intelligence. Our mission is to make advanced agri-tech accessible, sustainable, and impactful for every grower.
              </p>
              <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
                Founded in 2023, we've been working closely with farmers, agricultural scientists, and AI experts to develop solutions that address real-world farming challenges. Our team combines decades of agricultural experience with cutting-edge technology to create tools that genuinely improve farming outcomes.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-center text-blue-700 dark:text-blue-300 mb-8">What Makes Us Unique?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/90 dark:bg-slate-900/90 p-8 rounded-3xl shadow-lg group hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-900 dark:hover:to-indigo-950 hover:shadow-blue-200 dark:hover:shadow-indigo-900 transition-all duration-300 flex flex-col items-center backdrop-blur-sm">
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🌱</span>
                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">Smart Crop Planning</h3>
                <p className="text-slate-700 dark:text-slate-300 text-center mb-3">AI-driven crop recommendations tailored to your soil, climate, and market trends.</p>
                <ul className="text-slate-600 dark:text-slate-400 text-sm list-disc pl-5 mt-2 self-start">
                  <li>Soil composition analysis</li>
                  <li>Weather pattern prediction</li>
                  <li>Market demand forecasting</li>
                  <li>Crop rotation suggestions</li>
                </ul>
              </div>
              <div className="bg-white/90 dark:bg-slate-900/90 p-8 rounded-3xl shadow-lg group hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-900 dark:hover:to-indigo-950 hover:shadow-blue-200 dark:hover:shadow-indigo-900 transition-all duration-300 flex flex-col items-center backdrop-blur-sm">
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🌾</span>
                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">Disease Detection</h3>
                <p className="text-slate-700 dark:text-slate-300 text-center mb-3">Instant plant disease diagnosis from photos, with actionable treatment advice.</p>
                <ul className="text-slate-600 dark:text-slate-400 text-sm list-disc pl-5 mt-2 self-start">
                  <li>98% accuracy rate</li>
                  <li>Supports 50+ crop varieties</li>
                  <li>Treatment recommendations</li>
                  <li>Preventative care tips</li>
                </ul>
              </div>
              <div className="bg-white/90 dark:bg-slate-900/90 p-8 rounded-3xl shadow-lg group hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-900 dark:hover:to-indigo-950 hover:shadow-blue-200 dark:hover:shadow-indigo-900 transition-all duration-300 flex flex-col items-center backdrop-blur-sm">
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🤖</span>
                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">Conversational AI</h3>
                <p className="text-slate-700 dark:text-slate-300 text-center mb-3">Personalized, 24/7 agri-advice from our smart assistant, always ready to help.</p>
                <ul className="text-slate-600 dark:text-slate-400 text-sm list-disc pl-5 mt-2 self-start">
                  <li>Natural language processing</li>
                  <li>Contextual understanding</li>
                  <li>Multilingual support</li>
                  <li>Continuous learning system</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-16 bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-center text-blue-700 dark:text-blue-300 mb-6">Our Technology</h2>
            <div className="space-y-4">
              <p className="text-slate-700 dark:text-slate-200 mb-4 text-center">
                AgriAI leverages cutting-edge technology to transform traditional farming:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-2xl">
                  <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">AI & Machine Learning</h3>
                  <ul className="list-disc ml-5 space-y-1 text-slate-700 dark:text-slate-300">
                    <li>Deep learning for plant disease image recognition</li>
                    <li>Predictive analytics for yield optimization</li>
                    <li>Natural language processing for smart chat</li>
                    <li>Computer vision for growth analysis</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-2xl">
                  <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">Data Integration</h3>
                  <ul className="list-disc ml-5 space-y-1 text-slate-700 dark:text-slate-300">
                    <li>Climate data for local insights</li>
                    <li>Soil sensors compatibility</li>
                    <li>Weather station integration</li>
                    <li>Historical yield data analysis</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10 text-center bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4">Ready to Grow with Us?</h2>
            <p className="text-slate-700 dark:text-slate-200 mb-6 text-lg max-w-2xl mx-auto">
              Whether you're a backyard gardener or a commercial farmer, AgriAI is here to help you thrive. Join our community and experience the future of farming today.
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
              <div className="text-left p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl hover:shadow-md transition-shadow duration-300">
                <p className="text-indigo-800 dark:text-indigo-300 font-medium text-lg">Free Plan</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Basic disease detection and crop advice</p>
              </div>
              <div className="text-left p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl hover:shadow-md transition-shadow duration-300">
                <p className="text-indigo-800 dark:text-indigo-300 font-medium text-lg">Premium Plan</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Advanced analytics and unlimited scans</p>
              </div>
            </div>            <div className="flex flex-wrap gap-6 justify-center">
              <Link to="/login" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 transition-colors duration-300">Create Account</Link>
              <Link to="/disease" className="px-8 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 font-bold rounded-full shadow-md border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors duration-300">Try Disease Detection</Link>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
