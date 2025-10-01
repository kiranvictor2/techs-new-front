import React from "react";

export default function Community() {
  const communities = ["Java", "SAP ABAP", "Oracle FCCS", "Python"];

  const selectCommunity = (name) => {
    alert(`Selected ${name} community. This would redirect to the ${name} discussion board.`);
  };

  return (
    
    <div className="page">

      <h1 className="page-title">Community</h1>
      <div className="community-grid">
        {communities.map((c) => (
          <div
            key={c}
            className="community-card"
            onClick={() => selectCommunity(c)}
          >
            <h3>{c}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
