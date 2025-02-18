import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <Link to="/" className="logout-button">Log Out</Link>
        </div>

        {/* Navigation Buttons */}
        <div className="nav-buttons">
          <button className="nav-button active" onClick={() => navigate('/evaluation')}>Evaluation</button>
            <button
            className="px-6 py-3 bg-green-500 text-white rounded-lg"
            onClick={() => navigate("/account-management")} 
            >
                Account Management
            </button>
            
          <button className="nav-button" onClick={() => navigate('/create-admin')}>Add Another Admin</button>
          <button className="nav-button" onClick={() => navigate('/evaluate-history')}>Evaluation History</button>
        </div>

        {/* Evaluation Form */}
        <div className="evaluation-section">
          <h2 className="evaluation-title">Evaluation Process</h2>

          <div className="form-group">
            <label>Upload Transcript</label>
            <input type="file" className="file-input"/>
          </div>

          <div className="form-group">
            <label>Assign Email</label>
            <input type="email" className="text-input" value="jdcruz_1234567891011@uic.edu.ph" disabled />
          </div>

          <div className="form-group">
            <label>Student Name</label>
            <input type="text" className="text-input" value="Juan Dela Cruz" disabled />
          </div>

          <button className="extract-button">
            Extract Information <span className="arrow-down">▼</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// ✅ Embedded CSS
const styles = `
  /* General Layout */
  .dashboard-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: cover;
    background-position: center;
    padding: 20px;
  }

  .dashboard-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
    width: 800px;
  }

  /* Header */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .dashboard-title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #d32f2f;
  }

  .logout-button {
    padding: 10px 20px;
    background-color: #fff;
    border: 2px solid #d32f2f;
    color: #d32f2f;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .logout-button:hover {
    background-color: #d32f2f;
    color: white;
  }

  /* Navigation Buttons */
  .nav-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .nav-button {
    padding: 10px 20px;
    border: 2px solid #d32f2f;
    color: #d32f2f;
    font-weight: bold;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .nav-button:hover {
    background-color: #d32f2f;
    color: white;
  }

  .nav-button.active {
    background-color: #d32f2f;
    color: white;
  }

  /* Evaluation Form */
  .evaluation-section {
    margin-top: 20px;
  }

  .evaluation-title {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 15px;
    color: black;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
    color: black;
  }

  .form-group label {
    font-weight: 600;
    margin-bottom: 5px;
  }

  .file-input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .text-input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #f3f4f6;
  }

  .extract-button {
    width: 100%;
    padding: 12px;
    background-color: #d32f2f;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .extract-button:hover {
    background-color: #b71c1c;
  }

  .arrow-down {
    font-size: 12px;
  }

`;

// ✅ Append styles to the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
