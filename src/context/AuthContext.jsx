// ============= AuthContext.jsx =============
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = sessionStorage.getItem("authToken");
    if (token) {
      // Verify token with backend
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Invalid token, clear it
        sessionStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      sessionStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    sessionStorage.setItem("authToken", token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("authToken");
    setUser(null);
  };

  const getToken = () => {
    return sessionStorage.getItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);