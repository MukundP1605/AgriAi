import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

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
  const auth = useAuth();
  const { signup } = auth || {};

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
      
      if (signup) {
        const success = await signup(userData);
        
        if (success) {
          navigate("/");
        } else {
          throw new Error("Signup failed. Please try again.");
        }
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Welcome to AgriAI</h2>
      <p>Revolutionize your farming with AI-powered insights. Make smarter decisions, increase yields, and grow sustainably with our comprehensive agricultural platform.</p>
      
      {error && <div style={{color: 'red'}}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="location">Farm Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State/Country"
            required
          />
        </div>

        <div>
          <label htmlFor="farmType">Farm Type</label>
          <select
            id="farmType"
            name="farmType"
            value={formData.farmType}
            onChange={handleChange}
          >
            <option value="small">Small Scale (1-10 acres)</option>
            <option value="medium">Medium Scale (10-100 acres)</option>
            <option value="large">Large Scale (100+ acres)</option>
            <option value="organic">Organic Farming</option>
            <option value="greenhouse">Greenhouse/Indoor</option>
            <option value="livestock">Livestock</option>
            <option value="mixed">Mixed Farming</option>
          </select>
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div>
        <p>
          Already have an account?{" "}
          <Link to="/login">Sign in here</Link>
        </p>
      </div>

      <div>
        <p>By creating an account, you agree to AgriAI's Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
};

export default SignUp;
