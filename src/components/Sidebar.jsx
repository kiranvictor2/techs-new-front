import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const navItems = [
    { path: "/home", label: "Home", icon: "⌂" },
    { path: "/wallet", label: "Wallet", icon: "⊡" },
    { path: "/query", label: "Ask a Query", icon: "?" },
    { path: "/community", label: "Community", icon: "⚉" },
    { path: "/history", label: "History", icon: "☰" },
  ];

  const handleClick = () => {
    if (window.innerWidth <= 768 && onClose) onClose();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>

      <div className={`sidebar ${isOpen ? 'active' : ''}`}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={handleClick}
            >
              <div className="nav-icon">{item.icon}</div>
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
