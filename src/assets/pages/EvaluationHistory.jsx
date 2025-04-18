import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EvaluationHistory = () => {
  const navigate = useNavigate();
  const coralColor = 'rgba(255,79,78, 255)';
  
  // Sample data for evaluation history
  const [evaluations, setEvaluations] = useState([
    {
      id: 1,
      studentName: "Juan Dela Cruz",
      email: "jdelacruz@example.com",
      course: "BS Computer Science",
      yearLevel: 2,
      evaluationDate: "2023-03-15",
      subjectsCredited: 5,
      totalSubjects: 7,
      remarks: "Missing prerequisites for advanced programming courses"
    },
    {
      id: 2,
      studentName: "Maria Santos",
      email: "msantos@example.com",
      course: "BS Information Technology",
      yearLevel: 3,
      evaluationDate: "2023-03-10",
      subjectsCredited: 8,
      totalSubjects: 10,
      remarks: "Math electives need to be validated with department chair"
    },
    {
      id: 3,
      studentName: "Antonio Reyes",
      email: "areyes@example.com",
      course: "BS Information Systems",
      yearLevel: 1,
      evaluationDate: "2023-03-05",
      subjectsCredited: 4,
      totalSubjects: 5,
      remarks: "All foundation courses credited"
    },
    {
      id: 4,
      studentName: "Elena Gomez",
      email: "egomez@example.com",
      course: "BS Computer Science",
      yearLevel: 4,
      evaluationDate: "2023-02-28",
      subjectsCredited: 11,
      totalSubjects: 12,
      remarks: "Needs one more technical elective"
    },
    {
      id: 5,
      studentName: "Carlos Mendoza",
      email: "cmendoza@example.com",
      course: "BS Information Technology",
      yearLevel: 2,
      evaluationDate: "2023-02-20",
      subjectsCredited: 6,
      totalSubjects: 8,
      remarks: "Physics courses require additional documentation"
    }
  ]);

  // Sorting state
  const [sortField, setSortField] = useState('evaluationDate');
  const [sortDirection, setSortDirection] = useState('desc');

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
      if (field === 'subjectsCredited') {
        return sortDirection === 'asc' 
          ? a[field] - b[field] 
          : b[field] - a[field];
      } else if (field === 'yearLevel') {
        return sortDirection === 'asc' 
          ? a[field] - b[field] 
          : b[field] - a[field];
      } else {
        return sortDirection === 'asc' 
          ? a[field].localeCompare(b[field]) 
          : b[field].localeCompare(a[field]);
      }
    });
    
    setEvaluations(sortedEvaluations);
  };

  // Calculate completion percentage
  const calculateCompletion = (credited, total) => {
    return Math.round((credited / total) * 100);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="sidebar">
  <div className="sidebar-content">
    <div className="sidebar-header">
      <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>JOHN SMITH</h1>
      <p style={{ fontSize: '0.8rem' }}>Course Evaluator</p>
    </div>
    <div onClick={() => navigate('/evaluator-dashboard')} className="sidebar-item">🏠 Home</div>
    <div onClick={() => navigate('/course-evaluation')} className="sidebar-item">📅 Course Evaluation</div>
    <div onClick={() => navigate('/history')} className="sidebar-item active">📄 Evaluation History</div>
    <div onClick={() => navigate('/student-archives')} className="sidebar-item">📚 Student Archives</div>
  </div>
  <div className="logout-container">
    <button onClick={() => navigate('/login')} className="logout-button">Logout</button>
  </div>
</div>

      {/* Main Content */}
      <div className="main-content">
        <h2>Evaluation History</h2>
        
        {/* Sorting controls */}
        <div className="sorting-controls">
          <p>Sort by:</p>
          <button 
            className={`sort-button ${sortField === 'studentName' ? 'active' : ''}`} 
            onClick={() => sortEvaluations('studentName')}
          >
            Name {sortField === 'studentName' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`sort-button ${sortField === 'course' ? 'active' : ''}`} 
            onClick={() => sortEvaluations('course')}
          >
            Course {sortField === 'course' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`sort-button ${sortField === 'yearLevel' ? 'active' : ''}`} 
            onClick={() => sortEvaluations('yearLevel')}
          >
            Year Level {sortField === 'yearLevel' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`sort-button ${sortField === 'evaluationDate' ? 'active' : ''}`} 
            onClick={() => sortEvaluations('evaluationDate')}
          >
            Date {sortField === 'evaluationDate' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`sort-button ${sortField === 'subjectsCredited' ? 'active' : ''}`} 
            onClick={() => sortEvaluations('subjectsCredited')}
          >
            Completion {sortField === 'subjectsCredited' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
        
        {/* Evaluations table */}
        <div className="evaluations-table-container">
          <table className="evaluations-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Year Level</th>
                <th>Evaluation Date</th>
                <th>Credits Progress</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation) => (
                <tr key={evaluation.id}>
                  <td>{evaluation.studentName}</td>
                  <td>{evaluation.email}</td>
                  <td>{evaluation.course}</td>
                  <td>{evaluation.yearLevel}</td>
                  <td>{new Date(evaluation.evaluationDate).toLocaleDateString()}</td>
                  <td>
                    <div className="progress-container">
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${calculateCompletion(evaluation.subjectsCredited, evaluation.totalSubjects)}%`,
                          backgroundColor: calculateCompletion(evaluation.subjectsCredited, evaluation.totalSubjects) > 75 ? '#4caf50' : '#ff9800'
                        }}
                      ></div>
                      <span className="progress-text">
                        {evaluation.subjectsCredited}/{evaluation.totalSubjects} subjects
                      </span>
                    </div>
                  </td>
                  <td className="remarks-cell">{evaluation.remarks}</td>
                  <td>
                    <button 
                      className="view-button"
                      onClick={() => navigate(`/evaluation-detail/${evaluation.id}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        .remarks-cell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .remarks-cell:hover {
          white-space: normal;
          overflow: visible;
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
      `}</style>
    </div>
  );
};

export default EvaluationHistory;