import React from 'react';
import { useNavigate } from 'react-router-dom';

const EvaluationHistory = () => {
  const navigate = useNavigate();
  const coralColor = 'rgba(255,79,78, 255)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>JOHN SMITH</h1>
          <p style={{ fontSize: '0.8rem' }}>Course Evaluator</p>
        </div>
        <div onClick={() => navigate('/evaluator-dashboard')} className="sidebar-item">🏠 Home</div>
        <div onClick={() => navigate('/course-evaluation')} className="sidebar-item">📅 Course Evaluation</div>
        <div onClick={() => navigate('/history')} className="sidebar-item">📄 Evaluation History</div>
        <button onClick={() => navigate('/login')} className="logout-button">Logout</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2>Evaluation History</h2>

            <h3></h3>

        {/* Dashboard Items */}
       

        
      </div>

      {/* Inline Styles for Sidebar */}
      <style>{`
        .sidebar {
          background-color: white;
          color: black;
          width: 250px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .sidebar h1 {
          font-size: 1.2rem;
          font-weight: bold;
        }
        .sidebar p {
          font-size: 0.8rem;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          color: black;
          font-weight: bold;
        }
        .sidebar-item:hover {
          background-color: #f0f0f0;
        }
        .logout-button {
          background-color: ${coralColor};
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 20px;
        }
        .main-content {
          flex: 1;
          padding: 20px;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .dashboard-header h2 {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .dashboard-header h3 {
          font-size: 0.9rem;
        }
        .dashboard-items {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .dashboard-item {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          text-align: center;
          flex: 1;
        }
        .pending-evaluations {
          background-color: white;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        .pending-evaluations p {
          margin-bottom: 10px;
        }
        .go-to-evaluations-button {
          background-color: ${coralColor};
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default EvaluationHistory;
