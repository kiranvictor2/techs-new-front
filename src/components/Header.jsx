import React from "react";

export default function Header() {
  return (
    <div className="header">
      <div className="logo">
        <img src="/techslogo.jpg" alt="Techs.Network Logo" className="logo-icon" />
        <span>TechsNetwork</span>
      </div>
      <div className="wallet-info">
        <div className="balance">500 TECH</div>
        <div className="user-avatar"></div>
      </div>
    </div>
  );
}
