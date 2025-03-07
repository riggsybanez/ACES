import { useState } from "react";
import { useNavigate } from 'react-router-dom';

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
  const [selectedProgram, setSelectedProgram] = useState("");
  const [evaluationResults, setEvaluationResults] = useState({ passed: [], failed: [], cannotEvaluate: [] });

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const handleExtract = () => {
    setExtractedCourses([
      { number: "CS101", title: "Intro to Programming", description: "Basic programming", credits: 3, gpa: 3.5 },
      { number: "MATH201", title: "Calculus I", description: "Limits and derivatives", credits: 4, gpa: 3.0 },
      { number: "PHYS101", title: "Physics I", description: "Mechanics and thermodynamics", credits: 4, gpa: 3.2 },
    ]);
    setStage(STAGES.EXTRACTION);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="sidebar"> {/* Added a class for easier styling */}
        <div className="sidebar-header">
          <h1>JOHN SMITH</h1>
          <p>Course Evaluator</p>
        </div>
        <div onClick={() => navigate('/evaluator-dashboard')} className="sidebar-item">🏠 Home</div>
        <div onClick={() => navigate('/course-evaluation')} className="sidebar-item">📅 Course Evaluation</div>
        <div onClick={() => navigate('/history')} className="sidebar-item">📄 Evaluation History</div>
        <button onClick={() => navigate('/login')} className="logout-button">Logout</button>
      </div>

      <div className="main-content"> {/* Added a class for easier styling */}
        <div style={{ marginLeft: '20px' }}> {/* Added margin to the right side */}
          <h2>Dashboard</h2>
          <div className="p-10">
            <h3>Evaluation Process</h3>
            {stage === STAGES.UPLOAD && (
              <div className="evaluation-form">
                <div className="form-group">
                  <label htmlFor="transcript">Upload Transcript</label>
                  <input type="file" id="transcript" onChange={handleFileUpload} />
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
          </div>
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
        .main-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
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
      `}</style>
    </div>
  );
}
