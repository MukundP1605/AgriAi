import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

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
  const auth = useAuth();
  const { login, signup } = auth || {};

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
        if (login) {
          const success = await login(formData.email, formData.password);
          if (success) {
            navigate("/");
          } else {
            throw new Error("Login failed. Please check your credentials.");
          }
        }
      } else {
        navigate("/signup", { 
          state: { 
            email: formData.email,
            password: formData.password 
          }
        });
      }
    } catch (err) {
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
    <div>
      <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
      
      {error && <div style={{color: 'red'}}>{error}</div>}
    
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>
        )}
        
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isLogin ? "Enter your password" : "Create a password"}
          />
        </div>
        
        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
          </div>
        )}
        
        <button type="submit" disabled={loading}>
          {loading ? (
            <span>{isLogin ? "Logging in..." : "Signing up..."}</span>
          ) : (
            <span>{isLogin ? "Login" : "Sign Up"}</span>
          )}
        </button>
      </form>
      
      <div>
        <button onClick={toggleMode}>
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </button>
      </div>
      
      <div>
        <p>By continuing, you agree to AgriAI's Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
};

export default Login;
