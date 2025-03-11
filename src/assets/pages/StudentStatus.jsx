import React, { useState } from "react";

const StudentStatus = () => {
  const student = {
    name: "John Doe",
    course: "Computer Science",
    evaluationDate: "2025-03-10",
    evaluationCompleted: true, // New flag for evaluation status
    subjects: [
      { name: "Mathematics", courseCode: "CS101", units: 3, credited: true },
      { name: "Physics", courseCode: "CS102", units: 4, credited: false },
      { name: "Chemistry", courseCode: "CS103", units: 3, credited: true },
    ],
  };

  const [showRemarks, setShowRemarks] = useState(false);

  const handleRemarks = () => {
    setShowRemarks(true); // Show the remarks modal
  };

  const closeRemarks = () => {
    setShowRemarks(false); // Close the remarks modal
  };

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
      width: "500px",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "10px",
    },
    status: {
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "10px",
    },
    thTd: {
      border: "1px solid #ddd",
      padding: "8px",
      textAlign: "center",
    },
    green: {
      backgroundColor: "#d4edda",
      color: "#155724",
    },
    button: {
      padding: "5px 10px",
      backgroundColor: "rgb(233, 97, 97)",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    backButton: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "10px 0",
      padding: "10px 20px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
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
    },
    modalContent: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "8px",
      width: "400px",
      textAlign: "center",
    },
    closeButton: {
      marginTop: "10px",
      padding: "5px 10px",
      backgroundColor: "rgb(233, 97, 97)",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.evaluationBox}>
        {/* Back Button */}
        <button style={styles.backButton} onClick={() => window.history.back()}>
          Back
        </button>

        {/* Header with student details */}
        <div style={styles.header}>
          <div>
            <p><strong>{student.name}</strong></p>
            <p>{student.course}</p>
          </div>
        </div>

        {/* Evaluation status */}
        <div style={styles.status}>
          Evaluation Status: {student.evaluationCompleted ? "Completed" : "In Progress"}
        </div>

        {/* Table displaying credited subjects */}
        <h3>Credited Subjects</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.thTd}>Subject</th>
              <th style={styles.thTd}>Course Code</th>
              <th style={styles.thTd}>Units</th>
            </tr>
          </thead>
          <tbody>
            {student.subjects
              .filter((subject) => subject.credited)
              .map((subject, index) => (
                <tr key={index} style={styles.green}>
                  <td style={styles.thTd}>{subject.name}</td>
                  <td style={styles.thTd}>{subject.courseCode}</td>
                  <td style={styles.thTd}>{subject.units}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Table displaying non-credited subjects */}
        <h3>Non-Credited Subjects</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.thTd}>Subject</th>
              <th style={styles.thTd}>Course Code</th>
              <th style={styles.thTd}>Units</th>
              <th style={styles.thTd}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {student.subjects
              .filter((subject) => !subject.credited)
              .map((subject, index) => (
                <tr key={index}>
                  <td style={styles.thTd}>{subject.name}</td>
                  <td style={styles.thTd}>{subject.courseCode}</td>
                  <td style={styles.thTd}>{subject.units}</td>
                  <td style={styles.thTd}>
                    <button
                      style={styles.button}
                      onClick={handleRemarks}
                    >
                      Remarks
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Remarks */}
      {showRemarks && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <p>This does not match the course description of your course program's curriculum.</p>
            <button style={styles.closeButton} onClick={closeRemarks}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStatus;
