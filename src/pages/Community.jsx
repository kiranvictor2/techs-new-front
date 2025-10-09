import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Community() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestStatus, setRequestStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef(null);

  // Fetch communities with pagination
  const fetchCommunities = useCallback(async (pageNum, searchTerm) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/communities?search=${searchTerm}&page=${pageNum}&limit=50`
      );
      const data = await response.json();
      
      if (pageNum === 1) {
        setCommunities(data.communities || []);
      } else {
        setCommunities(prev => [...prev, ...(data.communities || [])]);
      }
      
      setHasMore(data.hasMore || false);
      
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Reset and fetch when search changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setCommunities([]);
    fetchCommunities(1, search);
  }, [search]);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoading]);

  // Fetch more communities when page changes (but not on initial load)
  useEffect(() => {
    if (page > 1) {
      fetchCommunities(page, search);
    }
  }, [page]);

  const selectCommunity = (name) => {
    // Store in sessionStorage for the Query component to read
    sessionStorage.setItem('selectedCommunity', name);
    // Navigate to query page
    navigate('/query');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
          // Refresh the list
          setPage(1);
          setHasMore(true);
          setCommunities([]);
          fetchCommunities(1, search);
        }
        
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
              e.currentTarget.style.backgroundColor = '#5b52f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4f46e5';
            }}
          >
            + Request New Community
          </button>
        </div>

        <div style={styles.communityGrid}>
          {communities.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
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
          ))}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading more communities...</p>
          </div>
        )}

        {/* Intersection observer target - this triggers loading more */}
        {hasMore && !isLoading && communities.length > 0 && (
          <div ref={loaderRef} style={styles.loadTrigger}>
            {/* This empty div triggers the next page load */}
          </div>
        )}

        {/* No results message */}
        {!isLoading && communities.length === 0 && (
          <p style={styles.noResults}>No communities found.</p>
        )}

        {/* End of list indicator */}
        {!hasMore && communities.length > 0 && (
          <p style={styles.endMessage}>You've reached the end of the list</p>
        )}
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={styles.scrollTopButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5b52f5';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4f46e5';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    paddingBottom: '100px',
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
    backgroundColor: '#4f46e5',
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
    marginBottom: '30px',
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
    wordBreak: 'break-word',
  },
  communityAction: {
    color: '#4f46e5',
    fontSize: '14px',
    margin: 0,
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    padding: '40px',
    fontSize: '18px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '15px',
    color: '#666',
    fontSize: '16px',
  },
  loadTrigger: {
    height: '50px',
    width: '100%',
  },
  endMessage: {
    textAlign: 'center',
    color: '#999',
    padding: '30px',
    fontSize: '14px',
    fontStyle: 'italic',
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
    backgroundColor: '#4f46e5',
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
  scrollTopButton: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '56px',
    height: '56px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
    transition: 'all 0.3s ease',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);