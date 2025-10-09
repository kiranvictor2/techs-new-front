import React from "react";
import BASE_URL from "../config";
export default function SubscriptionPlans() {
  const handleSubscribe = async (plan) => {
  try {
    const amount = plan === "monthly" ? 9.99 : 99;

    // Get token from localStorage
    const token = localStorage.getItem("authToken"); // make sure this is where you store the JWT

    if (!token) {
      alert("You must be logged in to subscribe.");
      return;
    }

    // Call FastAPI endpoint using fetch with token
    const response = await fetch(`${BASE_URL}/create-payment-intent`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // ✅ Pass the token
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error("Payment initialization failed");
    }

    const data = await response.json();

    // Redirect user to Stripe Checkout using the URL
    window.location.href = data.url;
  } catch (err) {
    console.error("Payment failed:", err);
    alert("Payment initialization failed. Please try again.");
  }
};


  const styles = {
    pricingSection: {
      padding: '80px 20px',
      // backgroundColor: '#F3F3F3',
      minHeight: '100vh'
    },
    sectionTitle: {
      fontSize: '42px',
      fontWeight: '300',
      color: '#232F3E',
      textAlign: 'center',
      marginBottom: '16px'
    },
    sectionSubtitle: {
      fontSize: '18px',
      color: '#545B64',
      textAlign: 'center',
      marginBottom: '48px',
      maxWidth: '600px',
      margin: '0 auto 48px'
    },
    pricingWrapper: {
      maxWidth: '900px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '32px'
    },
    pricingCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      padding: '48px',
      textAlign: 'center',
      border: '2px solid #E5E5E5',
      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    pricingCardPopular: {
      border: '2px solid #4502bb',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    },
    popularBadge: {
      position: 'absolute',
      top: '-14px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#4502bb',
      color: '#FFFFFF',
      padding: '6px 24px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500'
    },
    planTitle: {
      fontSize: '24px',
      fontWeight: '400',
      color: '#232F3E',
      marginBottom: '24px'
    },
    priceWrapper: {
      marginBottom: '32px'
    },
    price: {
      fontSize: '48px',
      fontWeight: '300',
      color: '#232F3E'
    },
    currency: {
      fontSize: '24px',
      color: '#545B64',
      verticalAlign: 'top'
    },
    period: {
      fontSize: '18px',
      color: '#545B64'
    },
    savings: {
      display: 'inline-block',
      backgroundColor: '#22C55E',
      color: '#FFFFFF',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      marginTop: '12px',
      fontWeight: '500'
    },
    featuresList: {
      listStyle: 'none',
      padding: 0,
      margin: '32px 0',
      fontSize: '16px',
      color: '#545B64',
      lineHeight: '2.2',
      textAlign: 'left'
    },
    checkmark: {
      color: '#22C55E',
      marginRight: '12px',
      fontSize: '18px'
    },
    subscribeButton: {
      backgroundColor: '#4502bb',
      color: '#FFFFFF',
      padding: '16px 48px',
      borderRadius: '4px',
      border: 'none',
      fontSize: '18px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      width: '100%'
    }
  };

  return (
    <div style={styles.pricingSection}>
      <h2 style={styles.sectionTitle}>Choose Your Plan</h2>
      <p style={styles.sectionSubtitle}>
        Select the perfect plan for your learning journey. Cancel anytime.
      </p>
      
      <div style={styles.pricingWrapper}>
        {/* Monthly Plan */}
        <div style={styles.pricingCard}>
          <h3 style={styles.planTitle}>Monthly</h3>
          <div style={styles.priceWrapper}>
            <div>
              <span style={styles.currency}>$</span>
              <span style={styles.price}>9.99</span>
              <span style={styles.period}>/month</span>
            </div>
          </div>

          <ul style={styles.featuresList}>
            <li><span style={styles.checkmark}>✓</span> 2,000 AI queries per month</li>
            <li><span style={styles.checkmark}>✓</span> Unlimited community access</li>
            <li><span style={styles.checkmark}>✓</span> Project & job portal access</li>
            <li><span style={styles.checkmark}>✓</span> Earn and redeem TNC tokens</li>
            <li><span style={styles.checkmark}>✓</span> Priority support</li>
          </ul>

          <button 
            style={styles.subscribeButton}
            onClick={() => handleSubscribe("monthly")}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#3502a0';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4502bb';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Subscribe Now
          </button>
        </div>

        {/* Annual Plan */}
        <div style={{...styles.pricingCard, ...styles.pricingCardPopular}}>
          <span style={styles.popularBadge}>BEST VALUE</span>
          <h3 style={styles.planTitle}>Annual</h3>
          <div style={styles.priceWrapper}>
            <div>
              <span style={styles.currency}>$</span>
              <span style={styles.price}>99</span>
              <span style={styles.period}>/year</span>
            </div>
            <span style={styles.savings}>Save $20.88 (17% off)</span>
          </div>

          <ul style={styles.featuresList}>
            <li><span style={styles.checkmark}>✓</span> 2,000 AI queries per month</li>
            <li><span style={styles.checkmark}>✓</span> Unlimited community access</li>
            <li><span style={styles.checkmark}>✓</span> Project & job portal access</li>
            <li><span style={styles.checkmark}>✓</span> Earn and redeem TNC tokens</li>
            <li><span style={styles.checkmark}>✓</span> Priority support</li>
          </ul>

          <button 
            style={styles.subscribeButton}
            onClick={() => handleSubscribe("annual")}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#3502a0';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4502bb';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
}