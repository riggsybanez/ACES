import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/authService';

const coralColor = 'rgba(255,79,78,255)';
const STAGES = {
  UPLOAD: "upload",
  PROCESSING: "processing",
  EXTRACTION: "extraction",
};

export default function EvaluateTab() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(STAGES.UPLOAD);
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const handleExtract = async () => {
    if (!file || !email || !studentName) {
      alert("Please fill out all fields and upload a file before extracting.");
      return;
    }

    // Set processing stage
    setStage(STAGES.PROCESSING);
    setProcessingProgress(0);

    try {
      // Start OCR processing
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProcessingProgress(parseInt(m.progress * 100));
            }
            console.log(m);
          }
        }
      );

      const extractedText = result.data.text;
      console.log("Extracted Text:", extractedText);

      // Parse the extracted text to get course information
      const extractedData = parseTranscriptText(extractedText);
      
      // Generate student ID if none was extracted
      const studentId = extractedData.studentId || generateStudentId();
      
      // Create a document in Firestore with the structured data
      const docRef = await addDoc(collection(db, "ExtractedCourses"), {
        studentName: extractedData.studentName || studentName,
        studentId: studentId,
        program: extractedData.program || "Not Specified",
        email: email,
        courses: extractedData.courses,
        timestamp: serverTimestamp(),
        status: "pending"
      });
      
      console.log("Document written with ID: ", docRef.id);

      // Store the document ID in localStorage for the results page
      localStorage.setItem('currentEvaluationId', docRef.id);

      // Navigate to results page
      navigate('/evaluation-results');
    } catch (error) {
      console.error("Processing Error:", error);
      alert("Processing failed: " + error.message);
      setStage(STAGES.UPLOAD);
    }
  };

  // Generate a random student ID
  const generateStudentId = () => {
    return `${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  };

  // Function to parse transcript text and extract structured data
  const parseTranscriptText = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Extract student information
    const studentNameLine = lines.find(line => line.includes('Name of Student')) || '';
    const extractedStudentName = studentNameLine.split(':')[1]?.trim() || '';
    
    // Extract course information
    const courses = [];
    let isCourseSection = false;
    let currentSemester = '';
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for semester information
      if (line.includes('Semester') || line.match(/\d{4}\s*-\s*\d{4}/)) {
        currentSemester = line.trim();
      }
      
      // Check if we're in the course section
      if (line.includes('Course No') || line.includes('Descriptive Title')) {
        isCourseSection = true;
        continue;
      }
  
      if (isCourseSection) {
        // Try to match course patterns - this is a simplified approach
        const parts = line.split(/\s{2,}/).filter(part => part.trim());
        
        if (parts.length >= 3) {
          // Attempt to extract course code, title and grade
          const courseCode = parts[0].trim();
          const courseTitle = parts[1].trim();
          let grade = '';
          let credits = 0;
          
          // Look for grade and credits in the remaining parts
          for (let j = 2; j < parts.length; j++) {
            const part = parts[j].trim();
            if (/^[A-F][+\-]?$|^P$|^F$|^INC$|^FD$/.test(part)) {
              grade = part;
            } else if (/^\d+$/.test(part)) {
              credits = parseInt(part);
            }
          }
          
          if (courseCode && courseTitle) {
            courses.push({
              number: courseCode,
              title: courseTitle,
              credits: credits || 3, // Default to 3 if not found
              grade: grade || 'N/A',
              semester: currentSemester
            });
          }
        }
        
        // Exit course section if we hit a line that indicates the end
        if (line.includes('Transcript Closed') || line.includes('END OF TRANSCRIPT')) {
          isCourseSection = false;
        }
      }
    }
  
    // Extract program information if available
    const programLine = lines.find(line => 
      line.includes('University') || 
      line.includes('College') || 
      line.includes('UNIVERSITY') || 
      line.includes('COLLEGE')
    ) || '';
    
    return {
      studentName: extractedStudentName,
      studentId: "",
      program: programLine.trim(),
      courses: courses
    };
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

          {stage === STAGES.PROCESSING && (
            <div className="processing-container">
              <h3>Processing Transcript</h3>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p>{processingProgress}% Complete</p>
              <p className="processing-note">This may take a minute or two. Please don't refresh the page.</p>
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
        .processing-container {
          text-align: center;
          padding: 40px;
          max-width: 500px;
          margin: 0 auto;
        }
        .progress-bar {
          height: 20px;
          background-color: #e0e0e0;
          border-radius: 10px;
          margin: 20px 0;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background-color: ${coralColor};
          transition: width 0.3s ease;
        }
        .processing-note {
          font-size: 0.9rem;
          color: #666;
          margin-top: 15px;
        }
      `}</style>
    </div>
  );
}