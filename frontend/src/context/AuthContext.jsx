import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext();

// Export AuthContext for direct import
export { AuthContext };

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available to any child component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount, check for saved user in localStorage
  useEffect(() => {
    const checkLoggedIn = () => {
      try {
        // Check if we have a token and user profile
        const token = localStorage.getItem('token');
        const userProfile = localStorage.getItem('user_profile');
        
        if (token && userProfile) {
          const user = JSON.parse(userProfile);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication state:", error);
        // Clear potentially corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user_profile');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);
  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
        if (!response.ok) {
        throw new Error("Login failed");
      }
        const data = await response.json();
      console.log("Login response:", data);
      
      // Store user data and token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_profile', JSON.stringify(data.user));
      
      // Update state
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };
  // Signup function
  const signup = async (userData) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name: userData.fullName,
          location: userData.location || "",
          farm_type: userData.farmType || "small"
        }),
      });
      
      if (!response.ok) {
        throw new Error("Signup failed");
      }
      
      // After successful signup, login the user
      return await login(userData.email, userData.password);
    } catch (error) {
      console.error("Error during signup:", error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user_profile');
      
      // Update state
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      return false;
    }
  };
  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch("http://127.0.0.1:8000/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      const updatedUserData = await response.json();
      
      // Update localStorage
      localStorage.setItem('user_profile', JSON.stringify(updatedUserData));
      
      // Update state
      setCurrentUser(updatedUserData);
      
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // The value provided to consumers of this context
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
