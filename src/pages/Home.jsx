import React from "react";
import { loadStripe } from "@stripe/stripe-js";
// import SubscriptionPlans from "./SubscriptionPlans"; // Import the component
import SubscriptionPlans from "../components/SubscriptionPlans";

const stripePromise = loadStripe("pk_test_51RwGpZAWZhNIuwlWlQXKehuLFCO8FXl4pcpBunnNOyw7yYZv0STWLja8VGl8zQW6W9HrISHACJDCd9goygmEwzZ700Cg8c985d");

export default function Home({ setActivePage }) {
  const styles = {
    page: {
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      fontFamily: '"Amazon Ember", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    heroSection: {
      background: '#FFFFFF',
      padding: '140px 20px 100px',
      textAlign: 'center',
      borderBottom: '1px solid #E5E5E5'
    },
    heroTitle: {
      fontSize: '64px',
      fontWeight: '700',
      color: '#1A1A1A',
      marginBottom: '24px',
      lineHeight: '1.1',
      maxWidth: '900px',
      margin: '0 auto 24px',
      letterSpacing: '-1px'
    },
    heroHighlight: {
      background: 'linear-gradient(135deg, #bfbd42ff 0%, #bcb77eff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: '700'
    },
    heroSubtitle: {
      fontSize: '22px',
      color: '#666666',
      marginBottom: '48px',
      maxWidth: '600px',
      margin: '0 auto 48px',
      fontWeight: '400',
      lineHeight: '1.6'
    },
    getStartedButton: {
      background: '#4502bb',
      color: '#FFFFFF',
      padding: '18px 48px',
      borderRadius: '50px',
      border: 'none',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 30px rgba(255, 153, 0, 0.3)',
      transform: 'translateY(0)'
    },
    statsBar: {
      backgroundColor: '#FFFFFF',
      padding: '40px 20px',
      borderBottom: '1px solid #E5E5E5'
    },
    statsContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '48px'
    },
    statItem: {
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '42px',
      fontWeight: '300',
      color: '#4502bb',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#545B64',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontWeight: '400'
    },
    featuresSection: {
      padding: '80px 20px',
      backgroundColor: '#FFFFFF',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '48px',
      marginBottom: '80px'
    },
    feature: {
      textAlign: 'center'
    },
    featureIcon: {
      fontSize: '48px',
      marginBottom: '20px'
    },
    featureTitle: {
      fontSize: '24px',
      fontWeight: '400',
      color: '#232F3E',
      marginBottom: '12px'
    },
    featureDesc: {
      fontSize: '16px',
      color: '#545B64',
      lineHeight: '1.6'
    }
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>
          <span style={styles.heroHighlight}>Maxes Manual</span> – Where Knowledge Meets Innovation
        </h1>
        <p style={styles.heroSubtitle}>
          Empowering IT professionals to learn, share, and grow together.
        </p>
        <button 
          style={styles.getStartedButton}
          onClick={() => setActivePage("query")}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 15px 40px rgba(255, 153, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 30px rgba(255, 153, 0, 0.3)';
          }}
        >
          Get Started Free
        </button>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statsContainer}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>8M+</div>
            <div style={styles.statLabel}>Technologies</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>500K+</div>
            <div style={styles.statLabel}>Active Members</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>2M+</div>
            <div style={styles.statLabel}>Questions Answered</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>50K+</div>
            <div style={styles.statLabel}>TNC Earned Daily</div>
          </div>
        </div>
      </div>

      {/* Simple Features */}
      <div style={styles.featuresSection}>
        <div style={styles.featuresGrid}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🚀</div>
            <h3 style={styles.featureTitle}>8 Million+ Technologies</h3>
            <p style={styles.featureDesc}>Access resources across every framework and technology</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🤖</div>
            <h3 style={styles.featureTitle}>AI-Powered Assistant</h3>
            <p style={styles.featureDesc}>Get instant answers with integrated ChatGPT support</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>💎</div>
            <h3 style={styles.featureTitle}>Blockchain Rewards</h3>
            <p style={styles.featureDesc}>Earn TNC tokens for contributions and knowledge sharing</p>
          </div>
        </div>
      </div>

      {/* Subscription Plans Component - Replaces the old pricing section */}
      <SubscriptionPlans />
    </div>
  );
}