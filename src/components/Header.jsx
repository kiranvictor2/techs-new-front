import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import BASE_URL from "../config";

export default function Header({ onLogout, onMenuToggle }) {
  const { user, getToken } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      console.log("token", token);
      
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
      } else {
        console.error("Failed to fetch profile:", response.status);
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
        className="subscription-badge"
        style={{
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          background: isPremium
            ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
            : "#6b7280",
          color: "#fff",
          marginLeft: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          whiteSpace: "nowrap",
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
        className="queries-info"
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
    <>
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
              {/* Desktop View */}
              <div className="user-info-desktop">
                {/* User Avatar */}
                {userProfile.picture && (
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
                )}

                {/* User Details */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
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

                {/* Queries Info */}
                {getQueriesInfo()}

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

              {/* Mobile View */}
              <div className="user-info-mobile">
                {userProfile.picture && (
                  <img
                    src={userProfile.picture}
                    alt={userProfile.name}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255, 255, 255, 0.2)",
                      cursor: "pointer",
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="balance">500 TECH</div>
          )}
        </div>
      </div>

      {/* Mobile User Menu Dropdown */}
      {showUserMenu && userProfile && (
        <>
          <div 
            className="mobile-menu-overlay" 
            onClick={() => setShowUserMenu(false)}
            style={{
              position: "fixed",
              top: "100px",
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 999,
            }}
          />
          <div 
            className="mobile-user-menu"
            style={{
              position: "fixed",
              top: "100px",
              right: "10px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              zIndex: 1000,
              minWidth: "280px",
              padding: "20px",
            }}
          >
            {/* User Info */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              paddingBottom: "15px",
              borderBottom: "1px solid #e2e8f0"
            }}>
              {userProfile.picture && (
                <img
                  src={userProfile.picture}
                  alt={userProfile.name}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "2px solid #4f46e5",
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: "15px", 
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: "4px"
                }}>
                  {userProfile.name || userProfile.email}
                </div>
                <div style={{ 
                  fontSize: "13px", 
                  color: "#64748b" 
                }}>
                  {userProfile.email}
                </div>
              </div>
            </div>

            {/* Subscription Badge */}
            <div style={{ 
              marginTop: "15px",
              paddingBottom: "15px",
              borderBottom: "1px solid #e2e8f0"
            }}>
              <div style={{ 
                fontSize: "12px", 
                color: "#64748b",
                marginBottom: "8px"
              }}>
                Subscription
              </div>
              {getSubscriptionBadge()}
            </div>

            {/* Queries Info */}
            <div style={{ 
              marginTop: "15px",
              paddingBottom: "15px",
              borderBottom: "1px solid #e2e8f0"
            }}>
              <div style={{ 
                fontSize: "12px", 
                color: "#64748b",
                marginBottom: "8px"
              }}>
                Remaining Queries
              </div>
              <div style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#4f46e5"
              }}>
                {userProfile.subscription?.query_limit - userProfile.subscription?.queries_used || 0}
                <span style={{ 
                  fontSize: "14px", 
                  fontWeight: "400",
                  color: "#64748b"
                }}>
                  {" "}/ {userProfile.subscription?.query_limit || 4}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                setShowUserMenu(false);
                onLogout();
              }}
              style={{
                marginTop: "15px",
                width: "100%",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                background: "#ef4444",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .user-info-desktop {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-info-mobile {
          display: none;
        }

        @media (max-width: 1024px) {
          .queries-info {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .user-info-desktop {
            display: none;
          }

          .user-info-mobile {
            display: flex;
            align-items: center;
          }

          .subscription-badge {
            margin-left: 0 !important;
            display: inline-block;
          }
        }

        @media (max-width: 480px) {
          .mobile-user-menu {
            right: 5px !important;
            left: 5px !important;
            min-width: auto !important;
            width: calc(100% - 10px) !important;
          }
        }
      `}</style>
    </>
  );
}