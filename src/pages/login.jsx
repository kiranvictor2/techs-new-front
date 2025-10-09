import React from "react";
import "../style.css";
import BASE_URL from "../config";
export default function Login({ onLogin }) {
 const handleGoogleLogin = () => {
  window.location.href = `${BASE_URL}/login/google`;
};

  const handleEmailLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    if (email) {
      localStorage.setItem("userEmail", email);
      onLogin(email);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login to TechsNetwork</h2>

      {/* Google Login Button */}
      <button onClick={handleGoogleLogin} style={{ ...btnStyles.base, ...btnStyles.google }}>
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          style={{ width: "20px" }}
        />
        Sign in with Google
      </button>

      <p style={{ marginTop: "20px", fontSize: "14px", color: "#555" }}>Or login with email</p>

      <form onSubmit={handleEmailLogin} style={styles.form}>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          style={styles.input}
        />
        <button type="submit" style={{ ...btnStyles.base, ...btnStyles.primary }}>
          Login
        </button>
      </form>
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
  },
  title: {
    marginBottom: "20px",
    color: "#232f3e",
    fontFamily: "'Inter', sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "250px",
    marginTop: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontFamily: "'Inter', sans-serif",
  },
};

/* =============================
   AWS-STYLE BUTTON DEFINITIONS
   ============================= */
const btnStyles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    borderRadius: "6px",
    padding: "10px 18px",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    width: "250px",
  },
  primary: {
    backgroundColor: "#ff9900",
    color: "#fff",
    boxShadow: "0 2px 6px rgba(255,153,0,0.25)",
  },
  google: {
    backgroundColor: "#fff",
    color: "#232f3e",
    border: "1px solid #ccc",
  },
};
