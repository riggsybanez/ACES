import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/authService";
import { collection, query, where, getDocs } from "firebase/firestore";

const EmailCheck = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      backgroundColor: "#f0f0f0",
    },
    evaluationBox: {
      border: "1px solid #ccc",
      padding: "20px",
      borderRadius: "8px",
      width: "400px",
      backgroundColor: "#f9f9f9",
      textAlign: "center",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    inputField: {
      width: "90%",
      padding: "10px",
      marginBottom: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
    },
    button: {
      padding: "10px",
      backgroundColor: "rgb(233, 97, 97)",
      color: "white",
      fontWeight: "bold",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "background 0.3s ease",
      width: "48%",
    },
    errorMessage: {
      color: "#721c24",
      backgroundColor: "#f8d7da",
      padding: "10px",
      marginBottom: "10px",
      borderRadius: "5px",
      textAlign: "center",
    },
    loadingSpinner: {
      display: "inline-block",
      width: "20px",
      height: "20px",
      border: "3px solid rgba(255,255,255,.3)",
      borderRadius: "50%",
      borderTopColor: "white",
      animation: "spin 1s ease-in-out infinite",
      marginRight: "10px",
    },
    modal: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "8px",
      width: "400px",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    },
    modalButton: {
      marginTop: "15px",
      padding: "8px 15px",
      backgroundColor: "rgb(233, 97, 97)",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    "@keyframes spin": {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
  };

  // Handle navigating to student status page
  const handleCheckStatus = async () => {
    if (!email) {
      setError("Please enter an email address");
      return;
    }
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Query Firestore for evaluations with the provided email
      const evaluationsRef = collection(db, "EvaluationHistory");
      const q = query(evaluationsRef, where("Email", "==", email.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // No evaluation found with this email
        setShowModal(true);
      } else {
        // Get the latest evaluation (in case there are multiple)
        const evaluations = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by evaluation date (newest first)
        evaluations.sort((a, b) => {
          const dateA = a.EvaluationDate?.toDate() || new Date(0);
          const dateB = b.EvaluationDate?.toDate() || new Date(0);
          return dateB - dateA;
        });
        
        const latestEvaluation = evaluations[0];
        
        // Navigate to status page with the evaluation ID
        navigate(`/student-status/${latestEvaluation.id}`);
      }
    } catch (error) {
      console.error("Error checking evaluation status:", error);
      setError("An error occurred while checking your status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // State for the "not found" modal
  const [showModal, setShowModal] = useState(false);

  // Handle navigating back to the home page
  const handleBack = () => {
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <div style={styles.evaluationBox}>
        <h2>Student Evaluation Status</h2>
        
        {error && <div style={styles.errorMessage}>{error}</div>}
        
        <input
          type="email"
          placeholder="Enter your email"
          style={styles.inputField}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <div style={styles.buttonContainer}>
          <button 
            style={styles.button} 
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </button>
          <button 
            style={styles.button} 
            onClick={handleCheckStatus}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.loadingSpinner}></span>
                Checking...
              </>
            ) : (
              "Check Status"
            )}
          </button>
        </div>
      </div>

      {/* Modal for "Email not found" */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>No Record Found</h3>
            <p>No email associated with a record. Evaluation process may still be ongoing.</p>
            <button 
              style={styles.modalButton}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add keyframes for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EmailCheck;