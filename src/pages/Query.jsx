import React, { useState } from "react";
import "../../src/styles.css";
import Header from "../components/Header"; // Make sure the path is correct

export default function KnowledgeHub() {
  const [query, setQuery] = useState("");
  const [community, setCommunity] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_API_URL = "http://localhost:8000/ask";

  const callOpenAI = async (query, community, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("query", query);
      formData.append("community", community || "");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const parseSolutions = (aiResponse) => {
    console.log("AI Response:", aiResponse); // Debug log
    
    const lines = aiResponse.split("\n");
    const solutions = [];
    let current = null;
    let currentStepText = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue; // Skip empty lines
      
      // Match "Solution 1:", "Solution 2:", etc.
      const solutionMatch = trimmed.match(/^Solution\s+(\d+):\s*(.+)/i);
      
      if (solutionMatch) {
        // Save previous step if exists
        if (current && currentStepText) {
          current.steps.push(currentStepText.trim());
          currentStepText = "";
        }
        // Save previous solution if exists
        if (current) {
          solutions.push(current);
        }
        // Start new solution
        current = { 
          title: solutionMatch[2].trim(), 
          steps: [] 
        };
      } else if (current) {
        // Match "Step X:" format
        const stepMatch = trimmed.match(/^Step\s+(\d+):\s*(.+)/i);
        
        if (stepMatch) {
          // Save previous step if exists
          if (currentStepText) {
            current.steps.push(currentStepText.trim());
          }
          // Start new step with "Step X: " prefix
          currentStepText = `Step ${stepMatch[1]}: ${stepMatch[2].trim()}`;
        } else if (trimmed.length > 0) {
          // This is a continuation of the current step
          if (currentStepText) {
            currentStepText += " " + trimmed;
          } else {
            // If no step started yet, treat as step content
            currentStepText = trimmed;
          }
        }
      }
    }

    // Don't forget the last step and solution
    if (current) {
      if (currentStepText) {
        current.steps.push(currentStepText.trim());
      }
      if (current.steps.length > 0) {
        solutions.push(current);
      }
    }

    console.log("Parsed Solutions:", solutions); // Debug log

    // If we got less than 4 solutions, something went wrong
    if (solutions.length === 0) {
      return [{
        title: "Error Parsing Response",
        steps: [
          "Step 1: The AI response couldn't be parsed correctly.",
          "Step 2: Raw response: " + aiResponse.substring(0, 200) + "..."
        ]
      }];
    }

    return solutions;
  };

  const processQuery = async () => {
    if (!query.trim()) {
      alert("Please enter a query");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Sending query:", { query, community, hasImage: !!image });
      
      const aiResponse = await callOpenAI(query, community, image);
      
      console.log("Received AI response:", aiResponse);
      
      if (!aiResponse) throw new Error("Empty response from AI");

      const parsed = parseSolutions(aiResponse);
      
      if (parsed.length === 0) {
        throw new Error("No solutions could be parsed from AI response");
      }
      
      setSolutions(parsed);
      setShowSolutions(true);

      setTimeout(() => {
        document.getElementById("solutionsSection")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    } catch (err) {
      console.error("Error in processQuery:", err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const askAnother = () => {
    setQuery("");
    setCommunity("");
    setImage(null);
    setImagePreview(null);
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

          {/* Image Upload */}
          <div className="field">
            <label className="image-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
              />
              <span className="upload-text">
                📎 {image ? "Change Image" : "Attach Screenshot (Optional)"}
              </span>
            </label>
            
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button onClick={removeImage} className="remove-image-btn">
                  ✕ Remove
                </button>
              </div>
            )}
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