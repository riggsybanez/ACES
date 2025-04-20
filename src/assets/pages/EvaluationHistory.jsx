import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';
import { db } from '../../firebase/authService';
import { collection, getDocs } from 'firebase/firestore';

const EvaluationHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const coralColor = 'rgba(255,79,78, 255)';
  
  // State for storing evaluations from Firestore
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting state
  const [sortField, setSortField] = useState('EvaluationDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Fetch evaluations from Firestore
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const evaluationsRef = collection(db, "EvaluationHistory");
        const evaluationsSnapshot = await getDocs(evaluationsRef);
        
        const evaluationsData = evaluationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to JS Date
          EvaluationDate: doc.data().EvaluationDate?.toDate() || new Date()
        }));
        
        setEvaluations(evaluationsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching evaluations:", err);
        setError("Failed to load evaluation history");
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  // Sort function
  const sortEvaluations = (field) => {
    if (sortField === field) {
      // Toggle direction if same field is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    
    // Sort the evaluations
    const sortedEvaluations = [...evaluations].sort((a, b) => {
      if (field === 'YearLevel') {
        return sortDirection === 'asc' 
          ? a[field] - b[field] 
          : b[field] - a[field];
      } else if (field === 'EvaluationDate') {
        // Handle date sorting
        const dateA = a[field] instanceof Date ? a[field] : new Date(a[field]);
        const dateB = b[field] instanceof Date ? b[field] : new Date(b[field]);
        return sortDirection === 'asc' 
          ? dateA - dateB 
          : dateB - dateA;
      } else {
        // Handle string fields
        const valA = a[field] || '';
        const valB = b[field] || '';
        return sortDirection === 'asc' 
          ? valA.toString().localeCompare(valB.toString()) 
          : valB.toString().localeCompare(valA.toString());
      }
    });
    
    setEvaluations(sortedEvaluations);
  };

  // Calculate completion percentage
  const calculateCompletion = (courses) => {
    if (!courses || !Array.isArray(courses)) return { passed: 0, total: 0, percentage: 0 };
    
    const total = courses.length;
    const passed = courses.filter(course => course.Passed).length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    return { passed, total, percentage };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar - unchanged */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentUser.displayName}</h1>
            <p style={{ fontSize: '0.8rem' }}>Course Evaluator</p>
          </div>
          <div onClick={() => navigate('/evaluator-dashboard')} className="sidebar-item">🏠 Home</div>
          <div onClick={() => navigate('/course-evaluation')} className="sidebar-item">📅 Course Evaluation</div>
          <div onClick={() => navigate('/history')} className="sidebar-item active">📄 Evaluation History</div>
          <div onClick={() => navigate('/student-archives')} className="sidebar-item">📚 Student Archives</div>
        </div>
        <div className="logout-container">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content - modified to use Firestore data */}
      <div className="main-content">
        <h2>Evaluation History</h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading evaluation history...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Sorting controls */}
            <div className="sorting-controls">
              <p>Sort by:</p>
              <button 
                className={`sort-button ${sortField === 'StudentName' ? 'active' : ''}`} 
                onClick={() => sortEvaluations('StudentName')}
              >
                Name {sortField === 'StudentName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-button ${sortField === 'Course' ? 'active' : ''}`} 
                onClick={() => sortEvaluations('Course')}
              >
                Course {sortField === 'Course' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-button ${sortField === 'YearLevel' ? 'active' : ''}`} 
                onClick={() => sortEvaluations('YearLevel')}
              >
                Year Level {sortField === 'YearLevel' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-button ${sortField === 'EvaluationDate' ? 'active' : ''}`} 
                onClick={() => sortEvaluations('EvaluationDate')}
              >
                Date {sortField === 'EvaluationDate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-button ${sortField === 'EvaluatorName' ? 'active' : ''}`} 
                onClick={() => sortEvaluations('EvaluatorName')}
              >
                Evaluator {sortField === 'EvaluatorName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
            </div>
            
            {/* Evaluations table */}
            <div className="evaluations-table-container">
              {evaluations.length === 0 ? (
                <div className="no-data-message">
                  <p>No evaluation records found</p>
                </div>
              ) : (
                <table className="evaluations-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Year Level</th>
                      <th>Evaluation Date</th>
                      <th>Evaluator</th>
                      <th>Credits Progress</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((evaluation) => {
                      const progress = calculateCompletion(evaluation.Courses);
                      return (
                        <tr key={evaluation.id}>
                          <td>{evaluation.StudentName || 'N/A'}</td>
                          <td>{evaluation.Email || 'N/A'}</td>
                          <td>{evaluation.Course || 'N/A'}</td>
                          <td>{evaluation.YearLevel || 'N/A'}</td>
                          <td>
                            {evaluation.EvaluationDate instanceof Date 
                              ? evaluation.EvaluationDate.toLocaleDateString() 
                              : 'N/A'}
                          </td>
                          <td>{evaluation.EvaluatorName || 'N/A'}</td>
                          <td>
                            <div className="progress-container">
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${progress.percentage}%`,
                                  backgroundColor: progress.percentage > 75 ? '#4caf50' : '#ff9800'
                                }}
                              ></div>
                              <span className="progress-text">
                                {progress.passed}/{progress.total} courses
                              </span>
                            </div>
                          </td>
                          <td>
                            <button 
                              className="view-button"
                              onClick={() => {
                                // Navigate to StudentArchives with the student's email as a query parameter
                                navigate(`/student-archives?email=${encodeURIComponent(evaluation.Email)}&fromEvaluation=true`);
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
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
          background-color: #f0f0f0; /* sidebar darken - this is actually a light gray */
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
        }
        .sorting-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .sort-button {
          background-color: #f0f0f0;
          color: #333;
          border: 1px solid #ddd;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .sort-button:hover {
          background-color: #e0e0e0;
        }
        .sort-button.active {
          background-color: ${coralColor};
          color: white;
          border-color: ${coralColor};
        }
        .evaluations-table-container {
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .evaluations-table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
        }
        .evaluations-table th,
        .evaluations-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .evaluations-table th {
          background-color: #f9f9f9;
          font-weight: bold;
          position: sticky;
          top: 0;
        }
        .evaluations-table tr:hover {
          background-color: #f5f5f5;
        }
        .progress-container {
          width: 100%;
          background-color: #f1f1f1;
          border-radius: 4px;
          position: relative;
          height: 20px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #333;
          font-size: 0.8rem;
          white-space: nowrap;
        }
        .view-button {
          background-color: ${coralColor};
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: opacity 0.3s;
        }
        .view-button:hover {
          opacity: 0.9;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid ${coralColor};
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 2s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
          margin: 20px 0;
        }
        .retry-button {
          background-color: #c62828;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          margin-top: 10px;
          cursor: pointer;
        }
        .no-data-message {
          text-align: center;
          padding: 40px;
          color: #757575;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default EvaluationHistory;