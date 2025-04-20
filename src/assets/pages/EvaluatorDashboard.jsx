import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';
import { db } from '../../firebase/authService';
import { collection, getDocs, query, where } from 'firebase/firestore';

const EvaluatorDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const coralColor = 'rgba(255,79,78, 255)';
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalCompleted: 0,
    programStats: {
      'BSCS': { completed: 0 },
      'BSIT': { completed: 0 },
      'BSIS': { completed: 0 }
    }
  });
  
  // Recent evaluations
  const [recentEvaluations, setRecentEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch stats and recent evaluations from Firestore
  useEffect(() => {
    const fetchEvaluationData = async () => {
      if (!currentUser || !currentUser.displayName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get evaluations by this evaluator from Firestore
        const evaluationsRef = collection(db, "EvaluationHistory");
        const evaluatorQuery = query(
          evaluationsRef, 
          where("EvaluatorName", "==", currentUser.displayName)
        );
        const evaluationsSnapshot = await getDocs(evaluatorQuery);
        
        if (!evaluationsSnapshot.empty) {
          const evaluations = evaluationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert timestamp to date
            EvaluationDate: doc.data().EvaluationDate?.toDate() || new Date()
          }));
          
          // Sort by date (newest first)
          evaluations.sort((a, b) => b.EvaluationDate - a.EvaluationDate);
          
          // Get program stats
          const programCounts = {
            'BSCS': 0,
            'BSIT': 0,
            'BSIS': 0
          };
          
          evaluations.forEach(evaluation => {
            if (programCounts.hasOwnProperty(evaluation.Course)) {
              programCounts[evaluation.Course]++;
            }
          });
          
          // Update dashboard stats
          setDashboardStats({
            totalCompleted: evaluations.length,
            programStats: {
              'BSCS': { completed: programCounts['BSCS'] },
              'BSIT': { completed: programCounts['BSIT'] },
              'BSIS': { completed: programCounts['BSIS'] }
            }
          });
          
          // Set recent evaluations (limited to 5)
          setRecentEvaluations(evaluations.slice(0, 5));
        } else {
          // No evaluations found for this evaluator
          setDashboardStats({
            totalCompleted: 0,
            programStats: {
              'BSCS': { completed: 0 },
              'BSIT': { completed: 0 },
              'BSIS': { completed: 0 }
            }
          });
          setRecentEvaluations([]);
        }
      } catch (error) {
        console.error("Error fetching evaluation data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvaluationData();
  }, [currentUser]);
  
  // Get course name from code
  const getCourseFullName = (code) => {
    switch(code) {
      case 'BSCS': return 'BS Computer Science';
      case 'BSIT': return 'BS Information Technology';
      case 'BSIS': return 'BS Information Systems';
      default: return code;
    }
  };
  
  // Get today's date formatted
  const getTodayFormatted = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date instanceof Date 
      ? date.toLocaleDateString() 
      : new Date(date).toLocaleDateString();
  };
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentUser?.displayName}</h1>
            <p style={{ fontSize: '0.8rem' }}>Course Evaluator</p>
          </div>
          <div onClick={() => navigate('/evaluator-dashboard')} className="sidebar-item active">🏠 Home</div>
          <div onClick={() => navigate('/course-evaluation')} className="sidebar-item">📅 Course Evaluation</div>
          <div onClick={() => navigate('/history')} className="sidebar-item">📄 Evaluation History</div>
          <div onClick={() => navigate('/student-archives')} className="sidebar-item">📚 Student Archives</div>
        </div>
        <div className="logout-container">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <div>
            <h2>Evaluator Dashboard</h2>
            <p className="date-display">{getTodayFormatted()}</p>
          </div>
          <div className="welcome-message">
            <h3>Welcome back, {currentUser?.displayName}!</h3>
            <p>You have completed <span className="highlight-text">{dashboardStats.totalCompleted}</span> evaluations</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="quick-actions-container">
          <h3>Quick Actions</h3>
          <div className="quick-action-buttons">
            <button 
              className="quick-action-button"
              onClick={() => navigate('/course-evaluation')}
            >
              <span className="quick-action-icon">📝</span>
              New Evaluation
            </button>
            
            <button 
              className="quick-action-button"
              onClick={() => navigate('/student-archives')}
            >
              <span className="quick-action-icon">🔍</span>
              Search Archives
            </button>
            
            <button 
              className="quick-action-button"
              onClick={() => navigate('/history')}
            >
              <span className="quick-action-icon">📊</span>
              View Reports
            </button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card total-completed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h4>Your Completed Evaluations</h4>
              <p className="stat-number">{dashboardStats.totalCompleted}</p>
              <p className="stat-description">Successfully evaluated by you</p>
            </div>
          </div>
        </div>
        
        {/* Program Stats - Simplified */}
        <div className="program-stats-container">
          <h3>Your Program Statistics</h3>
          <div className="simplified-program-stats">
            {Object.entries(dashboardStats.programStats).map(([program, stats]) => (
              <div key={program} className={`stat-card program-stat-card ${program.toLowerCase()}`}>
                <div className="program-stat-header">
                  <h4>{getCourseFullName(program)}</h4>
                  <div className="program-code">{program}</div>
                </div>
                <div className="program-stat-numbers">
                  <div className="program-stat-item">
                    <span className="stat-number highlight-completed">{stats.completed}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Evaluations */}
        <div className="recent-evaluations-container">
          <div className="recent-header">
            <h3>Your Recent Evaluations</h3>
          </div>
          
          <div className="evaluations-table-container">
            {loading ? (
              <div className="loading-message">Loading your recent evaluations...</div>
            ) : recentEvaluations.length > 0 ? (
              <table className="evaluations-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Year Level</th>
                    <th>Evaluation Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvaluations.map((evaluation) => (
                    <tr key={evaluation.id}>
                      <td>{evaluation.StudentName || 'N/A'}</td>
                      <td>{evaluation.Email || 'N/A'}</td>
                      <td>{evaluation.Course || 'N/A'}</td>
                      <td>Year {evaluation.YearLevel || 'N/A'}</td>
                      <td>{formatDate(evaluation.EvaluationDate)}</td>
                      <td>
                        <button 
                          className="view-button"
                          onClick={() => navigate(`/student-archives?email=${encodeURIComponent(evaluation.Email)}&fromEvaluation=true`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">You haven't completed any evaluations yet.</div>
            )}
          </div>
          
          <div className="view-all-container">
            <button 
              className="view-all-button"
              onClick={() => navigate('/history')}
            >
              View All Evaluations
            </button>
          </div>
        </div>
      </div>

      {/* Inline Styles - unchanged */}
      <style>{`
        .sidebar {
          background-color: white;
          color: black;
          width: 250px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sidebar-content {
          padding: 20px;
          flex-grow: 1;
        }
        .sidebar-header {
          margin-bottom: 20px;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 5px;
          transition: background-color 0.3s;
        }
        .sidebar-item:hover {
          background-color: #f0f0f0;
        }
        .sidebar-item.active {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .logout-container {
          padding: 20px;
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .logout-button {
          background-color: ${coralColor};
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          width: 100%;
          transition: opacity 0.3s;
        }
        .logout-button:hover {
          opacity: 0.9;
        }
        .main-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background-color: #f9f9f9;
        }
        
        /* Dashboard Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        .date-display {
          color: #666;
          font-size: 0.9rem;
          margin-top: 5px;
        }
        .welcome-message {
          text-align: right;
        }
        .welcome-message h3 {
          margin-bottom: 5px;
        }
        .highlight-text {
          color: ${coralColor};
          font-weight: bold;
        }
        
        /* Quick Actions */
        .quick-actions-container {
          margin-bottom: 30px;
        }
        .quick-actions-container h3 {
          margin-bottom: 15px;
        }
        .quick-action-buttons {
          display: flex;
          gap: 20px;
          justify-content: space-between;
        }
        .quick-action-button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: white;
          border: 1px solid #eee;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          color: #333;
          font-weight: 500;
          text-align: center;
        }
        .quick-action-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          border-color: ${coralColor};
        }
        .quick-action-icon {
          font-size: 2rem;
          margin-bottom: 10px;
          display: block;
        }
        
        /* Stats Overview */
        .stats-overview {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          max-width: 500px;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-icon {
          font-size: 2rem;
          margin-right: 20px;
          padding: 15px;
          border-radius: 10px;
          background-color: #f0f0f0;
        }
        .total-completed .stat-icon {
          background-color: rgba(76, 175, 80, 0.1);
        }
        .stat-content {
          flex: 1;
        }
        .stat-content h4 {
          margin: 0 0 10px 0;
          color: #555;
        }
        .stat-number {
          font-size: 1.8rem;
          font-weight: bold;
          margin: 0;
          color: #333;
        }
        .stat-description {
          color: #777;
          margin: 5px 0 0 0;
          font-size: 0.9rem;
        }
        
        /* Simplified Program Stats */
        .program-stats-container {
          margin-bottom: 30px;
        }
        .program-stats-container h3 {
          margin-bottom: 15px;
        }
        .simplified-program-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .program-stat-card {
          display: block;
          text-align: left;
          border-left: 5px solid #ddd;
        }
        .program-stat-card.bscs {
          border-left-color: #ff4f4e; /* Coral color for BSCS */
        }
        .program-stat-card.bsit {
          border-left-color: #4caf50; /* Green for BSIT */
        }
        .program-stat-card.bsis {
          border-left-color: #2196f3; /* Blue for BSIS */
        }
        .program-stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .program-stat-header h4 {
          margin: 0;
          font-size: 1.1rem;
        }
        .program-code {
          background-color: #f0f0f0;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .program-stat-numbers {
          display: flex;
          justify-content: center;
        }
        .program-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .program-stat-item .stat-number {
          font-size: 1.5rem;
          margin-bottom: 5px;
        }
        .program-stat-item .stat-label {
          font-size: 0.8rem;
          color: #666;
        }
        .highlight-completed {
          color: #4caf50;
        }
        
        /* Recent Evaluations */
        .recent-evaluations-container {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .recent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .evaluations-table-container {
          overflow-x: auto;
          margin-bottom: 20px;
        }
        .evaluations-table {
          width: 100%;
          border-collapse: collapse;
        }
        .evaluations-table th, .evaluations-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .evaluations-table th {
          background-color: #f9f9f9;
          font-weight: bold;
          color: #555;
        }
        .evaluations-table tr:hover {
          background-color: #f5f5f5;
        }
        .view-button {
          background-color: ${coralColor};
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: opacity 0.3s;
        }
        .view-button:hover {
          opacity: 0.9;
        }
        .no-data {
          text-align: center;
          padding: 30px !important;
          color: #777;
        }
        .loading-message {
          text-align: center;
          padding: 30px;
          color: #777;
        }
        .view-all-container {
          display: flex;
          justify-content: center;
        }
        .view-all-button {
          background-color: white;
          color: ${coralColor};
          border: 1px solid ${coralColor};
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
        }
        .view-all-button:hover {
          background-color: ${coralColor};
          color: white;
        }
        
        /* Responsive styles */
        @media (max-width: 1200px) {
          .simplified-program-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .quick-action-buttons {
            flex-wrap: wrap;
          }
          .quick-action-button {
            flex: 1 1 calc(50% - 15px);
            min-width: 200px;
          }
        }
        
        @media (max-width: 992px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .welcome-message {
            text-align: left;
            margin-top: 15px;
          }
          .recent-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        
        @media (max-width: 768px) {
          .sidebar {
            width: 200px;
          }
          .simplified-program-stats {
            grid-template-columns: 1fr;
          }
          .quick-action-buttons {
            flex-direction: column;
          }
          .quick-action-button {
            width: 100%;
          }
        }
        
        @media (max-width: 576px) {
          .sidebar {
            width: 60px;
            overflow: hidden;
          }
          .sidebar-item {
            justify-content: center;
            padding: 15px 0;
          }
          .sidebar-item span {
            display: none;
          }
          .sidebar-header {
            display: none;
          }
          .main-content {
            padding: 15px;
          }
          .evaluations-table th, .evaluations-table td {
            padding: 8px 10px;
            font-size: 0.85rem;
          }
        }
        
        /* Animations and transitions */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .quick-actions-container, .stats-overview, .program-stats-container, .recent-evaluations-container {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .stats-overview {
          animation-delay: 0.1s;
        }
        
        .program-stats-container {
          animation-delay: 0.2s;
        }
        
        .recent-evaluations-container {
          animation-delay: 0.3s;
        }
        
        /* Accessibility enhancements */
        .search-input:focus, 
        .view-button:focus,
        .view-all-button:focus,
        .quick-action-button:focus {
          outline: 2px solid ${coralColor};
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default EvaluatorDashboard;