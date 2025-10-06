import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Query from "./pages/Query";
import Community from "./pages/Community";
import History from "./pages/History";
import Login from "./pages/login";
import "./style.css";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [user, setUser] = useState(localStorage.getItem("userEmail") || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Handle token from URL (for Google OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const email = payload.email;

        if (email) {
          localStorage.setItem("userEmail", email);
          localStorage.setItem("token", token);
          setUser(email);

          // Clean the URL (remove ?token=...)
          window.history.replaceState({}, document.title, "/");
        }
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const handleLogin = (email) => {
    setUser(email);
    localStorage.setItem("userEmail", email);
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
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

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isSidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  // Swipe gesture to close sidebar
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;

      if (isSidebarOpen && touchStartX - touchEndX > swipeThreshold) {
        closeSidebar();
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isSidebarOpen]);

  // ✅ If not logged in, show login page
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} onMenuToggle={toggleSidebar} />
      <div className="container">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />
        <div className="main-content">
          {activePage === "home" && <Home setActivePage={setActivePage} />}
          {activePage === "wallet" && <Wallet />}
          {activePage === "query" && <Query />}
          {activePage === "community" && <Community setActivePage={setActivePage} />}
          {activePage === "history" && <History />}
        </div>
      </div>
    </div>
  );
}
