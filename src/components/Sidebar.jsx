import React from "react";

export default function Sidebar({ activePage, setActivePage }) {
  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "wallet", label: "Wallet", icon: "💳" },
    { id: "query", label: "Ask a Query", icon: "❓" },
    { id: "community", label: "Community", icon: "👥" },
  ];

  return (
    <div className="sidebar">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${activePage === item.id ? "active" : ""}`}
          onClick={() => setActivePage(item.id)}
        >
          <div className="nav-icon">{item.icon}</div>
          {item.label}
        </div>
      ))}
    </div>
  );
}
