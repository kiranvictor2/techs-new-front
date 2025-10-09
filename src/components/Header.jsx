import React, { useState, useEffect } from "react";
import BASE_URL from "../config";
export default function Header({ onLogout, onMenuToggle }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
  `${BASE_URL}/user/profile/token?token=${token}`
);

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionBadge = () => {
    if (!userProfile) return null;

    const status = userProfile.subscription?.status;
    const isPremium = status === "active";

    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          background: isPremium
            ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
            : "#6b7280",
          color: "#fff",
          marginLeft: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {isPremium ? "✨ Premium" : "Free"}
      </span>
    );
  };

  const getQueriesInfo = () => {
    if (!userProfile) return null;

    const { queries_used = 0, query_limit = 4 } = userProfile.subscription || {};
    const remaining = query_limit - queries_used;

    return (
      <div
        style={{
          marginLeft: "15px",
          padding: "6px 12px",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.1)",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <span style={{ opacity: 0.8 }}>Queries:</span>
        <span style={{ fontWeight: "600" }}>
          {remaining}/{query_limit}
        </span>
      </div>
    );
  };

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
          src="/logo.png"
          alt="Techs.Network Logo"
          className="logo-icon"
        />
      </div>

      <div className="wallet-info">
        {loading ? (
          <div style={{ fontSize: "14px", opacity: 0.7 }}>Loading...</div>
        ) : userProfile ? (
          <>
            {/* User Info Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginRight: "15px",
              }}
            >
              {/* User Avatar */}
              {/* {userProfile.picture && (
                <img
                  src={userProfile.picture}
                  alt={userProfile.name}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                  }}
                />
              )} */}

              {/* User Details */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    {userProfile.name || userProfile.email}
                  </span>
                  {getSubscriptionBadge()}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginTop: "2px",
                  }}
                >
                  {userProfile.email}
                </span>
              </div>
            </div>

            {/* Queries Info */}
            {getQueriesInfo()}
          </>
        ) : (
          <div className="balance">500 TECH</div>
        )}

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
          onMouseOver={(e) => (e.target.style.background = "#dc2626")}
          onMouseOut={(e) => (e.target.style.background = "#ef4444")}
        >
          Logout
        </button>
      </div>
    </div>
  );
}