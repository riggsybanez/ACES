import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmailCheck = () => {
  const [email, setEmail] = useState("");
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
  };

  // Handle navigating to student status page
  const handleCheckStatus = () => {
    if (!email) {
      console.log("Please enter an email before checking status.");
      return; // You can add a toast or error message here if the email is empty
    }
    console.log("Checking status for:", email);
    navigate("/student-status"); // Navigate to the student status page
  };

  // Handle navigating back to the home page
  const handleBack = () => {
    console.log("Going back to home");
    navigate("/"); // Navigate to the home page
  };

  return (
    <div style={styles.container}>
      <div style={styles.evaluationBox}>
        <h2>Student Evaluation Status</h2>
        <input
          type="email"
          placeholder="Enter your email"
          style={styles.inputField}
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update the email state
        />
        <div style={styles.buttonContainer}>
          <button style={styles.button} onClick={handleBack}>Back</button>
          <button style={styles.button} onClick={handleCheckStatus}>Check Status</button>
        </div>
      </div>
    </div>
  );
};

export default EmailCheck;
