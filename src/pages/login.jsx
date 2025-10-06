import React from "react";
import "../style.css";

export default function Login({ onLogin }) {
  const handleGoogleLogin = () => {
    // Redirect user to backend Google OAuth endpoint
    window.location.href = "http://localhost:8000/login/google";
  };

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: "20px" }}>Login to TechsNetwork</h2>

      {/* Google Login Button */}
      <button onClick={handleGoogleLogin} style={styles.googleBtn}>
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          style={{ width: "20px", marginRight: "10px" }}
        />
        Sign in with Google
      </button>

      {/* Optional: fallback email login */}
      <p style={{ marginTop: "20px", fontSize: "14px", color: "#555" }}>
        Or login with email
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.email.value.trim();
          if (email) {
            localStorage.setItem("userEmail", email);
            onLogin(email);
          }
        }}
        style={styles.form}
      >
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
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
    background: "#f0f0f0",
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
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#007bff",
    color: "white",
    cursor: "pointer",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
};
