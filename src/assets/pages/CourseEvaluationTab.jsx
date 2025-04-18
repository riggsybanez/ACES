import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/authService'; // Import db from authService.js
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions

const coralColor = 'rgba(255,79,78,255)';

const STAGES = {
  UPLOAD: "upload",
  EXTRACTION: "extraction",
  RESULTS: "results",
  REVIEW: "review",
};

export default function CourseEvaluationTab() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(STAGES.UPLOAD);
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [program, setProgram] = useState("Computer Science");
  const [extractedCourses, setExtractedCourses] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [showProspectus, setShowProspectus] = useState(false);
  
  // State for year and semester selection
  const [selectedYear, setSelectedYear] = useState("firstyear");
  const [selectedSemester, setSelectedSemester] = useState("firstSem");
  const [currentProspectus, setCurrentProspectus] = useState([]);
  
  // State for dropdowns
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [semesterDropdownOpen, setSemesterDropdownOpen] = useState(false);

  const fetchProspectusData = async () => {
    try {
      const coursesCollection = collection(db, `Program/${program}/${selectedYear}/${selectedSemester}/courses`);
      const courseSnapshot = await getDocs(coursesCollection);
      const courses = courseSnapshot.docs.map(doc => ({
        code: doc.id,  // Assuming the document ID is the course code
        title: doc.data().title,
        units: doc.data().unitstotal
      }));
      setCurrentProspectus(courses);
    } catch (error) {
      console.error("Error fetching prospectus data: ", error);
    }
  };

  // Update prospectus when program, year, or semester changes
  useEffect(() => {
    fetchProspectusData();
  }, [program, selectedYear, selectedSemester]);

  // Reset year/semester when program changes
  useEffect(() => {
    setSelectedYear("1st Year");
    setSelectedSemester("1st Semester");
  }, [program]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if the click isn't on dropdown or dropdown button
      if (yearDropdownOpen || semesterDropdownOpen) {
        setYearDropdownOpen(false);
        setSemesterDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [yearDropdownOpen, semesterDropdownOpen]);

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const handleExtract = () => {
    if (!file || !email || !studentName || !program) {
      alert("Please fill out all fields and upload a file before extracting.");
      return;
    }
    
    // Simulate OCR processing
    console.log("Processing file:", file.name);
    
    // Set dummy extracted courses
    setExtractedCourses([
      { number: "CS101", title: "Intro to Programming", description: "Basic programming", credits: 3, gpa: 3.5, remark: "" },
      { number: "MATH201", title: "Calculus I", description: "Limits and derivatives", credits: 4, gpa: 3.0, remark: "" },
      { number: "PHYS101", title: "Physics I", description: "Mechanics and thermodynamics", credits: 4, gpa: 3.2, remark: "" },
    ]);
    
    setStage(STAGES.EXTRACTION);
    // Show the prospectus sidebar
    setShowProspectus(true);
  };

  const handleRemarkChange = (courseNumber, value) => {
    setRemarks((prevRemarks) => ({ ...prevRemarks, [courseNumber]: value }));
  };

  // Get available semesters for a year
  const getAvailableSemesters = (year) => {
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>JOHN SMITH</h1>
            <p style={{ fontSize: '0.8rem' }}>Course Evaluator</p>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/evaluator-dashboard')}>
            🏠 Home
          </div>
          <div className="sidebar-item active" onClick={() => navigate('/course-evaluation')}>
            📅 Course Evaluation
          </div>
          <div className="sidebar-item" onClick={() => navigate('/history')}>
            📄 Evaluation History
          </div>
          <div className="sidebar-item" onClick={() => navigate('/student-archives')}>
            📚 Student Archives
          </div>
        </div>
        <div className="logout-container">
          <button className="logout-button" onClick={() => navigate('/login')}>
            Logout
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="main-content">
        <h2>Course Evaluation</h2>
        
        <div className="filter-container">
          <h3 style={{ marginTop: 0, color: '#555' }}>Evaluation Process</h3>
          
          {/* Upload Stage */}
          {stage === STAGES.UPLOAD && (
            <div>
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="transcript">Upload Transcript (JPEG/PNG)</label>
                  <input 
                    type="file" 
                    id="transcript"
                    onChange={handleFileUpload} 
                    accept="image/jpeg, image/png"
                    className="filter-input"
                    aria-label="Upload transcript file"
                  />
                </div>
              </div>
              
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="email">Student Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com" 
                    className="filter-input"
                    aria-label="Student email"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="studentName">Student Name</label>
                  <input 
                    type="text" 
                    id="studentName"
                    value={studentName} 
                    onChange={(e) => setStudentName(e.target.value)} 
                    placeholder="John Doe"
                    className="filter-input"
                    aria-label="Student name"
                  />
                </div>
              </div>
              
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="program">Select Program</label>
                  <select 
                    id="program" 
                    value={program}
                    onChange={(e) => setProgram(e.target.value)} 
                    className="filter-select"
                    aria-label="Program selection"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={handleExtract} 
                  className="action-button save"
                  aria-label="Extract information from transcript"
                >
                  Extract Information
                </button>
              </div>
            </div>
          )}
          
          {/* Extraction Results Stage */}
          {stage === STAGES.EXTRACTION && (
            <div className="prospectus-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Extracted Courses</h3>
                {/* Toggle Prospectus Button */}
                <button 
                  onClick={() => setShowProspectus(!showProspectus)} 
                  className={`view-mode-button ${showProspectus ? '' : 'active'}`}
                  aria-label={showProspectus ? "Hide prospectus" : "Show prospectus"}
                >
                  {showProspectus ? '🔍 Hide Prospectus' : '🔍 Show Prospectus'}
                </button>
              </div>
              
              <div className="student-info">
                <p><strong>Name:</strong> {studentName}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Program:</strong> {program}</p>
              </div>
              
              <div className="semester-block">
                <table className="subjects-table">
                  <thead>
                    <tr>
                      <th>Course Number</th>
                      <th>Course Title</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Credits</th>
                      <th style={{ textAlign: 'center' }}>GPA</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedCourses.map((course, idx) => (
                      <tr key={course.number}>
                        <td>{course.number}</td>
                        <td>{course.title}</td>
                        <td>{course.description}</td>
                        <td style={{ textAlign: 'center' }}>{course.credits}</td>
                        <td style={{ textAlign: 'center' }}>{course.gpa}</td>
                        <td>
                          <input
                            type="text"
                            value={remarks[course.number] || ""}
                            onChange={(e) => handleRemarkChange(course.number, e.target.value)}
                            placeholder="Add remarks"
                            className="filter-input"
                            aria-label={`Remarks for ${course.title}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="summary-section">
                <h4>Evaluation Summary</h4>
                <div className="summary-stats">
                  <div className="stat-box">
                    <span className="stat-label">Total Courses</span>
                    <span className="stat-value">{extractedCourses.length}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Total Credits</span>
                    <span className="stat-value">
                      {extractedCourses.reduce((sum, course) => sum + course.credits, 0)}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Average GPA</span>
                    <span className="stat-value">
                      {(extractedCourses.reduce((sum, course) => sum + course.gpa, 0) / extractedCourses.length).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={() => setStage(STAGES.UPLOAD)}
                  className="action-button reset"
                  aria-label="Go back to upload"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStage(STAGES.RESULTS)}
                  className="action-button save"
                  aria-label="Proceed to evaluation results"
                >
                  Save Evaluation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prospectus Sidebar - Only shown when needed */}
      {showProspectus && (
        <div className="prospectus-sidebar">
          <div className="prospectus-header">
            <h3>{program} Prospectus</h3>
            <button 
              onClick={() => setShowProspectus(false)} 
              className="close-button"
              aria-label="Close prospectus"
            >
              ×
            </button>
          </div>
          
          {/* Year and Semester Dropdowns */}
          <div className="filter-row">
            {/* Year Dropdown */}
            <div className="filter-group">
              <label>Academic Year</label>
              <div className="custom-dropdown">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setYearDropdownOpen(!yearDropdownOpen);
                    setSemesterDropdownOpen(false);
                  }}
                  className="filter-select dropdown-toggle"
                  aria-haspopup="true"
                  aria-expanded={yearDropdownOpen}
                >
                  {selectedYear} <span className="dropdown-arrow">▼</span>
                </button>
                
                {yearDropdownOpen && (
                  <div className="dropdown-menu">
                    {Object.keys().map((year) => (
                      <div 
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setYearDropdownOpen(false);
                          // Set semester to first available one
                          const semesters = getAvailableSemesters(year);
                          if (semesters.length > 0) {
                            setSelectedSemester(semesters[0]);
                          }
                        }}
                        className="dropdown-item"
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Semester Dropdown */}
            <div className="filter-group">
              <label>Semester</label>
              <div className="custom-dropdown">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSemesterDropdownOpen(!semesterDropdownOpen);
                    setYearDropdownOpen(false);
                  }}
                  className="filter-select dropdown-toggle"
                  aria-haspopup="true"
                  aria-expanded={semesterDropdownOpen}
                >
                  {selectedSemester} <span className="dropdown-arrow">▼</span>
                </button>
                
                {semesterDropdownOpen && (
                  <div className="dropdown-menu">
                    {getAvailableSemesters(selectedYear).map((semester) => (
                      <div 
                        key={semester}
                        onClick={() => {
                          setSelectedSemester(semester);
                          setSemesterDropdownOpen(false);
                        }}
                        className="dropdown-item"
                      >
                        {semester}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Current Selection Display */}
          <div className="current-selection">
            <h4>{selectedYear} - {selectedSemester}</h4>
          </div>
          
          {/* Course Table - Scrollable */}
          <div className="prospectus-content">
          {currentProspectus.length > 0 ? (
  <table className="subjects-table">
    <thead>
      <tr>
        <th>Code</th>
        <th>Title</th>
        <th style={{ textAlign: 'center' }}>Units</th>
      </tr>
    </thead>
    <tbody>
      {currentProspectus.map((subject, index) => (
        <tr key={index}>
          <td>{subject.code}</td>
          <td>{subject.title}</td>
          <td style={{ textAlign: 'center' }}>{subject.units}</td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <div className="no-courses-message">
    No courses available for this semester
  </div>
)}
          </div>
        </div>
      )}
      
      {/* Styles */}
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
        }
        .filter-container {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .filter-row {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
        .filter-row:last-child {
          margin-bottom: 0;
        }
        .filter-group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .filter-group label {
          margin-bottom: 5px;
          font-weight: bold;
          font-size: 0.9rem;
        }
        .filter-select, .filter-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .filter-select:focus, .filter-input:focus {
          outline: none;
          border-color: ${coralColor};
        }
        .view-mode-button {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #8e8e93;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
        }
        .view-mode-button.active {
          background-color: ${coralColor};
          color: white;
          border-color: ${coralColor};
        }
        .prospectus-container {
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          margin-top: 15px;
        }
        .prospectus-sidebar {
          width: 400px;
          padding: 20px;
          background-color: white;
          border-left: 1px solid #ddd;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          box-sizing: border-box;
          transition: all 0.3s ease;
          box-shadow: -2px 0 5px rgba(0,0,0,0.05);
        }
        .prospectus-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          position: sticky;
          top: 0;
          background-color: white;
          padding-bottom: 10px;
          z-index: 5;
        }
        .prospectus-header h3 {
          margin: 0;
          color: #333;
        }
        .close-button {
          background-color: transparent;
          color: #666;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        .close-button:hover {
          background-color: #f0f0f0;
        }
        .custom-dropdown {
          position: relative;
        }
        .dropdown-toggle {
          width: 100%;
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dropdown-arrow {
          margin-left: 5px;
          font-size: 0.8rem;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background-color: #fff;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 10;
          margin-top: 5px;
          max-height: 200px;
          overflow-y: auto;
        }
        .dropdown-item {
          padding: 8px 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .dropdown-item:hover {
          background-color: #f5f5f5;
        }
        .current-selection {
          margin-bottom: 15px;
          text-align: center;
          padding: 8px;
          background-color: #f0f0f0;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .current-selection h4 {
          margin: 0;
          color: ${coralColor};
        }
        .prospectus-content {
          max-height: calc(100vh - 280px);
          overflow-y: auto;
        }
        .subjects-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        .subjects-table th, .subjects-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .subjects-table th {
          background-color: #f9f9f9;
          font-weight: bold;
        }
        .course-description {
          font-size: 0.8rem;
          color: #666;
        }
        .no-courses-message {
          text-align: center;
          padding: 20px;
          color: #666;
        }
        .student-info {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        .student-info p {
          margin: 5px 0;
        }
        .summary-section {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .summary-section h4 {
          margin-top: 0;
          margin-bottom: 15px;
        }
        .summary-stats {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .stat-box {
          background-color: white;
          padding: 15px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          flex: 1;
          min-width: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 5px;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .action-buttons {
          display: flex;
          gap: 15px;
          margin-top: 30px;
          justify-content: flex-end;
        }
        .action-button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: opacity 0.3s;
        }
        .action-button:hover {
          opacity: 0.9;
        }
        .action-button.save {
          background-color: ${coralColor};
          color: white;
        }
        .action-button.reset {
          background-color: #9e9e9e;
          color: white;
        }
        
        /* Responsive styles */
        @media (max-width: 1024px) {
          .filter-row {
            flex-direction: column;
            gap: 10px;
          }
          
          .summary-stats {
            flex-direction: column;
          }
          
          .action-buttons {
            flex-direction: column;
            align-items: stretch;
          }
        }
        
        @media (max-width: 768px) {
          .sidebar {
            width: 200px;
          }
          
          .main-content {
            padding: 15px;
          }
          
          .subjects-table th, .subjects-table td {
            padding: 8px 10px;
            font-size: 0.85rem;
          }
          
          .prospectus-sidebar {
            width: 300px;
          }
        }
        
        /* Accessibility enhancements */
        .filter-select:focus, 
        .filter-input:focus,
        .view-mode-button:focus,
        .action-button:focus,
        .close-button:focus {
          outline: 2px solid ${coralColor};
          outline-offset: 2px;
        }
        
        /* Additional responsive adjustments */
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
            padding: 10px;
          }
          
          .subjects-table {
            font-size: 0.8rem;
          }
          
          .subjects-table th, .subjects-table td {
            padding: 6px 8px;
          }
          
          .action-button {
            padding: 8px 15px;
            font-size: 0.9rem;
          }
          
          .prospectus-sidebar {
            width: 100%;
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 1000;
          }
        }
      `}</style>
    </div>
  );
}
