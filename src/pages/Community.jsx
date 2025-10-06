import React, { useEffect, useState } from "react";

export default function Community({ setActivePage }) {
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestStatus, setRequestStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch communities when search changes
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/communities?search=${search}`);
        const data = await response.json();
        setCommunities(data);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
  }, [search]);

  const selectCommunity = (name) => {
    // Store selected community in sessionStorage
    sessionStorage.setItem('selectedCommunity', name);
    // Navigate to query page using the setActivePage prop
    setActivePage('query');
  };

  const handleRequestCommunity = async () => {
    if (!requestName.trim()) {
      setRequestStatus({ type: "error", message: "Please enter a community name" });
      return;
    }

    setIsSubmitting(true);
    setRequestStatus({ type: "", message: "" });

    try {
      const response = await fetch("http://127.0.0.1:8000/request-community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: requestName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.exists) {
          setRequestStatus({ 
            type: "info", 
            message: `Community "${requestName}" already exists!` 
          });
        } else {
          setRequestStatus({ 
            type: "success", 
            message: `Community "${requestName}" has been requested successfully!` 
          });
          // Refresh the communities list
          const refreshResponse = await fetch(`http://127.0.0.1:8000/communities?search=${search}`);
          const refreshData = await refreshResponse.json();
          setCommunities(refreshData);
        }
        
        // Clear form after 2 seconds on success
        setTimeout(() => {
          setRequestName("");
          if (data.created) {
            setShowRequestModal(false);
            setRequestStatus({ type: "", message: "" });
          }
        }, 2000);
      } else {
        setRequestStatus({ 
          type: "error", 
          message: data.detail || "Failed to request community" 
        });
      }
    } catch (error) {
      console.error("Error requesting community:", error);
      setRequestStatus({ 
        type: "error", 
        message: "Network error. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Community</h1>

      <div style={styles.content}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search community..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchBox}
          />
          <button
            onClick={() => setShowRequestModal(true)}
            style={styles.requestButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e68900';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ff9900';
            }}
          >
            + Request New Community
          </button>
        </div>

        <div style={styles.communityGrid}>
          {communities.length > 0 ? (
            communities.map((c, i) => (
              <div
                key={i}
                style={styles.communityCard}
                onClick={() => selectCommunity(c.name)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <h3 style={styles.communityName}>{c.name}</h3>
                <p style={styles.communityAction}>Click to ask a question →</p>
              </div>
            ))
          ) : (
            <p style={styles.noResults}>No communities found.</p>
          )}
        </div>
      </div>

      {/* Request Community Modal */}
      {showRequestModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRequestModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Request New Community</h2>
            
            <input
              type="text"
              placeholder="Enter community name..."
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRequestCommunity()}
              style={styles.modalInput}
              disabled={isSubmitting}
            />

            {requestStatus.message && (
              <div style={{
                ...styles.statusMessage,
                backgroundColor: 
                  requestStatus.type === 'error' ? '#ffe6e6' :
                  requestStatus.type === 'success' ? '#e6ffe6' :
                  '#e6f3ff',
                color: 
                  requestStatus.type === 'error' ? '#cc0000' :
                  requestStatus.type === 'success' ? '#008800' :
                  '#0066cc',
              }}>
                {requestStatus.message}
              </div>
            )}

            <div style={styles.modalButtons}>
              <button
                onClick={handleRequestCommunity}
                style={{
                  ...styles.submitButton,
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Requesting...' : 'Request Community'}
              </button>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestName("");
                  setRequestStatus({ type: "", message: "" });
                }}
                style={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
    fontSize: '32px',
    fontWeight: 'bold',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px',
  },
  searchBox: {
    width: '100%',
    maxWidth: '600px',
    padding: '15px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxSizing: 'border-box',
  },
  requestButton: {
    padding: '12px 24px',
    backgroundColor: '#ff9900',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  communityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    padding: '0 20px',
  },
  communityCard: {
    backgroundColor: 'white',
    padding: '30px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  communityName: {
    color: '#333',
    margin: '0 0 10px 0',
    fontSize: '20px',
  },
  communityAction: {
    color: '#ff9900',
    fontSize: '14px',
    margin: 0,
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    gridColumn: '1 / -1',
    padding: '40px',
    fontSize: '18px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '450px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  modalTitle: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '24px',
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '15px',
    boxSizing: 'border-box',
  },
  statusMessage: {
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '14px',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'space-between',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#ff9900',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};