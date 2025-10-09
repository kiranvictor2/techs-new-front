import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Query from "./pages/Query";
import Community from "./pages/Community";
import History from "./pages/History";
import Subscription from "./pages/Subscription";
import Login from "./pages/login";
import AuthSuccess from "./pages/AuthSuccess";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f9fafb"
      }}>
        <p style={{ color: "#232f3e", fontSize: "16px", fontWeight: "600" }}>
          Loading...
        </p>
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
}

// Login Route Component (redirects to home if already logged in)
function LoginRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f9fafb"
      }}>
        <p style={{ color: "#232f3e", fontSize: "16px", fontWeight: "600" }}>
          Loading...
        </p>
      </div>
    );
  }

  return user ? <Navigate to="/home" replace /> : children;
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Toggle sidebar for mobile
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Close sidebar
  const closeSidebar = () => setIsSidebarOpen(false);

  // Logout handler
  const handleLogout = () => {
    console.log("Logging out user...");
    
    // Use the logout function from AuthContext (clears localStorage)
    logout();
    
    // Redirect to login page
    navigate("/", { replace: true });
  };

  // Close sidebar on window resize if viewport becomes larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth <= 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // Escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isSidebarOpen) closeSidebar();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  return (
    <div className="app-container">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/" 
          element={
            <LoginRoute>
              <Login />
            </LoginRoute>
          } 
        />
        <Route path="/auth-success" element={<AuthSuccess />} />

        {/* Protected routes with layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <Header onMenuToggle={toggleSidebar} onLogout={handleLogout} />
                <div className="container">
                  <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
                  <div className="main-content">
                    <Routes>
                      <Route path="/home" element={<Home />} />
                      <Route path="/wallet" element={<Wallet />} />
                      <Route path="/query" element={<Query />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/subscription" element={<Subscription />} />
                      <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                  </div>
                </div>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}