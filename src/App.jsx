import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Query from "./pages/Query";
import Community from "./pages/Community";
import Login from "./pages/login"; // 👈 added
import "./style.css";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [user, setUser] = useState(localStorage.getItem("userEmail") || null);

  const handleLogin = (email) => {
    setUser(email);
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} />
      <div className="container">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <div className="main-content">
          {activePage === "home" && <Home setActivePage={setActivePage} />}
          {activePage === "wallet" && <Wallet />}
          {activePage === "query" && <Query />}
          {activePage === "community" && <Community />}
        </div>
      </div>
    </div>
  );
}
