import {
  Mail,
  Phone,
  Clock,
  WheatOff,
  Home,
  Brain,
  Bot,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {  return (
    <footer className="w-full mt-auto bg-gray-950 dark:bg-dark-200 text-white relative overflow-hidden border-t-2 border-emerald-500/50 shadow-2xl z-10 transition-colors duration-300 dark:modern-card">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 relative">
        {/* Branding */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-teal-600 rounded-lg flex items-center justify-center shadow-lg dark:shadow-emerald-500/30">
              <WheatOff className="text-white w-5 h-5" />
            </div>
            <span className="text-white text-2xl font-bold dark:drop-shadow-[0_2px_10px_rgba(16,185,129,0.2)]">AgriAI</span>
          </div>
          <p className="text-gray-300 dark:text-gray-200 text-sm leading-relaxed">
            Empowering farmers with cutting-edge AI technology for smarter crop
            planning, precise disease detection, and data-driven agricultural
            insights.
          </p>
        </div>        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-lg border-b border-emerald-600/40 dark:border-emerald-500/60 pb-2">
            Quick Links
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/"
                className="text-gray-300 dark:text-gray-200 hover:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
              >
                <Home className="w-4 h-4" /> Home
              </Link>
            </li>
            <li>
              <Link
                to="/crop"
                className="text-gray-300 dark:text-gray-200 hover:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
              >
                <Brain className="w-4 h-4" /> Crop Planning
              </Link>            </li>
            <li>
              <Link
                to="/disease"
                className="text-gray-300 dark:text-gray-200 hover:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
              >
                <ShieldCheck className="w-4 h-4" /> Disease Detection
              </Link>
            </li>
            <li>
              <Link
                to="/chat"
                className="text-gray-300 dark:text-gray-200 hover:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
              >
                <Bot className="w-4 h-4" /> AI Assistant
              </Link>
            </li>
          </ul>
        </div>        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-lg border-b border-emerald-600/40 dark:border-emerald-500/60 pb-2">
            Contact Us
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-emerald-600/30 dark:bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-600/50 dark:group-hover:bg-emerald-500/30 transition-all duration-300">
                <Mail className="w-4 h-4 text-emerald-400 dark:text-emerald-300" />
              </div>
              <span className="text-gray-300 dark:text-gray-200 group-hover:text-emerald-400 dark:group-hover:text-emerald-300 transition-colors duration-200">support@agriai.com</span>
            </li>
            <li className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-emerald-600/30 dark:bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-600/50 dark:group-hover:bg-emerald-500/30 transition-all duration-300">
                <Phone className="w-4 h-4 text-emerald-400 dark:text-emerald-300" />
              </div>
              <span className="text-gray-300 dark:text-gray-200 group-hover:text-emerald-400 dark:group-hover:text-emerald-300 transition-colors duration-200">+1 (234) 567-890</span>
            </li>
            <li className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-emerald-600/30 dark:bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-600/50 dark:group-hover:bg-emerald-500/30 transition-all duration-300">
                <Clock className="w-4 h-4 text-emerald-400 dark:text-emerald-300" />
              </div>
              <span className="text-gray-300 dark:text-gray-200 group-hover:text-emerald-400 dark:group-hover:text-emerald-300 transition-colors duration-200">24/7 Support</span>
            </li>
          </ul>
        </div>      </div>      <div className="text-center text-sm text-gray-300 dark:text-gray-200 py-6 border-t border-emerald-500/50 dark:border-emerald-600/30 bg-black dark:bg-dark-300 transition-all duration-300 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        <div className="relative">
          © {new Date().getFullYear()} AgriAI. All rights reserved.
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-400">Powered by advanced agricultural AI technology</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
