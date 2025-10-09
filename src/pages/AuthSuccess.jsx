import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const authenticateUser = async () => {
      // Extract token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      console.log("🔐 AuthSuccess - Token from URL:", token ? "Present" : "Missing");

      if (!token) {
        console.error("❌ No token found in URL");
        navigate("/", { replace: true });
        return;
      }

      try {
        // Decode token payload (if JWT)
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid JWT format");
        }

        const payload = JSON.parse(atob(parts[1]));
        console.log("✅ Decoded payload:", payload);

        // Check if token is expired
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          throw new Error("Token expired");
        }

        const userData = { 
          name: payload.name, 
          email: payload.email 
        };

        // Save token & user data using AuthContext (stores in sessionStorage)
        login(token, userData);

        console.log("✅ Login successful, user data saved");
        console.log("🔄 Redirecting to home...");
        
        // Small delay to ensure state updates
        setTimeout(() => {
          navigate("/home", { replace: true });
        }, 100);
      } catch (error) {
        console.error("❌ Error during authentication:", error);
        alert(`Authentication failed: ${error.message}`);
        navigate("/", { replace: true });
      }
    };

    authenticateUser();
  }, [login, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>Authenticating, please wait...</p>
      <p style={styles.subtext}>Logging you in securely</p>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9fafb",
    gap: "15px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #ff9900",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  text: {
    color: "#232f3e",
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
  },
  subtext: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);