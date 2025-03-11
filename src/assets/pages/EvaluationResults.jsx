<<<<<<< HEAD
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function ExtractionResults() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("extraction"); // Start at EXTRACTION stage for demo
  const [extractedCourses, setExtractedCourses] = useState([
    { number: "MATH101", title: "Calculus I", credits: 3, grade: "A" },
    { number: "PHYS101", title: "Physics I", credits: 4, grade: "D" },
    { number: "CS101", title: "Introduction to Programming", credits: 3, grade: "B+" },
    { number: "ENG101", title: "English Composition", credits: 3, grade: "P" },
    { number: "HIST101", title: "World History", credits: 3, grade: "B" },
  ]);
  const [studentName, setStudentName] = useState("Juan Dela Cruz");
  const [studentId, setStudentId] = useState("2023-12345");
  const [selectedProgram, setSelectedProgram] = useState("BS Computer Science");

=======
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/authService'; // Make sure this points to your Firebase config

export default function ExtractionResults() {
  const navigate = useNavigate();
  const [extractedCourses, setExtractedCourses] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get the evaluation ID from localStorage
        const evaluationId = localStorage.getItem('currentEvaluationId');
        
        if (!evaluationId) {
          throw new Error('No evaluation ID found. Please start a new evaluation.');
        }
        
        // Fetch the document from Firestore
        const docRef = doc(db, "ExtractedCourses", evaluationId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setExtractedCourses(data.courses || []);
          setStudentName(data.studentName || "");
          setStudentId(data.studentId || "");
          setSelectedProgram(data.program || "");
          setEmail(data.email || "");
        } else {
          throw new Error('Evaluation data not found.');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
>>>>>>> b0a224fa7cc92f0668e5f4404a4722f8ca58c399

  return (
    <div className="container">
      <div className="sidebar">
        <div className="sidebar-header">
<<<<<<< HEAD
          <h1>John Doe</h1>
=======
          <h1>John Smith</h1>
>>>>>>> b0a224fa7cc92f0668e5f4404a4722f8ca58c399
          <p>Course Evaluator</p>
        </div>
        <div onClick={() => navigate('/evaluator-dashboard')} className="sidebar-item">🏠 Home</div>
        <div onClick={() => navigate('/course-evaluation')} className="sidebar-item">📅 Course Evaluation</div>
        <div onClick={() => navigate('/history')} className="sidebar-item">📄 Evaluation History</div>
        <button onClick={() => navigate('/login')} className="logout-button">Logout</button>
      </div>

      <div className="main-content">
<<<<<<< HEAD
        <div>
          <h2>Extracted Course Information</h2>
          <div className="student-info">
            <div>
              <p>Student Name: {studentName}</p>
              <p>Program: {selectedProgram}</p>
            </div>
            <div>
              <p>Student ID: {studentId}</p>
              <p>Total Courses Extracted: {extractedCourses.length}</p>
            </div>
          </div>
          <table className="course-table">
            <thead>
              <tr>
                <th>Course Number</th>
                <th>Course Title</th>
                <th>Credits</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {extractedCourses.map((course) => (
                <tr key={course.number}>
                  <td>{course.number}</td>
                  <td>{course.title}</td>
                  <td>{course.credits}</td>
                  <td>{course.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="next-steps">
            <h3>Next Steps</h3>
            <p>The system will now compare these extracted courses with the program prospectus to determine course equivalency and evaluation status.</p>
          </div>
        </div>
=======
        {loading ? (
          <div className="loading">
            <p>Loading evaluation data...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button 
              className="back-button" 
              onClick={() => navigate('/course-evaluation')}
            >
              Back to Evaluation
            </button>
          </div>
        ) : (
          <div>
            <h2>Extracted Course Information</h2>
            <div className="student-info">
              <div>
                <p>Student Name: {studentName}</p>
                <p>Program: {selectedProgram}</p>
                <p>Email: {email}</p>
              </div>
              <div>
                <p>Student ID: {studentId}</p>
                <p>Total Courses Extracted: {extractedCourses.length}</p>
              </div>
            </div>
            
            {extractedCourses.length === 0 ? (
              <div className="no-courses">
                <p>No courses were found in the uploaded transcript. Please try again with a clearer image.</p>
              </div>
            ) : (
              <table className="course-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Title</th>
                    <th>Credits</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedCourses.map((course, index) => (
                    <tr key={index}>
                      <td>{course.number}</td>
                      <td>{course.title}</td>
                      <td>{course.credits}</td>
                      <td>{course.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            <div className="next-steps">
              <h3>Next Steps</h3>
              <p>The system will now compare these extracted courses with the program prospectus to determine course equivalency and evaluation status.</p>
            </div>
            <div className="button-container">
              <button className="back-button" onClick={() => navigate('/course-evaluation')}>
                Back to Evaluation
              </button>
            </div>
          </div>
        )}
>>>>>>> b0a224fa7cc92f0668e5f4404a4722f8ca58c399
      </div>

      <style>{`
        /* Styles for the entire page */
        .container {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          background-color: #fff;
          color: #333;
          width: 250px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .sidebar-header {
          margin-bottom: 20px;
        }

        .sidebar-header h1 {
          font-size: 1.5rem;
          margin-bottom: 5px;
        }

        .sidebar-item {
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #333;
        }

        .sidebar-item:hover {
          background-color: #f0f0f0;
        }

        .logout-button {
          background-color: #ff4f4e; /* Coral color */
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 20px;
        }

        .main-content {
          flex: 1;
          padding: 20px;
        }

        .student-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
<<<<<<< HEAD
=======
          padding: 15px;
          background-color: #f8f8f8;
          border-radius: 8px;
>>>>>>> b0a224fa7cc92f0668e5f4404a4722f8ca58c399
        }

        .student-info div {
          width: 48%;
        }

        .course-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .course-table th,
        .course-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .course-table th {
<<<<<<< HEAD
          background-color: #f2f2f2;
=======
          background-color: #ff4f4e;
          color: white;
>>>>>>> b0a224fa7cc92f0668e5f4404a4722f8ca58c399
        }

        .next-steps {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 6px;
<<<<<<< HEAD
=======
          margin-bottom: 20px;
>>>>>>> b0a224fa7cc92f0668e5f4404a4722f8ca58c399
        }

        .next-steps h3 {
          margin-top: 0;
        }
<<<<<<< HEAD
      `}</style>
    </div>
  );
}
=======
        
        .button-container {
          display: flex;
          justify-content: flex-end;
        }
        
        .back-button {
          background-color: #ff4f4e;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .loading, .error-message, .no-courses {
          text-align: center;
          padding: 40px;
          background-color: #f8f8f8;
          border-radius: 8px;
          margin: 20px 0;
        }

        .error-message {
          color: #ff4f4e;
        }
      `}</style>
    </div>
  );
}
>>>>>>> b0a224fa7cc92f0668e5f4404a4722f8ca58c399
