import { useState } from "react";
import { useNavigate } from 'react-router-dom';
// Add Tesseract.js for OCR

const coralColor = 'rgba(255,79,78,255)';
const STAGES = {
  UPLOAD: "upload",
  EXTRACTION: "extraction",
  RESULTS: "results",
  REVIEW: "review",
};

export default function EvaluateTab() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(STAGES.UPLOAD);
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [extractedCourses, setExtractedCourses] = useState([]);
  const [remarks, setRemarks] = useState({});

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const handleExtract = () => {
    if (!file || !email || !studentName) {
      alert("Please fill out all fields and upload a file before extracting.");
      return;
    }

    // Start OCR processing when an image is uploaded
    Tesseract.recognize(
      file,
      'eng', // Language setting for OCR
      {
        logger: (m) => console.log(m), // Logs OCR progress
      }
    ).then(({ data: { text } }) => {
      console.log(text);  // Text output from the image
      // For now, mock the extracted data based on the OCR text
      setExtractedCourses([
        { number: "CS101", title: "Intro to Programming", description: "Basic programming", credits: 3, gpa: 3.5, remark: "" },
        { number: "MATH201", title: "Calculus I", description: "Limits and derivatives", credits: 4, gpa: 3.0, remark: "" },
        { number: "PHYS101", title: "Physics I", description: "Mechanics and thermodynamics", credits: 4, gpa: 3.2, remark: "" },
      ]);
      setStage(STAGES.EXTRACTION);
    }).catch((error) => {
      alert("OCR failed: " + error.message);
    });
  };

  const handleRemarkChange = (courseNumber, value) => {
    setRemarks((prevRemarks) => ({ ...prevRemarks, [courseNumber]: value }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>JOHN SMITH</h1>
          <p>Course Evaluator</p>
        </div>
        <div onClick={() => navigate('/evaluator-dashboard')} className="sidebar-item">🏠 Home</div>
        <div onClick={() => navigate('/course-evaluation')} className="sidebar-item">📅 Course Evaluation</div>
        <div onClick={() => navigate('/history')} className="sidebar-item">📄 Evaluation History</div>
        <button onClick={() => navigate('/login')} className="logout-button">Logout</button>
      </div>
      
      <div className="main-content">
        <h2>Dashboard</h2>
        <div className="p-10">
          <h3>Evaluation Process</h3>

          {stage === STAGES.UPLOAD && (
            <div className="evaluation-form">
              <div className="form-group">
                <label htmlFor="transcript">Upload Transcript (JPEG/PNG)</label>
                <input type="file" id="transcript" onChange={handleFileUpload} accept="image/jpeg, image/png" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Assign Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="studentName">Student Name</label>
                <input type="text" id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="John Doe" />
              </div>
              <button className="extract-button" onClick={handleExtract}>Extract Information</button>
            </div>
          )}

          {stage === STAGES.EXTRACTION && (
            <div>
              <h3>Extracted Courses</h3>
              <table className="course-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Title</th>
                    <th>Description</th>
                    <th>Credits</th>
                    <th>GPA</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedCourses.map((course) => (
                    <tr key={course.number}>
                      <td>{course.number}</td>
                      <td>{course.title}</td>
                      <td>{course.description}</td>
                      <td>{course.credits}</td>
                      <td>{course.gpa}</td>
                      <td>
                        <input
                          type="text"
                          value={remarks[course.number] || ""}
                          onChange={(e) => handleRemarkChange(course.number, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="extract-button" onClick={() => setStage(STAGES.RESULTS)}>Proceed to Results</button>
            </div>
          )}
        </div>
      </div>

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
          flex-direction: column;
          margin-bottom: 20px;
          text-align: center;
        }
        .sidebar h1 {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 0;
        }
        .sidebar p {
          font-size: 0.9rem;
          margin: 5px 0 0;
          color: #555;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
        .sidebar-item:hover {
          background-color: #f0f0f0;
        }
        .logout-button {
          background-color: ${coralColor};
          color: white;
          padding: 10px;
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
        .evaluation-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 300px;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
        }
        .form-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .extract-button {
          background-color: ${coralColor};
          color: white;
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .course-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          background-color: black;
          color: white;
        }
        .course-table th, .course-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .course-table th {
          background-color: #333;
        }
        .course-table td input {
          width: 100%;
          padding: 0.5rem;
          background-color: #444;
          color: white;
          border: 1px solid #888;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
