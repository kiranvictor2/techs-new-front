import React, { useState } from "react";

export default function Query() {
  const [currentQuery, setCurrentQuery] = useState("Java Database Connectivity Error");

  const askAnotherQuery = () => {
    const question = prompt("Enter your new query:");
    if (question && question.trim() !== "") {
      setCurrentQuery(question);
      alert("Your query has been processed and solutions are ready!");
    } else {
      alert("Please enter a valid question");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Techs.Network Knowledge Hub</h1>
      <div className="query-section">
        <h2 style={{ marginBottom: "20px" }}>Query Response</h2>

        <div className="query-input">
          <h3>User Query</h3>
          <div className="query-text">{currentQuery}</div>
        </div>

        <div className="solutions-list">
          <h3>AI Solutions:</h3>
          {["Step 1 → Step 3", "Step 1 → Step 2", "Step 1 → Step 3", "Step 1 → Step 3"].map((s, i) => (
            <div key={i} className="solution-item">
              <div className="solution-checkmark">✓</div>
              <div><strong>Solution {i+1}:</strong> {s}</div>
            </div>
          ))}
        </div>

        <button className="ask-another-btn" onClick={askAnotherQuery}>Ask Another Query</button>
      </div>
    </div>
  );
}
