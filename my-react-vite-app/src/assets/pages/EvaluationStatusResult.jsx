import { useNavigate } from "react-router-dom";

export default function EvaluationStatusResult() {
  const navigate = useNavigate();

  // Dummy data for user evaluation status
  const evaluationData = {
    student: "Juan Dela Cruz",
    program: "Computer Science",
    dateTime: "2023-05-15 14:30",
    status: "Under Evaluation",
  };

  return (
    <div className="check-status-container">
      <div className="status-box">
        <div className="status-header">Check Evaluation Status</div>

        <div className="status-content">
          <p><b>Student:</b> {evaluationData.student}</p>
          <p><b>Program:</b> {evaluationData.program}</p>
          <p><b>Date/Time:</b> {evaluationData.dateTime}</p>
          <p><b>Current Status:</b></p>

          <div className="status-result">{evaluationData.status}</div>

          <div className="button-group">
            <button className="back-button" onClick={() => navigate("/")}>
              Back
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
    background: #f44336;
  }
  
  .status-box {
    background: white;
    border-radius: 10px;
    text-align: center;
    width: 400px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    padding-bottom: 20px;
  }
  
  .status-header {
    background: #f44336;
    padding: 15px;
    color: white;
    font-size: 1.6rem;
    font-weight: bold;
  }
  
  .status-content {
    padding: 20px;
  }
  
  .button-group {
    display: flex;
    justify-content: center;
    margin-top: 15px;
  }
  
  .back-button {
    background: white;
    color: black;
    border: 2px solid #d32f2f;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    padding: 10px 20px;
    width: 50%;
  }
  
  .status-result {
    font-size: 1.5rem;
    font-weight: bold;
    color: black;

    padding: 10px;
    margin-top: 10px;
    display: inline-block;
  }
`;
  
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);