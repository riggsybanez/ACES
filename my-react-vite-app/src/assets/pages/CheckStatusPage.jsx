import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CheckStatusPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); // State for error message
  const navigate = useNavigate();

  // Email validation function using regex
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleCheckStatus = () => {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // If email is valid, proceed to the next page
    setError(""); // Clear error
    navigate("/evaluation-status");
  };

  return (
    <div className="check-status-container">
      <div className="status-box">
        <div className="status-header">
          Check Evaluation Status
          <div className="status-text">
            Login your <b>email</b> to proceed on the Course Evaluation System.
          </div>
        </div>

        <div className="status-content">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(""); // Clear error message while typing
            }}
          />
          
          {error && <p className="error-message">{error}</p>} {/* Show error message */}

          <div className="button-group">
            <button className="back-button" onClick={() => navigate("/")}>
              Back
            </button>
            <button className="primary-button" onClick={handleCheckStatus}>
              Check Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `

.check-status-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f44336; /* 🔴 Full background is red */
}

.status-box {
  background: white; /* White box for content */
  padding-bottom: 25px;
  border-radius: 10px;
  text-align: center;
  width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden; /* Prevents padding issues */

  /* Centering Fix */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 🔴 Red Top Padding */
.status-header {
  background: #f44336;
  padding: 10 px; /* Adjust height of red padding */
  color: white;
  font-size: 1.6rem;
  font-weight: bold;
}

.status-text{
  color: white;
  font-size: 1rem;
}

/* Text section */
.status-content {
  padding: 15px 25px 0; /* Space inside the white box */
  color: black;
}

.status-box p {
  color: black;
  font-size: 1rem;
  margin-bottom: 12px;
  line-height: 1.4;
}

/* Input */
.status-box input {
  width: 90%;
  padding: 10px;
  border-radius: 6px;
  border: 2px solid #d32f2f;
  font-size: 1rem;
  text-align: center;
  background: white;
  font-weight: bold;
  outline: none;
  margin-bottom: 10px;
  color: black;
}

/* Buttons */
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10 20px;
}

.back-button,
.primary-button {
  width: 45%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.back-button {
  background: white;
  color: black;
  border: 2px solid #d32f2f;
}

.primary-button {
  background: #d32f2f;
  color: white;
}

.error-message {
  color: red;
  font-size: 0.9rem;
  margin-top: 5px;
}

`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
