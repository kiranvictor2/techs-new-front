import React from "react";

export default function Header({ onLogout }) {
  return (
    <div className="header">
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
        <div className="user-avatar"></div>

        {/* 👇 Add Logout Button */}
        <button
          onClick={onLogout}
          style={{
            marginLeft: "15px",
            padding: "8px 12px",
            border: "none",
            borderRadius: "8px",
            background: "#ff4d4f",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
