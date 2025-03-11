import { useState } from "react";
import { useNavigate } from 'react-router-dom';
// Add Tesseract.js for OCR

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
  const [program, setProgram] = useState("Computer Science");
  const [extractedCourses, setExtractedCourses] = useState([]);
  const [remarks, setRemarks] = useState({});

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const handleExtract = () => {
    if (!file || !email || !studentName || !program) {
      alert("Please fill out all fields and upload a file before extracting.");
      return;
    }

    // Start OCR processing when an image is uploaded
    Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => console.log(m),
      }
    ).then(({ data: { text } }) => {
      console.log(text);
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
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#f4f4f4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        height: '95vh',
        justifyContent: 'space-between', // This will push logout to the bottom
      }}>
        <div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2>JOHN DOE</h2>
            <p>Course Evaluator</p>
          </div>
          <div onClick={() => navigate('/evaluator-dashboard')} style={{
            padding: '10px 20px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            ':hover': { backgroundColor: '#ddd' },
          }}>🏠 Home</div>
          <div onClick={() => navigate('/course-evaluation')} style={{
            padding: '10px 20px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            ':hover': { backgroundColor: '#ddd' },
          }}>📅 Course Evaluation</div>
          <div onClick={() => navigate('/history')} style={{
            padding: '10px 20px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            ':hover': { backgroundColor: '#ddd' },
          }}>📄 Evaluation History</div>
        </div>
        
        {/* Logout button centered at the bottom */}
        <button onClick={() => navigate('/login')} style={{
          padding: '10px 20px',
          backgroundColor: '#ff4f4e',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          alignSelf: 'center', // This centers the logout button
          marginTop: 'auto', // Pushes the button to the bottom
        }}>
          Logout
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#fff' }}>
        <h2>Dashboard</h2>
        <div className="p-10">
          <h3>Evaluation Process</h3>

          {stage === STAGES.UPLOAD && (
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="transcript">Upload Transcript (JPEG/PNG)</label>
                <input type="file" id="transcript" onChange={handleFileUpload} accept="image/jpeg, image/png" style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '5px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="email">Assign Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '5px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="studentName">Student Name</label>
                <input type="text" id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="John Doe" style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '5px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="program">Select Program</label>
                <select id="program" value={program} onChange={(e) => setProgram(e.target.value)} style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '5px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Systems">Information Systems</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>
              <button onClick={handleExtract} style={{
                backgroundColor: '#ff4f4e',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                cursor: 'pointer',
              }}>Extract Information</button>
            </div>
          )}

          {stage === STAGES.EXTRACTION && (
            <div>
              <h3>Extracted Courses</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Course Number</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Course Title</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Credits</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>GPA</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedCourses.map((course) => (
                    <tr key={course.number}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.number}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.title}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.description}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.credits}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.gpa}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <input
                          type="text"
                          value={remarks[course.number] || ""}
                          onChange={(e) => handleRemarkChange(course.number, e.target.value)}
                          style={{
                            width: '100px',
                            padding: '5px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setStage(STAGES.RESULTS)} style={{
                backgroundColor: '#ff4f4e',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                cursor: 'pointer',
              }}>Proceed to Results</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}