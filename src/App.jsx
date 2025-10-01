import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Query from "./pages/Query";
import Community from "./pages/Community";
import "./style.css";

export default function App() {
  const [activePage, setActivePage] = useState("home");

  return (
    <div className="app-container">
      <Header />
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
