import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
    farmType: "small", // Default farm type
    location: ""
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();

  // If we have state from the login page, use it to pre-fill the form
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email,
        password: location.state.password || ""
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.location) {
      setError("All fields are required");
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
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Call the signup function from AuthContext
      const userData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        farmType: formData.farmType,
        location: formData.location
      };
      
      const success = await signup(userData);
      
      if (success) {
        navigate("/");
      } else {
        throw new Error("Signup failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center px-4">      <div className="max-w-2xl w-full p-8 bg-white border rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Welcome to <span className="text-emerald-600">AgriAI</span>
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Revolutionize your farming with AI-powered insights. Make smarter decisions, increase yields, and grow sustainably with our comprehensive agricultural platform.
        </p>
        
        {/* AI-powered badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200">
            ✓ Now powered by advanced AI models
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
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
              placeholder="Create a password (min. 8 characters)"
            />
          </div>
          
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
          
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="location">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="City, State, Country"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="farmType">
              Farm Type
            </label>
            <select
              id="farmType"
              name="farmType"
              value={formData.farmType}
              onChange={handleChange}              
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="small">Small Farm (&lt; 10 acres)</option>
              <option value="medium">Medium Farm (10-100 acres)</option>
              <option value="large">Large Farm (&gt; 100 acres)</option>
              <option value="garden">Home Garden</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the <a href="#" className="text-emerald-600 hover:text-emerald-800">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:text-emerald-800">Privacy Policy</a>
          </label>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition duration-300 flex justify-center items-center text-lg"
        >
          {loading ? (
            <span className="inline-block animate-pulse">Creating Account...</span>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>        <div className="mt-6 text-center">
        <p className="text-gray-700">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-800 font-medium">
            Login here
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default SignUp;
