import React from "react";

export default function Home({ setActivePage }) {
  return (
    <div className="page">
      <div className="hero-section">
        <h1 className="hero-title">Knowledge Sharing at Your Fingertips</h1>
        <p className="hero-subtitle">
          Post your technical questions and find trusted solutions by industry
          experts in various knowledge-sharing communities.
        </p>
        <button className="cta-button" onClick={() => setActivePage("query")}>
          Ask a Query
        </button>
      </div>
    </div>
  );
}
