import React from 'react';
import Footer from '../components/Footer';

const About = () => {  return (
    <>
      <div className="container mx-auto px-4 py-12 max-w-4xl bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <h1 className="text-4xl font-bold text-emerald-800 dark:text-emerald-400 mb-8">About AgriAI</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            AgriAI is an intelligent farming companion powered by artificial intelligence, designed to revolutionize 
            agriculture through technology. Our mission is to make advanced agricultural insights accessible to 
            farmers of all scales, helping them optimize crop yields, identify plant diseases early, and make 
            data-driven decisions.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We believe that the future of sustainable agriculture lies in the thoughtful application of AI 
            and machine learning technologies to enhance traditional farming knowledge.
          </p>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 mb-4">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:shadow-lg dark:shadow-gray-900/20 transition-colors duration-300">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-medium text-emerald-700 dark:text-emerald-400 mb-2">Smart Crop Planning</h3>
              <p className="text-gray-600 dark:text-gray-300">Get AI-powered recommendations for optimal crop selection based on soil conditions, climate data, and market trends.</p>
            </div>            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:shadow-lg dark:shadow-gray-900/20 transition-colors duration-300">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-medium text-emerald-700 dark:text-emerald-400 mb-2">Disease Detection</h3>
              <p className="text-gray-600 dark:text-gray-300">Identify plant diseases early with our computer vision technology. Simply upload a photo and get instant diagnosis and treatment options.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:shadow-lg dark:shadow-gray-900/20 transition-colors duration-300">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-medium text-emerald-700 dark:text-emerald-400 mb-2">AI Assistant</h3>
              <p className="text-gray-600 dark:text-gray-300">Access personalized agricultural advice through our conversational AI assistant that understands farming concepts.</p>
            </div>
          </div>
        </section>
          <section className="mb-12">
          <h2 className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 mb-4">Our Technology</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            AgriAI leverages cutting-edge machine learning models trained on diverse agricultural datasets. 
            Our systems incorporate:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Deep learning for image recognition of plant diseases</li>
            <li>Predictive analytics for crop yield optimization</li>
            <li>Natural language processing for our conversational assistant</li>
            <li>Climate data integration for localized recommendations</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 mb-4">Get Started Today</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Whether you're managing a small garden or large-scale farm operations, AgriAI scales to meet your needs.
            Start using our tools today to enhance your agricultural practices and improve productivity.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/login" className="px-8 py-4 bg-emerald-600 dark:bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all duration-300">
              Create Account
            </a>
            <a href="/disease" className="px-8 py-4 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-all duration-300">
              Try Disease Detection
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
