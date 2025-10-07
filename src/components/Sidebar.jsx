import React from "react";

export default function Sidebar({ activePage, setActivePage, isOpen, onClose }) {
  const navItems = [
  { id: "home", label: "Home", icon: "⌂" },       // house
  { id: "wallet", label: "Wallet", icon: "💰" },  // wallet/money bag
  { id: "query", label: "Ask a Query", icon: "?" }, 
  { id: "community", label: "Community", icon: "👥" }, // two person outlines
  { id: "history", label: "History", icon: "📄" },      // document
];


  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'active' : ''}`}>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => handleNavClick(item.id)}
          >
            <div className="nav-icon">{item.icon}</div>
            {item.label}
          </div>
        ))}
      </div>
    </>
  );
}