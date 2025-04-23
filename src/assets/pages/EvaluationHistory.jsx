import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';
import { db } from '../../firebase/authService';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

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
  
  // Modal state for student details
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
  
  // Function to view student details
  const viewStudentDetails = async (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setStudentSubjects([]);
    
    try {
      // Find the student in the Students collection
      const studentsRef = collection(db, 'Students');
      const q = query(studentsRef, where('Email', '==', evaluation.Email));
      const studentSnapshot = await getDocs(q);
      
      if (studentSnapshot.empty) {
        console.log('No student found with this email');
        setLoadingDetails(false);
        return;
      }
      
      const studentDoc = studentSnapshot.docs[0];
      const studentId = studentDoc.id;
      const studentData = studentDoc.data();
      
      // Fetch the student's prospectus
      let allSubjects = [];
      const courseCode = evaluation.Course;
      
      // Get all years for this course
      const years = ["Year1", "Year2", "Year3", "Year4"];
      
      for (const yearName of years) {
        const yearNumber = parseInt(yearName.replace('Year', ''));
        
        // Get all semesters for this year
        const semestersRef = collection(db, 'Students', studentId, 'Prospectus', courseCode, yearName);
        const semestersSnapshot = await getDocs(semestersRef);
        
        if (semestersSnapshot.empty) continue;
        
        // Process each semester
        for (const semesterDoc of semestersSnapshot.docs) {
          const semesterName = semesterDoc.id;
          let semesterNumber;
          
          if (semesterName === 'FirstSem') semesterNumber = 1;
          else if (semesterName === 'SecondSem') semesterNumber = 2;
          else if (semesterName === 'Summer') semesterNumber = 3;
          else continue; // Skip if not a valid semester
          
          // Get subjects collection for this semester
          const subjectsRef = collection(
            db, 
            'Students', 
            studentId, 
            'Prospectus', 
            courseCode,
            yearName, 
            semesterName,
            'Subjects'
          );
          
          const subjectsSnapshot = await getDocs(subjectsRef);
          
          // Process each subject
          subjectsSnapshot.docs.forEach(subjectDoc => {
            const subjectData = subjectDoc.data();
            
            allSubjects.push({
              year: yearNumber,
              semester: semesterNumber,
              code: subjectDoc.id,
              description: subjectData.CourseDescription || '',
              units: subjectData.UnitsTotal || 0,
              passed: subjectData.Passed || false
            });
          });
        }
      }
      
      // Sort subjects
      allSubjects.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.semester !== b.semester) return a.semester - b.semester;
        return a.code.localeCompare(b.code);
      });
      
      setStudentSubjects(allSubjects);
    } catch (err) {
      console.error("Error fetching student details:", err);
    } finally {
      setLoadingDetails(false);
    }
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

      {/* Main Content */}
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
                              onClick={() => viewStudentDetails(evaluation)}
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
        
        {/* Student Details Modal */}
        {showDetailsModal && selectedEvaluation && (
          <div className="details-modal-overlay">
            <div className="details-modal">
              <div className="details-modal-header">
                <h3>Student Course Details</h3>
                <button 
                  className="close-modal-button"
                  onClick={() => setShowDetailsModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="student-summary">
                <div className="student-info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{selectedEvaluation.StudentName}</span>
                </div>
                <div className="student-info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedEvaluation.Email}</span>
                </div>
                <div className="student-info-item">
                  <span className="info-label">Course:</span>
                  <span className="info-value">{selectedEvaluation.Course}</span>
                </div>
                <div className="student-info-item">
                  <span className="info-label">Year Level:</span>
                  <span className="info-value">{selectedEvaluation.YearLevel}</span>
                </div>
                <div className="student-info-item">
                  <span className="info-label">Evaluation Date:</span>
                  <span className="info-value">
                    {selectedEvaluation.EvaluationDate instanceof Date 
                      ? selectedEvaluation.EvaluationDate.toLocaleDateString() 
                      : 'N/A'}
                  </span>
                </div>
                <div className="student-info-item">
                  <span className="info-label">Evaluator:</span>
                  <span className="info-value">{selectedEvaluation.EvaluatorName}</span>
                </div>
              </div>
              
              <div className="details-modal-content">
                {loadingDetails ? (
                  <div className="loading-details">
                    <div className="loading-spinner-small"></div>
                    <p>Loading course details...</p>
                  </div>
                ) : studentSubjects.length === 0 ? (
                  <div className="no-subjects-message">
                    No course details available for this student.
                  </div>
                ) : (
                  <div className="subjects-container">
                    {[1, 2, 3, 4].map(year => {
                      const yearSubjects = studentSubjects.filter(subject => subject.year === year);
                      if (yearSubjects.length === 0) return null;
                      
                      return (
                        <div key={year} className="academic-year">
                          <h4>Year {year}</h4>
                          
                          {[1, 2, 3].map(semester => {
                            const semesterSubjects = yearSubjects.filter(
                              subject => subject.semester === semester
                            );
                            
                            if (semesterSubjects.length === 0) return null;
                            
                            return (
                              <div key={`${year}-${semester}`} className="semester-block">
                                <h5>
                                  {semester === 1 ? 'First Semester' : 
                                   semester === 2 ? 'Second Semester' : 'Summer'}
                                </h5>
                                
                                <table className="subjects-table">
                                  <thead>
                                    <tr>
                                      <th>Code</th>
                                      <th>Description</th>
                                      <th>Units</th>
                                      <th>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {semesterSubjects.map((subject) => (
                                      <tr key={subject.code} className={subject.passed ? 'passed-subject' : ''}>
                                        <td>{subject.code}</td>
                                        <td>{subject.description}</td>
                                        <td>{subject.units}</td>
                                        <td>
                                          <span className={`status-badge ${subject.passed ? 'passed' : 'not-passed'}`}>
                                            {subject.passed ? 'Passed' : 'Not Passed'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="details-modal-footer">
                <div className="summary-stats">
                  <div className="stat-box">
                    <span className="stat-label">Total Subjects</span>
                    <span className="stat-value">{studentSubjects.length}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Passed</span>
                    <span className="stat-value">{studentSubjects.filter(s => s.passed).length}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Not Passed</span>
                    <span className="stat-value">{studentSubjects.filter(s => !s.passed).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
        
        /* Modal Styles */
        .details-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .details-modal {
          background-color: white;
          border-radius: 8px;
          width: 80%;
          max-width: 900px;
          max-height: 80vh;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
        }
        
        .details-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
        }
        
        .details-modal-header h3 {
          margin: 0;
          color: #333;
        }
        
        .close-modal-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          transition: color 0.2s;
        }
        
        .close-modal-button:hover {
          color: #000;
        }
        
        .student-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          padding: 15px 20px;
          background-color: #f9f9f9;
        }
        
        .student-info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-weight: 500;
        }
        
        .details-modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px;
          max-height: 50vh;
        }
        
        .loading-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        
        .loading-spinner-small {
          border: 3px solid #f3f3f3;
          border-top: 3px solid ${coralColor};
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 2s linear infinite;
          margin-bottom: 15px;
        }
        
        .no-subjects-message {
          text-align: center;
          padding: 30px;
          color: #666;
          font-style: italic;
        }
        
        .subjects-container {
          padding: 15px 0;
        }
        
        .academic-year {
          margin-bottom: 25px;
        }
        
        .academic-year h4 {
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
          color: #333;
        }
        
        .semester-block {
          margin-bottom: 20px;
        }
        
        .semester-block h5 {
          margin-bottom: 10px;
          color: #555;
        }
        
        .subjects-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        .subjects-table th {
          background-color: #f5f5f5;
          padding: 10px;
          text-align: left;
          font-weight: 600;
          color: #333;
        }
        
        .subjects-table td {
          padding: 10px;
          border-top: 1px solid #eee;
        }
        
        .passed-subject {
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .status-badge.passed {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.not-passed {
          background-color: #ffebee;
          color: #c62828;
        }
        
        .details-modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #eee;
        }
        
        .summary-stats {
          display: flex;
          gap: 15px;
        }
        
        .stat-box {
          flex: 1;
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 5px;
          display: block;
        }
        
        .stat-value {
          font-size: 1.3rem;
          font-weight: bold;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default EvaluationHistory;