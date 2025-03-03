import { useState } from "react";

export default function EvaluationHistoryTab() {
  const [activeTab, setActiveTab] = useState("my-evaluations");
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const myEvaluations = [
    { id: 1, studentName: "John Doe", program: "Computer Science", dateTime: "2023-05-15 14:30" },
    { id: 2, studentName: "Jane Smith", program: "Electrical Engineering", dateTime: "2023-05-14 10:15" },
  ];

  const allEvaluations = [
    ...myEvaluations,
    { id: 3, studentName: "Alice Johnson", program: "Mechanical Engineering", dateTime: "2023-05-13 09:45" },
    { id: 4, studentName: "Bob Williams", program: "Civil Engineering", dateTime: "2023-05-12 16:20" },
  ];

  const handleReview = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedEvaluation(null);
  };

  const renderEvaluationTable = (evaluations) => (
    <table className="evaluation-table">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Program</th>
          <th>Date/Time</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {evaluations.map((evaluation) => (
          <tr key={evaluation.id}>
            <td>{evaluation.studentName}</td>
            <td>{evaluation.program}</td>
            <td>{evaluation.dateTime}</td>
            <td>
              <button className="review-button" onClick={() => handleReview(evaluation)}>Review</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="evaluation-history-container">
      <h3 className="evaluation-title">Evaluation History</h3>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "my-evaluations" ? "active" : ""}`}
          onClick={() => setActiveTab("my-evaluations")}
        >
          My Evaluations
        </button>
        <button
          className={`tab-button ${activeTab === "all-evaluations" ? "active" : ""}`}
          onClick={() => setActiveTab("all-evaluations")}
        >
          All Evaluations
        </button>
      </div>

      {/* Evaluation Tables */}
      {activeTab === "my-evaluations" && renderEvaluationTable(myEvaluations)}
      {activeTab === "all-evaluations" && renderEvaluationTable(allEvaluations)}

      {/* Modal Dialog */}
      {showDialog && selectedEvaluation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className = "modal-container"> 
            <h2>Evaluation Details</h2>
            <p><strong>Student:</strong> {selectedEvaluation.studentName}</p>
            <p><strong>Program:</strong> {selectedEvaluation.program}</p>
            <p><strong>Date/Time:</strong> {selectedEvaluation.dateTime}</p>
            <button className="close-button" onClick={closeDialog}>Close</button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Embedded CSS for Admin Dashboard Style
const styles = `

  .evaluation-table td{
  color: black;
  }

  .evaluation-title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #d32f2f;
    margin-top: 2px;
  }

  .tab-navigation {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .tab-button {
    padding: 10px 20px;
    border: 2px solid #d32f2f;
    color: #d32f2f;
    font-weight: bold;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tab-button:hover, .tab-button.active {
    background-color: #d32f2f;
    color: white;
  }

  .evaluation-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  .evaluation-table th, .evaluation-table td {
    border: 1px solid #ccc;
    padding: 10px;
    text-align: center;
  }

  .evaluation-table th {
    background-color: #d32f2f;
    color: white;
  }

  .review-button {
    padding: 6px 12px;
    background-color: #d32f2f;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .review-button:hover {
    background-color: #b71c1c;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 400px;
    text-align: center;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  }

  .modal-container{
  color: black;
  }

  .close-button {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: gray;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .close-button:hover {
    background-color: darkgray;
  }

`;

// ✅ Append styles to the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
