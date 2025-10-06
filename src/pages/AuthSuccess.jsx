import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
        localStorage.setItem("token", token);   
      // Optionally decode token payload (if JWT)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userData = { name: payload.name, email: payload.email };

      // Save token & user data in AuthContext
      login(token, userData);

      // Redirect to dashboard or home
      navigate("/", { replace: true });
    } else {
      navigate("/login");
    }
  }, [login, navigate]);

  return (
    <div style={styles.container}>
      <p style={styles.text}>Authenticating, please wait...</p>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9fafb",
  },
  text: {
    color: "#232f3e",
    fontSize: "16px",
    fontWeight: "600",
  },
};
