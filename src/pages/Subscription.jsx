import React, { useEffect, useState } from "react";
import axios from "axios";
import SubscriptionPlans from "../components/SubscriptionPlans";
export default function Subscription({ setActivePage }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const { data } = await axios.get(`http://localhost:8000/subscription?email=${email}`);
        setSubscription(data);
      } catch (err) {
        console.error("Error fetching subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      {/* <h1 style={{ textAlign: "center", marginBottom: "40px" }}>Your Subscription</h1>

      {subscription ? (
        <div className="subscription-card" style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
        }}>
          <p><strong>Email:</strong> {subscription.email}</p>
          <p><strong>Plan:</strong> {subscription.plan}</p>
          <p><strong>Status:</strong> {subscription.status}</p>
          <p><strong>Next Billing:</strong> {subscription.next_billing_date}</p>

          <button
            onClick={() => setActivePage("home")}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              backgroundColor: "#4502bb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Go to Home
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p>You don’t have an active subscription.</p>
          <button
            onClick={() => setActivePage("home")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#FF9900",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Choose a Plan
          </button>
        </div>
      )} */}
            {/* Subscription Plans Component - Replaces the old pricing section */}
            <SubscriptionPlans />
    </div>
  );
}
