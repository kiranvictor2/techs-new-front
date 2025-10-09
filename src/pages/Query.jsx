import React, { useState, useEffect, useRef } from "react";

export default function Query() {
  const [query, setQuery] = useState("");
  const [community, setCommunity] = useState("");
  const [communitySearch, setCommunitySearch] = useState("");
  const [communities, setCommunities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [workarounds, setWorkarounds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWorkarounds, setShowWorkarounds] = useState(false);
  const [error, setError] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState({ used: 0, limit: 4 });
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const BACKEND_API_URL = "http://localhost:8000/ask";
  const COMMUNITIES_API_URL = "http://localhost:8000/communitiestty";
  const MAX_IMAGES = 5;

  // Get community from sessionStorage on mount
  useEffect(() => {
    const checkForCommunity = () => {
      const selectedCommunity = sessionStorage.getItem('selectedCommunity');
      if (selectedCommunity && selectedCommunity !== community) {
        setCommunity(selectedCommunity);
        setCommunitySearch(selectedCommunity);
        sessionStorage.removeItem('selectedCommunity');
      }
    };

    checkForCommunity();
    const interval = setInterval(checkForCommunity, 100);
    return () => clearInterval(interval);
  }, []);

  // Fetch communities from database
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch(
          `${COMMUNITIES_API_URL}?search=${encodeURIComponent(communitySearch)}`
        );
        if (response.ok) {
          const data = await response.json();
          setCommunities(data);
        }
      } catch (err) {
        console.error("Error fetching communities:", err);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCommunities();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [communitySearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const callOpenAI = async (query, community, imageFiles) => {
    try {
      const formData = new FormData();
      formData.append("query", query);
      formData.append("community", community || "");
      
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        formData.append("user", userEmail);
      }
      
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        // Check if it's a quota exceeded error
        if (response.status === 403 && errorData?.detail?.includes("Query limit reached")) {
          setQuotaExceeded(true);
          throw new Error("QUOTA_EXCEEDED");
        }
        
        throw new Error(
          `Backend error ${response.status}: ${errorData?.detail || "Unknown"}`
        );
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      return data.response;
    } catch (err) {
      if (err.message === "QUOTA_EXCEEDED") {
        throw err;
      }
      throw new Error(`Unable to get AI solutions: ${err.message}`);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more.`);
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const parseWorkarounds = (aiResponse) => {
    console.log("AI Response:", aiResponse);
    
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

      const problemMatch = trimmed.match(/Problem Statement:\s*([\s\S]*?)(?=Root Cause:|$)/i);
      if (problemMatch) {
        workaround.problemStatement = problemMatch[1].trim();
      }

      const rootCauseMatch = trimmed.match(/Root Cause:\s*([\s\S]*?)(?=Solution:|$)/i);
      if (rootCauseMatch) {
        workaround.rootCause = rootCauseMatch[1].trim();
      }

      const solutionMatch = trimmed.match(/Solution:\s*([\s\S]*?)(?=References:|$)/i);
      if (solutionMatch) {
        const solutionText = solutionMatch[1];
        const stepMatches = solutionText.match(/Step \d+:.*?(?=Step \d+:|$)/gs);
        
        if (stepMatches) {
          workaround.steps = stepMatches.map(step => step.trim());
        }
      }

      const referencesMatch = trimmed.match(/References:\s*([\s\S]*?)(?=---|$)/i);
      if (referencesMatch) {
        const refText = referencesMatch[1].trim();
        const refLines = refText.split('\n').filter(line => line.trim());
        workaround.references = refLines.map(ref => ref.trim());
      }

      if (workaround.problemStatement || workaround.steps.length > 0) {
        workarounds.push(workaround);
      }
    }

    console.log("Parsed Workarounds:", workarounds);

    if (workarounds.length === 0) {
      return [{
        problemStatement: "Error Parsing Response",
        rootCause: "The AI response couldn't be parsed correctly.",
        steps: ["Raw response: " + aiResponse.substring(0, 200) + "..."],
        references: []
      }];
    }

    return workarounds;
  };

  const processQuery = async () => {
    if (!query.trim()) {
      alert("Please enter a query");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Sending query:", { query, community, imageCount: images.length });
      
      const aiResponse = await callOpenAI(query, community, images);
      
      console.log("Received AI response:", aiResponse);
      
      if (!aiResponse) throw new Error("Empty response from AI");

      const parsed = parseWorkarounds(aiResponse);
      
      if (parsed.length === 0) {
        throw new Error("No workarounds could be parsed from AI response");
      }
      
      setWorkarounds(parsed);
      setShowWorkarounds(true);

      setTimeout(() => {
        document.getElementById("workaroundsSection")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    } catch (err) {
      console.error("Error in processQuery:", err);
      
      if (err.message === "QUOTA_EXCEEDED") {
        // Don't show alert, the quota page will be displayed
        return;
      }
      
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const askAnother = () => {
    setQuery("");
    setCommunity("");
    setCommunitySearch("");
    setImages([]);
    setImagePreviews([]);
    setShowWorkarounds(false);
    setWorkarounds([]);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCommunitySelect = (communityName) => {
    setCommunity(communityName);
    setCommunitySearch(communityName);
    setShowDropdown(false);
  };

  const goToSubscription = () => {
    // Replace with your actual subscription page route
    window.location.href = "/subscription";
  };

  // If quota exceeded, show subscription page
  if (quotaExceeded) {
    return (
      <div style={styles.page}>
        <div style={styles.quotaExceededContainer}>
          <div style={styles.quotaCard}>
            <div style={styles.quotaIconContainer}>
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#ff6b6b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            
            <h1 style={styles.quotaTitle}>Query Credits Exhausted</h1>
            
            <p style={styles.quotaMessage}>
              You've reached your query limit for this period. 
              Upgrade your plan to continue getting AI-powered solutions.
            </p>
            
            <div style={styles.quotaStats}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Queries Used</span>
                <span style={styles.statValue}>{quotaInfo.used} / {quotaInfo.limit}</span>
              </div>
            </div>
            
            <div style={styles.quotaActions}>
              <button 
                onClick={goToSubscription}
                style={styles.upgradeButton}
              >
                Upgrade Plan
              </button>
              
              <button 
                onClick={() => window.location.href = "/"}
                style={styles.secondaryButton}
              >
                Go to Home
              </button>
            </div>
            
            <div style={styles.quotaFeatures}>
              <h3 style={styles.featuresTitle}>Premium Benefits:</h3>
              <ul style={styles.featuresList}>
                <li>✓ Unlimited queries per month</li>
                <li>✓ Priority AI response times</li>
                <li>✓ Access to advanced communities</li>
                <li>✓ Image analysis support</li>
                <li>✓ Export solutions as PDF</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Ask a Query</h1>
      
      <div style={styles.content}>
        {/* Community Selection with Autocomplete */}
        <div style={styles.field} ref={dropdownRef}>
          <input
            type="text"
            value={communitySearch}
            onChange={(e) => {
              setCommunitySearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search community (Java, SAP ABAP, Python, etc.)"
            style={styles.input}
            disabled={isLoading}
          />
          
          {showDropdown && communities.length > 0 && (
            <div style={styles.dropdown}>
              {communities.map((c, index) => (
                <div
                  key={index}
                  style={styles.dropdownItem}
                  onClick={() => handleCommunitySelect(c.name)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {c.name}
                </div>
              ))}
            </div>
          )}
          
          {community && (
            <div style={styles.selectedCommunity}>
              Selected: <strong>{community}</strong>
              <button
                onClick={() => {
                  setCommunity("");
                  setCommunitySearch("");
                }}
                style={styles.clearBtn}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Query Input with Integrated Attachment Button */}
        <div style={styles.field}>
          <div style={styles.textareaWrapper}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your query or error..."
              style={styles.textareaWithButton}
              disabled={isLoading}
            />
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              multiple
              disabled={isLoading || images.length >= MAX_IMAGES}
            />
            
            {/* Attachment Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={styles.attachButton}
              disabled={isLoading || images.length >= MAX_IMAGES}
              title={images.length >= MAX_IMAGES ? `Maximum ${MAX_IMAGES} images reached` : 'Attach screenshots'}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              {images.length > 0 && (
                <span style={styles.imageCount}>{images.length}</span>
              )}
            </button>
          </div>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div style={styles.imagePreviewsContainer}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={styles.imagePreviewWrapper}>
                  <img src={preview} alt={`Preview ${index + 1}`} style={styles.imagePreview} />
                  <button 
                    onClick={() => removeImage(index)} 
                    style={styles.removeImageBtn}
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Get Workarounds Button */}
        <button
          onClick={processQuery}
          disabled={isLoading}
          style={{...styles.button, ...(isLoading ? styles.buttonDisabled : {})}}
        >
          {isLoading ? "Getting AI Solutions..." : "Get Workarounds"}
        </button>

        {/* Loading Screen */}
        {isLoading && (
          <div style={styles.loadingScreen}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Analyzing your query...</p>
            <p style={styles.loadingSubtext}>This may take a few moments</p>
          </div>
        )}

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Workarounds */}
        {showWorkarounds && (
          <div id="workaroundsSection" style={styles.solutions}>
            <h2>Workarounds:</h2>
            {workarounds.map((w, i) => (
              <div key={i} style={styles.solutionCard}>
                <h3>Workaround {i + 1}:</h3>
                
                {w.problemStatement && (
                  <div style={styles.workaroundSection}>
                    <h4>Problem Statement:</h4>
                    <p>{w.problemStatement}</p>
                  </div>
                )}
                
                {w.rootCause && (
                  <div style={styles.workaroundSection}>
                    <h4>Root Cause:</h4>
                    <p>{w.rootCause}</p>
                  </div>
                )}
                
                {w.steps.length > 0 && (
                  <div style={styles.workaroundSection}>
                    <h4>Solution:</h4>
                    <ul>
                      {w.steps.map((step, j) => (
                        <div key={j}>{step}</div>
                      ))}
                    </ul>
                  </div>
                )}
                
                {w.references.length > 0 && (
                  <div style={styles.workaroundSection}>
                    <h4>References:</h4>
                    <ul style={styles.referencesList}>
                      {w.references.map((ref, j) => (
                        <li key={j}>{ref}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            <button onClick={askAnother} style={{...styles.button, ...styles.askButton}}>
              Ask Another Query
            </button>
          </div>
        )}
      </div>

      {/* Add keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  pageTitle: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  field: {
    marginBottom: '20px',
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  textareaWrapper: {
    position: 'relative',
    width: '100%',
  },
  textareaWithButton: {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    paddingBottom: '45px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  attachButton: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#666',
    transition: 'all 0.2s ease',
  },
  imageCount: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#ff9900',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderTop: 'none',
    borderRadius: '0 0 4px 4px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  dropdownItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
  },
  selectedCommunity: {
    marginTop: '8px',
    padding: '8px 12px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#666',
    padding: '0 8px',
  },
  imagePreviewsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '15px',
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: '100px',
    height: '100px',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  removeImageBtn: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4502bb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  askButton: {
    marginTop: '20px',
  },
  loadingScreen: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '10px 0',
  },
  loadingSubtext: {
    color: '#666',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '15px',
  },
  solutions: {
    marginTop: '30px',
  },
  solutionCard: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  workaroundSection: {
    marginTop: '15px',
  },
  referencesList: {
    listStyleType: 'none',
    paddingLeft: '0',
  },
  // Quota Exceeded Styles
  quotaExceededContainer: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  quotaCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  quotaIconContainer: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  quotaTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  },
  quotaMessage: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  quotaStats: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  quotaActions: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
  },
  upgradeButton: {
    flex: 1,
    padding: '14px 24px',
    backgroundColor: '#4502bb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  secondaryButton: {
    flex: 1,
    padding: '14px 24px',
    backgroundColor: 'transparent',
    color: '#4502bb',
    border: '2px solid #4502bb',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  quotaFeatures: {
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
  },
  featuresTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  },
  featuresList: {
    listStyleType: 'none',
    paddingLeft: '0',
    margin: '0',
  },
};