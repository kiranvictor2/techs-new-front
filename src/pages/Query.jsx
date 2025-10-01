import React, { useState } from "react";
import "../../src/styles.css";
import Header from "../components/Header"; // Make sure the path is correct

export default function KnowledgeHub() {
  const [query, setQuery] = useState("");
  const [community, setCommunity] = useState("");
  const [solutions, setSolutions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_API_URL = "http://localhost:8000/ask";

  const callOpenAI = async (query, community) => {
    try {
      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, community: community || "" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Backend error ${response.status}: ${errorData?.detail || "Unknown"}`
        );
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      return data.response;
    } catch (err) {
      throw new Error(`Unable to get AI solutions: ${err.message}`);
    }
  };

  const parseSolutions = (aiResponse) => {
    const lines = aiResponse.split("\n").filter((line) => line.trim());
    const solutions = [];
    let current = null;

    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^(Solution\s*\d+):?\s*(.+)/i);

      if (match) {
        if (current && current.steps.length > 0) solutions.push(current);
        current = { title: match[2].trim(), steps: [] };
      } else if (current) {
        current.steps.push(trimmed);
      }
    }

    if (current && current.steps.length > 0) solutions.push(current);

    while (solutions.length < 4) {
      solutions.push({
        title: `Additional Solution ${solutions.length + 1}`,
        steps: ["Step 1: AI is generating more solutions..."],
      });
    }

    return solutions.slice(0, 4);
  };

  const processQuery = async () => {
    if (!query.trim()) {
      alert("Please enter a query");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const aiResponse = await callOpenAI(query, community);
      if (!aiResponse) throw new Error("Empty response from AI");

      const parsed = parseSolutions(aiResponse);
      setSolutions(parsed);
      setShowSolutions(true);

      setTimeout(() => {
        document.getElementById("solutionsSection")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const askAnother = () => {
    setQuery("");
    setCommunity("");
    setShowSolutions(false);
    setSolutions([]);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <Header />

        {/* Content */}
        <div className="content">
          {/* Community Selection */}
          <div className="field">
            <select
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="input"
            >
              <option value="">Select Community (Java, SAP ABAP, etc.)</option>
              <option value="java">Java</option>
              <option value="sap">SAP ABAP</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="react">React</option>
              <option value="nodejs">Node.js</option>
              <option value="dotnet">.NET</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          {/* Query Input */}
          <div className="field">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your query or error..."
              className="input textarea"
            />
          </div>

          {/* Get Workarounds Button */}
          <button
            onClick={processQuery}
            disabled={isLoading}
            className={`button ${isLoading ? "disabled" : ""}`}
          >
            {isLoading ? "Getting AI Solutions..." : "Get Workarounds"}
          </button>

          {/* Error */}
          {error && <div className="error">{error}</div>}

          {/* Solutions */}
          {showSolutions && (
            <div id="solutionsSection" className="solutions">
              <h2>Solutions:</h2>
              {solutions.map((s, i) => (
                <div
                  key={i}
                  className="solution-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <h3>
                    ✅ Solution {i + 1}: {s.title}
                  </h3>
                  <ul>
                    {s.steps.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <button onClick={askAnother} className="button ask">
                Ask Another Query
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
