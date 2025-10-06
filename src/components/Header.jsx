import React from "react";

export default function Header({ onLogout, onMenuToggle }) {
  return (
    <div className="header">
      {/* Hamburger Menu Button (Mobile) */}
      <button 
        className="menu-toggle" 
        aria-label="Toggle menu"
        onClick={onMenuToggle}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className="logo">
        <img
          src="/techslogo.jpg"
          alt="Techs.Network Logo"
          className="logo-icon"
        />
        <span>TechsNetwork</span>
      </div>

      <div className="wallet-info">
        <div className="balance">500 TECH</div>
        {/* <div className="user-avatar"></div> */}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="logout-btn"
          style={{
            marginLeft: "15px",
            padding: "8px 16px",
            border: "none",
            borderRadius: "8px",
            background: "#ef4444",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => e.target.style.background = "#dc2626"}
          onMouseOut={(e) => e.target.style.background = "#ef4444"}
        >
          Logout
        </button>
      </div>
    </div>
  );
}