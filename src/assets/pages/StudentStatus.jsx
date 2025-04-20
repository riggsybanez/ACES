import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/authService";
import { doc, getDoc } from "firebase/firestore";

const StudentStatus = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  // Fetch evaluation data
  useEffect(() => {
    const fetchEvaluation = async () => {
      if (!evaluationId) {
        navigate("/check-status");
        return;
      }
      
      try {
        setLoading(true);
        const evaluationRef = doc(db, "EvaluationHistory", evaluationId);
        const evaluationSnap = await getDoc(evaluationRef);
        
        if (!evaluationSnap.exists()) {
          setError("Evaluation not found");
          return;
        }
        
        // Get evaluation data and convert timestamp
        const evaluationData = evaluationSnap.data();
        
        // Format the evaluation date
        if (evaluationData.EvaluationDate) {
          const date = evaluationData.EvaluationDate.toDate();
          evaluationData.formattedDate = date.toLocaleDateString();
        } else {
          evaluationData.formattedDate = "N/A";
        }
        
        setEvaluation(evaluationData);
      } catch (err) {
        console.error("Error fetching evaluation:", err);
        setError("Failed to load evaluation data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvaluation();
  }, [evaluationId, navigate]);

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      width: "100vw",
      backgroundColor: "#f0f0f0",
      padding: "20px 0",
    },
    evaluationBox: {
      border: "1px solid #ccc",
      padding: "20px",
      borderRadius: "8px",
      width: "800px",
      maxWidth: "90%",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    studentInfo: {
      flex: "1",
      minWidth: "200px",
    },
    evaluationInfo: {
      flex: "1",
      minWidth: "200px",
      textAlign: "right",
    },
    status: {
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: "20px",
      padding: "10px",
      backgroundColor: "#d4edda",
      color: "#155724",
      borderRadius: "5px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "10px",
      marginBottom: "20px",
    },
    thTd: {
      border: "1px solid #ddd",
      padding: "8px",
      textAlign: "left",
    },
    th: {
      backgroundColor: "#f2f2f2",
      fontWeight: "bold",
    },
    passedRow: {
      backgroundColor: "#d4edda",
    },
    failedRow: {
      backgroundColor: "#f8d7da",
    },
    remarks: {
      fontSize: "0.9rem",
      color: "#721c24",
      maxWidth: "200px",
      wordWrap: "break-word",
    },
    backButton: {
      display: "block",
      margin: "20px auto 0",
      padding: "10px 20px",
      backgroundColor: "rgb(233, 97, 97)",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
    },
    loadingSpinner: {
      display: "inline-block",
      width: "40px",
      height: "40px",
      border: "4px solid rgba(233, 97, 97, 0.3)",
      borderRadius: "50%",
      borderTopColor: "rgb(233, 97, 97)",
      animation: "spin 1s ease-in-out infinite",
      marginBottom: "20px",
    },
    errorContainer: {
      textAlign: "center",
      padding: "20px",
      color: "#721c24",
      backgroundColor: "#f8d7da",
      borderRadius: "5px",
      marginBottom: "20px",
    },
    sectionHeading: {
      borderBottom: "2px solid #ddd",
      paddingBottom: "8px",
      marginTop: "25px",
      marginBottom: "15px",
      color: "#333",
    },
    noRemarks: {
      fontStyle: "italic",
      color: "#6c757d",
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.evaluationBox}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p>Loading evaluation data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.evaluationBox}>
          <div style={styles.errorContainer}>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
          <button style={styles.backButton} onClick={() => navigate("/check-status")}>
            Back to Email Check
          </button>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div style={styles.container}>
        <div style={styles.evaluationBox}>
          <div style={styles.errorContainer}>
            <h3>No Data Found</h3>
            <p>The requested evaluation could not be found.</p>
          </div>
          <button style={styles.backButton} onClick={() => navigate("/check-status")}>
            Back to Email Check
          </button>
        </div>
      </div>
    );
  }

  // Separate passed and failed courses
  const passedCourses = evaluation.Courses?.filter(course => course.Passed) || [];
  const failedCourses = evaluation.Courses?.filter(course => !course.Passed) || [];

  return (
    <div style={styles.container}>
      <div style={styles.evaluationBox}>
        {/* Header with student details */}
        <div style={styles.header}>
          <div style={styles.studentInfo}>
            <h2>{evaluation.StudentName}</h2>
            <p><strong>Email:</strong> {evaluation.Email}</p>
            <p><strong>Program:</strong> {evaluation.Course}</p>
            <p><strong>Year Level:</strong> {evaluation.YearLevel}</p>
          </div>
          <div style={styles.evaluationInfo}>
            <p><strong>Evaluation Date:</strong> {evaluation.formattedDate}</p>
            <p><strong>Evaluator:</strong> {evaluation.EvaluatorName || "N/A"}</p>
            <p><strong>University:</strong> {evaluation.University || "N/A"}</p>
          </div>
        </div>

        {/* Evaluation status */}
        <div style={styles.status}>
          Evaluation Status: Completed
        </div>

        {/* Table displaying credited subjects */}
        <h3 style={styles.sectionHeading}>Credited Subjects ({passedCourses.length})</h3>
        {passedCourses.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.thTd, ...styles.th}}>Course Code</th>
                <th style={{...styles.thTd, ...styles.th}}>Description</th>
                <th style={{...styles.thTd, ...styles.th}}>Credits</th>
                <th style={{...styles.thTd, ...styles.th}}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {passedCourses.map((course, index) => (
                <tr key={index} style={styles.passedRow}>
                  <td style={styles.thTd}>{course.Code}</td>
                  <td style={styles.thTd}>{course.Description}</td>
                  <td style={styles.thTd}>{course.Credits}</td>
                  <td style={styles.thTd}>{course.Grade || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{textAlign: "center", color: "#666"}}>No credited subjects found.</p>
        )}

        {/* Table displaying non-credited subjects */}
        <h3 style={styles.sectionHeading}>Non-Credited Subjects ({failedCourses.length})</h3>
        <h4 style={{color: "#666", marginBottom: "10px", fontStyle: "italic"}}>Note: Course Description may not match courses in the Transcript due to automation but are still reviewed properly by the Evaluator.</h4>
        {failedCourses.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.thTd, ...styles.th}}>Course Code</th>
                <th style={{...styles.thTd, ...styles.th}}>Description</th>
                <th style={{...styles.thTd, ...styles.th}}>Credits</th>
                <th style={{...styles.thTd, ...styles.th}}>Grade</th>
                <th style={{...styles.thTd, ...styles.th}}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {failedCourses.map((course, index) => (
                <tr key={index} style={styles.failedRow}>
                  <td style={styles.thTd}>{course.Code}</td>
                  <td style={styles.thTd}>{course.Description}</td>
                  <td style={styles.thTd}>{course.Credits}</td>
                  <td style={styles.thTd}>{course.Grade || "N/A"}</td>
                  <td style={styles.thTd}>
                    {course.Remarks ? (
                      <div style={styles.remarks}>{course.Remarks}</div>
                    ) : (
                      <span style={styles.noRemarks}>No remarks</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{textAlign: "center", color: "#666"}}>No non-credited subjects found.</p>
        )}

        {/* Back Button */}
        <button style={styles.backButton} onClick={() => navigate("/check-status")}>
          Back to Email Check
        </button>
      </div>

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

export default StudentStatus;