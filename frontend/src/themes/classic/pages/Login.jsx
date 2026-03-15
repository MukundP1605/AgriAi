import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: ""
  });
  
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }
    
    if (!isLogin) {
      if (!formData.fullName) {
        setError("Full name is required");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Use the login function from AuthContext
        const success = await login(formData.email, formData.password);
        
        if (success) {
          navigate("/");
        } else {
          throw new Error("Login failed. Please check your credentials.");
        }
      } else {
        // For the simplified login/signup toggle, redirect to the dedicated signup page
        navigate("/signup", { 
          state: { 
            email: formData.email,
            password: formData.password 
          }
        });
      }    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 bg-white/95 backdrop-blur-sm border rounded-xl shadow-lg border-gray-200/50">
        <h2 className="text-3xl font-bold mb-6 text-center text-emerald-700">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="fullName">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your full name"
            />
          </div>
        )}
        
        <div>
          <label className="block text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={isLogin ? "Enter your password" : "Create a password"}
          />
        </div>
        
        {!isLogin && (
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Confirm your password"
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition duration-300 flex justify-center items-center"
        >
          {loading ? (
            <span className="inline-block animate-pulse">
              {isLogin ? "Logging in..." : "Signing up..."}
            </span>
          ) : (
            <span>{isLogin ? "Login" : "Sign Up"}</span>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <button
          onClick={toggleMode}
          className="text-emerald-600 hover:text-emerald-800 font-medium"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </button>
      </div>        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            By continuing, you agree to AgriAI's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
