import { createContext, useContext, useState, useEffect } from "react";
import BASE_URL from "../config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user data on mount
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("userData");
    
    console.log("🔍 AuthContext - Checking storage:", { 
      hasToken: !!token, 
      hasUser: !!savedUser 
    });

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Check if token is a valid JWT and not expired
        if (isTokenValid(token)) {
          setUser(userData);
          console.log("✅ User restored from localStorage:", userData);
          
          // Optionally verify with backend (non-blocking)
          verifyToken(token);
        } else {
          console.warn("⚠️ Token expired or invalid, clearing storage");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      } catch (error) {
        console.error("❌ Error parsing saved user data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  const isTokenValid = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiration (if exp claim exists)
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        console.log("⏰ Token expired");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("❌ Error validating token:", error);
      return false;
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        // Invalid token, clear storage
        console.warn("⚠️ Token verification failed with backend, clearing storage");
        logout();
      } else {
        const data = await response.json();
        console.log("✅ Token verified with backend:", data);
      }
    } catch (error) {
      console.error("❌ Error verifying token:", error);
      // Don't logout on network errors, token might still be valid
    }
  };

  const login = (token, userData) => {
    console.log("💾 Saving to localStorage:", { token: !!token, userData });
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    console.log("🚪 Logging out, clearing storage");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("token"); // Clean up old keys
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  const getToken = () => {
    return localStorage.getItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);