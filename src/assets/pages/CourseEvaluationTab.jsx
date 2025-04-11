import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import programProspectus from '../data/programProspectusData';

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
  const [selectedYear, setSelectedYear] = useState("1st Year");
  const [selectedSemester, setSelectedSemester] = useState("1st Semester");
  const [currentProspectus, setCurrentProspectus] = useState([]);
  
  // State for dropdowns
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [semesterDropdownOpen, setSemesterDropdownOpen] = useState(false);

  // Update prospectus when program, year, or semester changes
  useEffect(() => {
    if (programProspectus[program] && 
        programProspectus[program][selectedYear] && 
        programProspectus[program][selectedYear][selectedSemester]) {
      setCurrentProspectus(programProspectus[program][selectedYear][selectedSemester]);
    } else {
      setCurrentProspectus([]);
    }
  }, [program, selectedYear, selectedSemester]);

  // Reset year/semester when program changes
  useEffect(() => {
    if (programProspectus[program]) {
      const years = Object.keys(programProspectus[program]);
      if (years.length > 0) {
        setSelectedYear(years[0]);
        
        const semesters = Object.keys(programProspectus[program][years[0]] || {});
        if (semesters.length > 0) {
          setSelectedSemester(semesters[0]);
        }
      }
    }
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
    if (programProspectus[program] && programProspectus[program][year]) {
      return Object.keys(programProspectus[program][year]);
    }
    return [];
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Navigation Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#f4f4f4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        height: '100vh',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 10,
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      }}>
        <div>
          <div style={{ textAlign: 'center', marginBottom: '20px', padding: '20px 0' }}>
            <h2 style={{ margin: 0 }}>JOHN DOE</h2>
            <p style={{ margin: '5px 0 0 0' }}>Course Evaluator</p>
          </div>
          <div onClick={() => navigate('/evaluator-dashboard')} style={{
            padding: '10px 20px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            boxSizing: 'border-box',
            transition: 'background-color 0.2s',
          }}>🏠 Home</div>
          <div onClick={() => navigate('/course-evaluation')} style={{
            padding: '10px 20px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            backgroundColor: '#ddd',
            boxSizing: 'border-box',
          }}>📅 Course Evaluation</div>
          <div onClick={() => navigate('/history')} style={{
            padding: '10px 20px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            boxSizing: 'border-box',
            transition: 'background-color 0.2s',
          }}>📄 Evaluation History</div>
        </div>
        <button onClick={() => navigate('/login')} style={{
          padding: '10px 20px',
          backgroundColor: coralColor,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          alignSelf: 'center',
          marginTop: 'auto',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'background-color 0.2s',
        }}>
          Logout
        </button>
      </div>

      {/* Main content area */}
      <div style={{
        display: 'flex',
        marginLeft: '250px',
        width: 'calc(100% - 250px)',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
      }}>
        {/* Evaluation Form Column */}
        <div style={{
          flex: showProspectus ? '1' : '1',
          padding: '20px',
          backgroundColor: '#fff',
          boxSizing: 'border-box',
          minWidth: showProspectus ? '60%' : '100%',
          transition: 'all 0.3s ease',
        }}>
          <h2 style={{ 
            borderBottom: '2px solid ' + coralColor, 
            paddingBottom: '10px',
            color: '#333'
          }}>Course Evaluation</h2>
          
          <div style={{ padding: '10px 0' }}>
            <h3 style={{ color: '#555' }}>Evaluation Process</h3>
            
            {/* Upload Stage */}
            {stage === STAGES.UPLOAD && (
              <div style={{
                backgroundColor: '#f9f9f9',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="transcript" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Upload Transcript (JPEG/PNG)
                  </label>
                  <input 
                    type="file" 
                    id="transcript"
                    onChange={handleFileUpload} 
                    accept="image/jpeg, image/png"
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                    }} 
                    aria-label="Upload transcript file"
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Assign Email
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com" 
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                    }} 
                    aria-label="Student email"
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="studentName" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Student Name
                  </label>
                  <input 
                    type="text" 
                    id="studentName"
                    value={studentName} 
                    onChange={(e) => setStudentName(e.target.value)} 
                    placeholder="John Doe"
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                    }} 
                    aria-label="Student name"
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="program" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Select Program
                  </label>
                  <select 
                    id="program" 
                    value={program}
                    onChange={(e) => setProgram(e.target.value)} 
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: 'black',
                    }}
                    aria-label="Program selection"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleExtract} 
                  style={{
                    backgroundColor: coralColor,
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.2s',
                  }}
                  aria-label="Extract information from transcript"
                >
                  Extract Information
                </button>
              </div>
            )}
            
            {/* Extraction Results Stage */}
            {stage === STAGES.EXTRACTION && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>Extracted Courses</h3>
                  {/* Toggle Prospectus Button */}
                  <button 
                    onClick={() => setShowProspectus(!showProspectus)} 
                    style={{
                      backgroundColor: showProspectus ? '#f0f0f0' : coralColor,
                      color: showProspectus ? '#333' : 'black',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    aria-label={showProspectus ? "Hide prospectus" : "Show prospectus"}
                  >
                    {showProspectus ? '🔍 Hide Prospectus' : '🔍 Show Prospectus'}
                  </button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Course Number</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Course Title</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Description</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Credits</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>GPA</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedCourses.map((course, idx) => (
                        <tr key={course.number} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.number}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.title}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.description}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{course.credits}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{course.gpa}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                            <input
                              type="text"
                              value={remarks[course.number] || ""}
                              onChange={(e) => handleRemarkChange(course.number, e.target.value)}
                              placeholder="Add remarks"
                              style={{
                                width: '100%',
                                padding: '5px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                              }}
                              aria-label={`Remarks for ${course.title}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <button 
                  onClick={() => setStage(STAGES.RESULTS)}
                  style={{
                    backgroundColor: coralColor,
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    marginTop: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.2s',
                  }}
                  aria-label="Proceed to evaluation results"
                >
                  Proceed to Results
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Prospectus Sidebar - Only shown when needed */}
        {showProspectus && (
          <div style={{
            width: '400px',
            padding: '20px',
            backgroundColor: 'black',
            borderLeft: '1px solid #ddd',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
            boxSizing: 'border-box',
            transition: 'all 0.3s ease',
            boxShadow: '-2px 0 5px rgba(0,0,0,0.05)',
          }}>
            <div style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9', zIndex: 5, paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>{program} Prospectus</h3>
                <button 
                  onClick={() => setShowProspectus(false)} 
                  style={{
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s',
                  }}
                  aria-label="Close prospectus"
                >
                  ×
                </button>
              </div>
              
              {/* Year and Semester Dropdowns */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '15px',
                justifyContent: 'space-between'
              }}>
                {/* Year Dropdown */}
                <div style={{ 
                  position: 'relative', 
                  width: '48%',
                }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setYearDropdownOpen(!yearDropdownOpen);
                      setSemesterDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'black',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                    aria-haspopup="true"
                    aria-expanded={yearDropdownOpen}
                  >
                    {selectedYear} <span style={{ marginLeft: '5px' }}>▼</span>
                  </button>
                  
                  {yearDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '100%',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      marginTop: '5px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                      {Object.keys(programProspectus[program] || {}).map((year) => (
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
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            backgroundColor: selectedYear === year ? '#f5f5f5' : 'transparent',
                            transition: 'background-color 0.2s',
                            borderBottom: '1px solid #eee',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9f9f9';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = selectedYear === year ? '#f5f5f5' : 'transparent';
                          }}
                        >
                          {year}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Semester Dropdown */}
                <div style={{ 
                  position: 'relative', 
                  width: '48%',
                }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSemesterDropdownOpen(!semesterDropdownOpen);
                      setYearDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'black',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                    aria-haspopup="true"
                    aria-expanded={semesterDropdownOpen}
                  >
                    {selectedSemester} <span style={{ marginLeft: '5px' }}>▼</span>
                  </button>
                  
                  {semesterDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '100%',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      marginTop: '5px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                      {getAvailableSemesters(selectedYear).map((semester) => (
                        <div 
                          key={semester}
                          onClick={() => {
                            setSelectedSemester(semester);
                            setSemesterDropdownOpen(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            backgroundColor: selectedSemester === semester ? '#f5f5f5' : 'transparent',
                            transition: 'background-color 0.2s',
                            borderBottom: '1px solid #eee',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9f9f9';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = selectedSemester === semester ? '#f5f5f5' : 'transparent';
                          }}
                        >
                          {semester}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Current Selection Display */}
              <div style={{ 
                marginBottom: '15px', 
                textAlign: 'center', 
                padding: '8px', 
                backgroundColor: '#fff', 
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ margin: '0', color: coralColor }}>
                  {selectedYear} - {selectedSemester}
                </h4>
              </div>
            </div>
            
            {/* Course Table - Scrollable */}
            <div style={{ 
              backgroundColor: '#fff', 
              padding: '10px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              maxHeight: 'calc(100vh - 280px)',
              overflowY: 'auto'
            }}>
              {currentProspectus.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 2 }}>
                    <tr>
                      <th style={{ padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Code</th>
                      <th style={{ padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Title</th>
                      <th style={{ padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProspectus.map((subject, index) => (
                      <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f8f8' : 'white' }}>
                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{subject.code}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                          <div>{subject.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>{subject.description}</div>
                        </td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>{subject.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No courses available for this semester
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}