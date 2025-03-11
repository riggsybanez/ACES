import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/authService';
import { collection, getDocs } from 'firebase/firestore';

export default function ExtractionResults() {
  const navigate = useNavigate();
  const [extractedCourses, setExtractedCourses] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, 'ExtractedCourses'));
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data(); // Assuming you want the latest document
        setExtractedCourses(data.courses);
        setStudentName(data.studentName);
        setStudentId(data.studentId || ""); // Ensure studentId is part of the data
        setSelectedProgram(data.program);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>John Doe</h1>
          <p>Course Evaluator</p>
        </div>
        <div onClick={() => navigate('/evaluator-dashboard')} className="sidebar-item">🏠 Home</div>
        <div onClick={() => navigate('/course-evaluation')} className="sidebar-item">📅 Course Evaluation</div>
        <div onClick={() => navigate('/history')} className="sidebar-item">📄 Evaluation History</div>
        <button onClick={() => navigate('/login')} className="logout-button">Logout</button>
      </div>

      <div className="main-content">
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
      </div>

      <style>{`
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
          background-color: #ff4f4e;
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
          background-color: #f2f2f2;
        }

        .next-steps {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 6px;
        }

        .next-steps h3 {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
}