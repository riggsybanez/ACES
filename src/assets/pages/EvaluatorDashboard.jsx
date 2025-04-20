import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';


const EvaluatorDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const coralColor = 'rgba(255,79,78, 255)';
  
  // Sample data for the dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalPending: 42,
    totalCompleted: 128,
    recentEvaluations: 18,
    programStats: {
      'BSCS': { total: 18, pending: 7, completed: 11 },
      'BSIT': { total: 34, pending: 21, completed: 13 },
      'BSIS': { total: 14, pending: 14, completed: 0 }
    }
  });
  
  // Sample pending evaluations data
  const [pendingEvaluations, setPendingEvaluations] = useState([
    { id: 'S-2023-001', name: 'Maria Santos', course: 'BSCS', yearLevel: 2, type: 'Regular', requestDate: '2023-09-15' },
    { id: 'S-2023-012', name: 'Juan Cruz', course: 'BSIT', yearLevel: 3, type: 'Irregular', requestDate: '2023-09-16' },
    { id: 'S-2023-018', name: 'Ana Reyes', course: 'BSIS', yearLevel: 1, type: 'Regular', requestDate: '2023-09-17' },
    { id: 'S-2023-024', name: 'Pedro Lim', course: 'BSCS', yearLevel: 4, type: 'Irregular', requestDate: '2023-09-18' },
    { id: 'S-2023-031', name: 'Sofia Garcia', course: 'BSIT', yearLevel: 2, type: 'Regular', requestDate: '2023-09-19' }
  ]);
  
  // Filter state for pending evaluations
  const [courseFilter, setCourseFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get filtered evaluations based on course and search term
  const getFilteredEvaluations = () => {
    return pendingEvaluations.filter(evaluation => {
      const matchesCourse = courseFilter ? evaluation.course === courseFilter : true;
      const matchesSearch = searchTerm ? 
        evaluation.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        evaluation.id.toLowerCase().includes(searchTerm.toLowerCase()) : 
        true;
      return matchesCourse && matchesSearch;
    });
  };
  
  // Handle evaluation action
  const handleEvaluate = (studentId) => {
    // In a real app, this would navigate to the evaluation page with the student ID
    navigate(`/course-evaluation?studentId=${studentId}`);
  };
  
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
            <p>You have <span className="highlight-text">{dashboardStats.totalPending}</span> pending evaluations</p>
          </div>
        </div>
        
        {/* Quick Actions - Moved above Stats Overview */}
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
          <div className="stat-card total-pending">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h4>Pending Evaluations</h4>
              <p className="stat-number">{dashboardStats.totalPending}</p>
              <p className="stat-description">Awaiting your review</p>
            </div>
          </div>
          
          <div className="stat-card total-completed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h4>Completed</h4>
              <p className="stat-number">{dashboardStats.totalCompleted}</p>
              <p className="stat-description">Successfully evaluated</p>
            </div>
          </div>
          
          <div className="stat-card recent">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <h4>Recent Activity</h4>
              <p className="stat-number">{dashboardStats.recentEvaluations}</p>
              <p className="stat-description">In the last 7 days</p>
            </div>
          </div>
        </div>
        
        {/* Program Stats - Simplified */}
        <div className="program-stats-container">
          <h3>Program Statistics</h3>
          <div className="simplified-program-stats">
            {Object.entries(dashboardStats.programStats).map(([program, stats]) => (
              <div key={program} className={`stat-card program-stat-card ${program.toLowerCase()}`}>
                <div className="program-stat-header">
                  <h4>{getCourseFullName(program)}</h4>
                  <div className="program-code">{program}</div>
                </div>
                <div className="program-stat-numbers">
                  <div className="program-stat-item">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="program-stat-item">
                    <span className="stat-number highlight-pending">{stats.pending}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                  <div className="program-stat-item">
                    <span className="stat-number highlight-completed">{stats.completed}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pending Evaluations */}
        <div className="pending-evaluations-container">
          <div className="pending-header">
            <h3>Pending Evaluations</h3>
            <div className="pending-controls">
              <div className="search-container">
                <input 
                  type="text" 
                  placeholder="Search by name or ID" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              
              <div className="filter-container">
                <select 
                  value={courseFilter} 
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="course-filter"
                >
                  <option value="">All Programs</option>
                  <option value="BSCS">BS Computer Science</option>
                  <option value="BSIT">BS Information Technology</option>
                  <option value="BSIS">BS Information Systems</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="evaluations-table-container">
            <table className="evaluations-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Program</th>
                  <th>Year Level</th>
                  <th>Type</th>
                  <th>Request Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredEvaluations().length > 0 ? (
                  getFilteredEvaluations().map((evaluation) => (
                    <tr key={evaluation.id}>
                      <td>{evaluation.id}</td>
                      <td>{evaluation.name}</td>
                      <td>{evaluation.course}</td>
                      <td>Year {evaluation.yearLevel}</td>
                      <td>{evaluation.type}</td>
                      <td>{evaluation.requestDate}</td>
                      <td>
                        <button 
                          className="evaluate-button"
                          onClick={() => handleEvaluate(evaluation.id)}
                        >
                          Evaluate
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {courseFilter || searchTerm ? 
                        "No evaluations match your filter criteria." : 
                        "No pending evaluations at this time."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="view-all-container">
            <button 
              className="view-all-button"
              onClick={() => navigate('/course-evaluation')}
            >
              View All Evaluations
            </button>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
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
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
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
        .total-pending .stat-icon {
          background-color: rgba(255,79,78, 0.1);
        }
        .total-completed .stat-icon {
          background-color: rgba(76, 175, 80, 0.1);
        }
        .recent .stat-icon {
          background-color: rgba(33, 150, 243, 0.1);
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
          justify-content: space-between;
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
        .highlight-pending {
          color: ${coralColor};
        }
        .highlight-completed {
          color: #4caf50;
        }
        
        /* Pending Evaluations */
        .pending-evaluations-container {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .pending-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .pending-controls {
          display: flex;
          gap: 15px;
        }
        .search-container {
          position: relative;
        }
        .search-input {
          padding: 10px 15px 10px 35px;
          border-radius: 5px;
          border: 1px solid #ddd;
          width: 250px;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #777;
        }
        .course-filter {
          padding: 10px 15px;
          border-radius: 5px;
          border: 1px solid #ddd;
          background-color: white;
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
        .evaluate-button {
          background-color: ${coralColor};
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: opacity 0.3s;
        }
        .evaluate-button:hover {
          opacity: 0.9;
        }
        .no-data {
          text-align: center;
          padding: 30px !important;
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
          .stats-overview, .simplified-program-stats {
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
          .pending-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .pending-controls {
            margin-top: 15px;
            width: 100%;
          }
          .search-input {
            width: 100%;
          }
        }
        
        @media (max-width: 768px) {
          .sidebar {
            width: 200px;
          }
          .stats-overview, .simplified-program-stats {
            grid-template-columns: 1fr;
          }
          .pending-controls {
            flex-direction: column;
            gap: 10px;
          }
          .search-container, .course-filter {
            width: 100%;
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
        
        .quick-actions-container, .stats-overview, .program-stats-container, .pending-evaluations-container {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .stats-overview {
          animation-delay: 0.1s;
        }
        
        .program-stats-container {
          animation-delay: 0.2s;
        }
        
        .pending-evaluations-container {
          animation-delay: 0.3s;
        }
        
        /* Accessibility enhancements */
        .search-input:focus, 
        .course-filter:focus,
        .evaluate-button:focus,
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