import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/authService";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

const StudentStatus = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  
  // State for student details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
  
  // Function to view student details
  const viewStudentDetails = async () => {
    if (!evaluation) return;
    
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setStudentSubjects([]);
    
    try {
      // Find the student in the Students collection
      const studentsRef = collection(db, 'Students');
      const q = query(studentsRef, where('Email', '==', evaluation.Email));
      const studentSnapshot = await getDocs(q);
      
      if (studentSnapshot.empty) {
        console.log('No student found with this email');
        setLoadingDetails(false);
        return;
      }
      
      const studentDoc = studentSnapshot.docs[0];
      const studentId = studentDoc.id;
      
      // Fetch the student's prospectus
      let allSubjects = [];
      const courseCode = evaluation.Course;
      
      // Get all years for this course
      const years = ["Year1", "Year2", "Year3", "Year4"];
      
      for (const yearName of years) {
        const yearNumber = parseInt(yearName.replace('Year', ''));
        
        // Get all semesters for this year
        const semestersRef = collection(db, 'Students', studentId, 'Prospectus', courseCode, yearName);
        const semestersSnapshot = await getDocs(semestersRef);
        
        if (semestersSnapshot.empty) continue;
        
        // Process each semester
        for (const semesterDoc of semestersSnapshot.docs) {
          const semesterName = semesterDoc.id;
          let semesterNumber;
          
          if (semesterName === 'FirstSem') semesterNumber = 1;
          else if (semesterName === 'SecondSem') semesterNumber = 2;
          else if (semesterName === 'Summer') semesterNumber = 3;
          else continue; // Skip if not a valid semester
          
          // Get subjects collection for this semester
          const subjectsRef = collection(
            db, 
            'Students', 
            studentId, 
            'Prospectus', 
            courseCode,
            yearName, 
            semesterName,
            'Subjects'
          );
          
          const subjectsSnapshot = await getDocs(subjectsRef);
          
          // Process each subject
          subjectsSnapshot.docs.forEach(subjectDoc => {
            const subjectData = subjectDoc.data();
            
            allSubjects.push({
              year: yearNumber,
              semester: semesterNumber,
              code: subjectDoc.id,
              description: subjectData.CourseDescription || '',
              units: subjectData.UnitsTotal || 0,
              passed: subjectData.Passed || false
            });
          });
        }
      }
      
      // Sort subjects
      allSubjects.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.semester !== b.semester) return a.semester - b.semester;
        return a.code.localeCompare(b.code);
      });
      
      setStudentSubjects(allSubjects);
    } catch (err) {
      console.error("Error fetching student details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

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
    notCreditedRow: {
      backgroundColor: "#fff3cd", // Light yellow for not-credited
    },
    remarks: {
      fontSize: "0.9rem",
      color: "#721c24",
      maxWidth: "200px",
      wordWrap: "break-word",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      marginTop: "20px",
    },
    backButton: {
      padding: "10px 20px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    detailsButton: {
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
    },
    // Modal Styles
    detailsModalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    detailsModal: {
      backgroundColor: "white",
      borderRadius: "8px",
      width: "80%",
      maxWidth: "900px",
      maxHeight: "80vh",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
      display: "flex",
      flexDirection: "column",
    },
    detailsModalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 20px",
      borderBottom: "1px solid #eee",
    },
    detailsModalTitle: {
      margin: 0,
      color: "#333",
    },
    closeModalButton: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#666",
      transition: "color 0.2s",
    },
    studentSummary: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "15px",
      padding: "15px 20px",
      backgroundColor: "#f9f9f9",
    },
    studentInfoItem: {
      display: "flex",
      flexDirection: "column",
    },
    infoLabel: {
      fontSize: "0.8rem",
      color: "#666",
      marginBottom: "5px",
    },
    infoValue: {
      fontWeight: "500",
    },
    detailsModalContent: {
      flex: 1,
      overflowY: "auto",
      padding: "0 20px",
      maxHeight: "50vh",
    },
    loadingDetails: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px",
    },
    loadingSpinnerSmall: {
      border: "3px solid #f3f3f3",
      borderTop: "3px solid rgb(233, 97, 97)",
      borderRadius: "50%",
      width: "30px",
      height: "30px",
      animation: "spin 2s linear infinite",
      marginBottom: "15px",
    },
    noSubjectsMessage: {
      textAlign: "center",
      padding: "30px",
      color: "#666",
      fontStyle: "italic",
    },
    subjectsContainer: {
      padding: "15px 0",
    },
    academicYear: {
      marginBottom: "25px",
    },
    academicYearTitle: {
      marginBottom: "15px",
      paddingBottom: "5px",
      borderBottom: "1px solid #eee",
      color: "#333",
    },
    semesterBlock: {
      marginBottom: "20px",
    },
    semesterTitle: {
      marginBottom: "10px",
      color: "#555",
    },
    subjectsTable: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "15px",
    },
    subjectsTableHeader: {
      backgroundColor: "#f5f5f5",
      padding: "10px",
      textAlign: "left",
      fontWeight: "600",
      color: "#333",
    },
    subjectsTableCell: {
      padding: "10px",
      borderTop: "1px solid #eee",
    },
    passedSubject: {
      backgroundColor: "rgba(76, 175, 80, 0.1)",
    },
    statusBadge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "0.8rem",
      fontWeight: "500",
    },
    passedBadge: {
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
    },
    notPassedBadge: {
      backgroundColor: "#ffebee",
      color: "#c62828",
    },
    notCreditedBadge: {
      backgroundColor: "#fff3cd", // Light yellow background
      color: "#856404", // Dark yellow/amber text
    },
    detailsModalFooter: {
      padding: "15px 20px",
      borderTop: "1px solid #eee",
    },
    summaryStats: {
      display: "flex",
      gap: "15px",
    },
    statBox: {
      flex: 1,
      backgroundColor: "#f5f5f5",
      padding: "15px",
      borderRadius: "6px",
      textAlign: "center",
    },
    statLabel: {
      fontSize: "0.9rem",
      color: "#666",
      marginBottom: "5px",
      display: "block",
    },
    statValue: {
      fontSize: "1.3rem",
      fontWeight: "bold",
      color: "#333",
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
          <div style={styles.buttonContainer}>
            <button style={styles.backButton} onClick={() => navigate("/check-status")}>
              Back to Email Check
            </button>
          </div>
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
          <div style={styles.buttonContainer}>
            <button style={styles.backButton} onClick={() => navigate("/check-status")}>
              Back to Email Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Separate courses into three categories: passed, failed, and not-credited
  const passedCourses = evaluation.Courses?.filter(course => course.Passed) || [];
  
  // Check for status field first, then fallback to just !Passed
  const notCreditedCourses = evaluation.Courses?.filter(course => 
    course.Status === 'not-credited' || 
    (course.Remarks && course.Remarks.toLowerCase().includes('no credits found'))
  ) || [];
  
  // Failed courses are those that are not passed and not in the not-credited category
  const failedCourses = evaluation.Courses?.filter(course => 
    !course.Passed && 
    !notCreditedCourses.includes(course)
  ) || [];

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
        <h3 style={styles.sectionHeading}>Passed Subjects ({passedCourses.length})</h3>
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
                  <td style={styles.thTd}>{course.Grade || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{textAlign: "center", color: "#666"}}>No credited subjects found.</p>
        )}

        {/* Table displaying failed subjects */}
        <h3 style={styles.sectionHeading}>Failed Subjects ({failedCourses.length})</h3>
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
                  <td style={styles.thTd}>{course.Grade || ""}</td>
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
          <p style={{textAlign: "center", color: "#666"}}>No failed subjects found.</p>
        )}

        {/* Table displaying not-credited subjects */}
        <h3 style={styles.sectionHeading}>Not Credited Subjects ({notCreditedCourses.length})</h3>
        <h4 style={{color: "#666", marginBottom: "10px", fontStyle: "italic"}}>Note: These courses could not be credited due to missing or invalid information.</h4>
        {notCreditedCourses.length > 0 ? (
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
              {notCreditedCourses.map((course, index) => (
                <tr key={index} style={styles.notCreditedRow}>
                  <td style={styles.thTd}>{course.Code}</td>
                  <td style={styles.thTd}>{course.Description}</td>
                  <td style={styles.thTd}>{course.Credits}</td>
                  <td style={styles.thTd}>{course.Grade || ""}</td>
                  <td style={styles.thTd}>
                    {course.Remarks ? (
                      <div style={styles.remarks}>{course.Remarks}</div>
                    ) : (
                      <span style={styles.noRemarks}>No credits found</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{textAlign: "center", color: "#666"}}>No not-credited subjects found.</p>
        )}

        {/* Buttons */}
        <div style={styles.buttonContainer}>
          <button style={styles.backButton} onClick={() => navigate("/check-status")}>
            Back to Email Check
          </button>
          <button style={styles.detailsButton} onClick={viewStudentDetails}>
            View Complete Prospectus
          </button>
        </div>
      </div>

      {/* Student Details Modal */}
      {showDetailsModal && (
        <div style={styles.detailsModalOverlay}>
          <div style={styles.detailsModal}>
            <div style={styles.detailsModalHeader}>
              <h3 style={styles.detailsModalTitle}>Student Course Details</h3>
              <button 
                style={styles.closeModalButton}
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.studentSummary}>
              <div style={styles.studentInfoItem}>
                <span style={styles.infoLabel}>Name:</span>
                <span style={styles.infoValue}>{evaluation.StudentName}</span>
              </div>
              <div style={styles.studentInfoItem}>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{evaluation.Email}</span>
              </div>
              <div style={styles.studentInfoItem}>
                <span style={styles.infoLabel}>Course:</span>
                <span style={styles.infoValue}>{evaluation.Course}</span>
              </div>
              <div style={styles.studentInfoItem}>
                <span style={styles.infoLabel}>Year Level:</span>
                <span style={styles.infoValue}>{evaluation.YearLevel}</span>
              </div>
              <div style={styles.studentInfoItem}>
                <span style={styles.infoLabel}>Evaluation Date:</span>
                <span style={styles.infoValue}>{evaluation.formattedDate}</span>
              </div>
              <div style={styles.studentInfoItem}>
                <span style={styles.infoLabel}>Evaluator:</span>
                <span style={styles.infoValue}>{evaluation.EvaluatorName}</span>
              </div>
            </div>
            <h5 style={{color: "#666", marginLeft: "10px", fontStyle: "italic"}}>Disclaimer: This prospectus is still subject to change as per the final evaluation of the Registrar's Office.</h5>
            <div style={styles.detailsModalContent}>
              {loadingDetails ? (
                <div style={styles.loadingDetails}>
                  <div style={styles.loadingSpinnerSmall}></div>
                  <p>Loading course details...</p>
                </div>
              ) : studentSubjects.length === 0 ? (
                <div style={styles.noSubjectsMessage}>
                  No course details available for this student.
                </div>
              ) : (
                <div style={styles.subjectsContainer}>
                  {[1, 2, 3, 4].map(year => {
                    const yearSubjects = studentSubjects.filter(subject => subject.year === year);
                    if (yearSubjects.length === 0) return null;
                    
                    return (
                      <div key={year} style={styles.academicYear}>
                        <h4 style={styles.academicYearTitle}>Year {year}</h4>
                        
                        {[1, 2, 3].map(semester => {
                          const semesterSubjects = yearSubjects.filter(
                            subject => subject.semester === semester
                          );
                          
                          if (semesterSubjects.length === 0) return null;
                          
                          return (
                            <div key={`${year}-${semester}`} style={styles.semesterBlock}>
                              <h5 style={styles.semesterTitle}>
                                {semester === 1 ? 'First Semester' : 
                                 semester === 2 ? 'Second Semester' : 'Summer'}
                              </h5>
                              
                              <table style={styles.subjectsTable}>
                                <thead>
                                  <tr>
                                    <th style={styles.subjectsTableHeader}>Code</th>
                                    <th style={styles.subjectsTableHeader}>Description</th>
                                    <th style={styles.subjectsTableHeader}>Units</th>
                                    <th style={styles.subjectsTableHeader}>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {semesterSubjects.map((subject) => (
                                    <tr 
                                      key={subject.code} 
                                      style={subject.passed ? {...styles.subjectsTableCell, ...styles.passedSubject} : styles.subjectsTableCell}
                                    >
                                      <td style={styles.subjectsTableCell}>{subject.code}</td>
                                      <td style={styles.subjectsTableCell}>{subject.description}</td>
                                      <td style={styles.subjectsTableCell}>{subject.units}</td>
                                      <td style={styles.subjectsTableCell}>
                                        <span 
                                          style={
                                            subject.passed 
                                              ? {...styles.statusBadge, ...styles.passedBadge} 
                                              : {...styles.statusBadge, ...styles.notPassedBadge}
                                          }
                                        >
                                          {subject.passed ? 'Passed' : 'Not Passed'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div style={styles.detailsModalFooter}>
              <div style={styles.summaryStats}>
                <div style={styles.statBox}>
                  <span style={styles.statLabel}>Total Subjects</span>
                  <span style={styles.statValue}>{studentSubjects.length}</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statLabel}>Passed</span>
                  <span style={styles.statValue}>{studentSubjects.filter(s => s.passed).length}</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statLabel}>Not Passed</span>
                  <span style={styles.statValue}>{studentSubjects.filter(s => !s.passed).length}</span>
                </div>
              </div>
            </div>
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

export default StudentStatus;