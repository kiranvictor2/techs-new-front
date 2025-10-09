import React, { useState, useEffect } from "react";
import "../style.css"; // Adjust path to your main CSS file

export default function History() {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [parsedWorkarounds, setParsedWorkarounds] = useState([]);

  const BACKEND_API_URL = "http://localhost:8000";

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
  try {
    setIsLoading(true);

    const token = localStorage.getItem("token"); // ✅ get token
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(`${BACKEND_API_URL}/history`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ attach token
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch history");
    }

    const data = await response.json();
    setQueries(data.queries);
  } catch (err) {
    setError(err.message);
    console.error("Error fetching history:", err);
  } finally {
    setIsLoading(false);
  }
};


  const parseWorkarounds = (aiResponse) => {
    if (!aiResponse) return [];
    
    console.log("Parsing AI Response:", aiResponse);
    
    // Split by "Workaround X:" or "---"
    const workaroundSections = aiResponse.split(/(?=Workaround \d+:)/);
    const workarounds = [];

    for (const section of workaroundSections) {
      const trimmed = section.trim();
      if (!trimmed || !trimmed.startsWith('Workaround')) continue;

      const workaround = {
        problemStatement: "",
        rootCause: "",
        steps: [],
        references: []
      };

      // Extract Problem Statement
      const problemMatch = trimmed.match(/Problem Statement:\s*([\s\S]*?)(?=Root Cause:|$)/i);
      if (problemMatch) {
        workaround.problemStatement = problemMatch[1].trim();
      }

      // Extract Root Cause
      const rootCauseMatch = trimmed.match(/Root Cause:\s*([\s\S]*?)(?=Solution:|$)/i);
      if (rootCauseMatch) {
        workaround.rootCause = rootCauseMatch[1].trim();
      }

      // Extract Solution Steps
      const solutionMatch = trimmed.match(/Solution:\s*([\s\S]*?)(?=References:|$)/i);
      if (solutionMatch) {
        const solutionText = solutionMatch[1];
        const stepMatches = solutionText.match(/Step \d+:.*?(?=Step \d+:|$)/gs);
        
        if (stepMatches) {
          workaround.steps = stepMatches.map(step => step.trim());
        }
      }

      // Extract References
      const referencesMatch = trimmed.match(/References:\s*([\s\S]*?)(?=---|$)/i);
      if (referencesMatch) {
        const refText = referencesMatch[1].trim();
        const refLines = refText.split('\n').filter(line => line.trim());
        workaround.references = refLines.map(ref => ref.trim());
      }

      // Only add if we have at least problem statement or steps
      if (workaround.problemStatement || workaround.steps.length > 0) {
        workarounds.push(workaround);
      }
    }

    console.log("Parsed Workarounds:", workarounds);

    // Fallback: Try old format if new format parsing failed
    if (workarounds.length === 0 && aiResponse.includes("Solution")) {
      return parseLegacyFormat(aiResponse);
    }

    return workarounds;
  };

  // Fallback parser for old "Solution" format
  const parseLegacyFormat = (aiResponse) => {
    const lines = aiResponse.split("\n");
    const solutions = [];
    let current = null;
    let currentStepText = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const solutionMatch = trimmed.match(/^Solution\s+(\d+):\s*(.+)/i);
      
      if (solutionMatch) {
        if (current && currentStepText) {
          current.steps.push(currentStepText.trim());
          currentStepText = "";
        }
        if (current) {
          solutions.push(current);
        }
        current = { 
          problemStatement: solutionMatch[2].trim(),
          rootCause: "",
          steps: [],
          references: []
        };
      } else if (current) {
        const stepMatch = trimmed.match(/^Step\s+(\d+):\s*(.+)/i);
        
        if (stepMatch) {
          if (currentStepText) {
            current.steps.push(currentStepText.trim());
          }
          currentStepText = `Step ${stepMatch[1]}: ${stepMatch[2].trim()}`;
        } else if (trimmed.length > 0) {
          if (currentStepText) {
            currentStepText += " " + trimmed;
          } else {
            currentStepText = trimmed;
          }
        }
      }
    }

    if (current) {
      if (currentStepText) {
        current.steps.push(currentStepText.trim());
      }
      if (current.steps.length > 0) {
        solutions.push(current);
      }
    }

    return solutions;
  };

  const handleQueryClick = (query) => {
    setSelectedQuery(query);
    const workarounds = parseWorkarounds(query.response);
    setParsedWorkarounds(workarounds);
    
    // Scroll to details section
    setTimeout(() => {
      document.getElementById("queryDetails")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleBack = () => {
    setSelectedQuery(null);
    setParsedWorkarounds([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="content">
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="content">
        <div className="history-header">
          <h1>⎗ Query History</h1>
          <p className="history-subtitle">
            {queries.length} {queries.length === 1 ? "query" : "queries"} found
          </p>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Query List */}
        {!selectedQuery && (
          <div className="history-list">
            {queries.length === 0 ? (
              <div className="empty-history">
                <p>No queries yet. Start by asking a question!</p>
              </div>
            ) : (
              queries.map((query) => (
                <div
                  key={query._id}
                  className="history-card"
                  onClick={() => handleQueryClick(query)}
                >
                  <div className="history-card-header">
                    <span className="history-badge">{query.community}</span>
                    <span className="history-date">
                      {formatDate(query.created_at)}
                    </span>
                  </div>
                  <div className="history-query">
                    {query.query.length > 100
                      ? query.query.substring(0, 100) + "..."
                      : query.query}
                  </div>
                  <div className="history-card-footer">
                    {query.images_count > 0 && (
                      <span className="history-images">
                        📎 {query.images_count} image{query.images_count > 1 ? "s" : ""}
                      </span>
                    )}
                    {query.response && (
                      <span className="history-status">✅ Answered</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Query Details */}
        {selectedQuery && (
          <div id="queryDetails" className="query-details">
            <button onClick={handleBack} className="back-button">
              ← Back to History
            </button>

            <div className="detail-section">
              <h2>Query Details</h2>
              <div className="detail-card">
                <div className="detail-row">
                  <span className="detail-label">Community:</span>
                  <span className="detail-value">{selectedQuery.community}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {formatDate(selectedQuery.created_at)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Images:</span>
                  <span className="detail-value">
                    {selectedQuery.images_count || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h2>Your Query</h2>
              <div className="query-text-box">
                {selectedQuery.query}
              </div>
            </div>

            {parsedWorkarounds.length > 0 && (
              <div className="detail-section">
                <h2>Workarounds Provided</h2>
                <div className="solutions">
                  {parsedWorkarounds.map((w, i) => (
                    <div
                      key={i}
                      className="solution-card"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <h3>Workaround {i + 1}:</h3>
                      
                      {w.problemStatement && (
                        <div className="workaround-section">
                          <h4>Problem Statement:</h4>
                          <p>{w.problemStatement}</p>
                        </div>
                      )}
                      
                      {w.rootCause && (
                        <div className="workaround-section">
                          <h4>Root Cause:</h4>
                          <p>{w.rootCause}</p>
                        </div>
                      )}
                      
                      {w.steps.length > 0 && (
                        <div className="workaround-section">
                          <h4>Solution:</h4>
                          <ul>
                            {w.steps.map((step, j) => (
                              <li key={j}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {w.references.length > 0 && (
                        <div className="workaround-section">
                          <h4>References:</h4>
                          <ul className="references-list">
                            {w.references.map((ref, j) => (
                              <li key={j}>{ref}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}