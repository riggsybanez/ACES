import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';
import { db } from '../../firebase/authService';
import {
  doc,
  collection,
  getDoc,
  getDocs,
  writeBatch,
  addDoc,       
  query, where 
} from "firebase/firestore";

const StudentArchives = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const coralColor = 'rgba(255,79,78, 255)';
  
  // State for students list and selected student
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  // Form state for adding new student
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    email: '',
    course: '',
    yearLevel: ''
  });
  
  // State for selected course and view mode
  const [selectedCourse, setSelectedCourse] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState({ year: 1, semester: 1 });
  const [availablePrograms, setAvailablePrograms] = useState([]);
  
  // Sample subject structure (this would be populated dynamically based on course selection)
  const [subjects, setSubjects] = useState([]);

const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const emailFromEvaluation = queryParams.get('email');
const fromEvaluation = queryParams.get('fromEvaluation') === 'true';
  
  // Fetch students from Firestore
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentsCollection = collection(db, 'Students');
        const studentsSnapshot = await getDocs(studentsCollection);
        
        const studentsList = studentsSnapshot.docs.map(doc => ({
          docId: doc.id,
          id: doc.data().ID,
          name: doc.data().Name || 'No Name',
          email: doc.data().Email || '',
          course: doc.data().Course || '',
          yearLevel: doc.data().YearLevel || 1
        }));
        
        setStudents(studentsList);
        
        // If we're coming from the evaluation history page, find and select the student
        if (emailFromEvaluation && fromEvaluation) {
          const matchingStudent = studentsList.find(student => 
            student.email.toLowerCase() === emailFromEvaluation.toLowerCase()
          );
          
          if (matchingStudent) {
            // Automatically view this student's prospectus
            viewStudentProspectus(matchingStudent);
          } else {
            console.warn(`No student found with email: ${emailFromEvaluation}`);
          }
        }
        
        // Fetch available programs
        const programsCollection = collection(db, 'Program');
        const programsSnapshot = await getDocs(programsCollection);
        const programsList = programsSnapshot.docs.map(doc => doc.id);
        setAvailablePrograms(programsList);
        
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchStudents();
  }, [emailFromEvaluation, fromEvaluation]); // Add dependencies
  
  // Function to view a student's prospectus
// Function to view a student's prospectus
const viewStudentProspectus = async (student) => {
  setSelectedStudent(student);
  setSelectedCourse(student.course);
  setLoading(true);
  setSubjects([]); // Clear existing subjects
  
  try {
    console.log("Fetching prospectus for student:", student.docId, "Course:", student.course);
    
    // First, check if the prospectus exists for this student's course
    const courseRef = collection(db, 'Students', student.docId, 'Prospectus');
    const courseSnapshot = await getDocs(courseRef);
    
    if (courseSnapshot.empty) {
      console.log("No prospectus data found for this student");
      setLoading(false);
      return;
    }
    
    // Find the course document (should match the student's course)
    const courseDoc = courseSnapshot.docs.find(doc => doc.id === student.course);
    
    if (!courseDoc) {
      console.log(`No prospectus found for course: ${student.course}`);
      setLoading(false);
      return;
    }
    
    let allSubjects = [];
    
    // Get all years for this course
    const years = ["Year1", "Year2", "Year3", "Year4"];
    
    for (const yearName of years) {
      const yearNumber = parseInt(yearName.replace('Year', ''));
      console.log(`Processing ${yearName}`);
      
      // Get all semesters for this year
      const semestersRef = collection(db, 'Students', student.docId, 'Prospectus', student.course, yearName);
      const semestersSnapshot = await getDocs(semestersRef);
      
      if (semestersSnapshot.empty) {
        console.log(`No semesters found for ${yearName}`);
        continue;
      }
      
      // Process each semester
      for (const semesterDoc of semestersSnapshot.docs) {
        const semesterName = semesterDoc.id;
        let semesterNumber;
        
        if (semesterName === 'FirstSem') semesterNumber = 1;
        else if (semesterName === 'SecondSem') semesterNumber = 2;
        else if (semesterName === 'Summer') semesterNumber = 3;
        else continue; // Skip if not a valid semester
        
        console.log(`Processing ${semesterName} (Semester ${semesterNumber})`);
        
        // Get subjects collection for this semester
        const subjectsRef = collection(
          db, 
          'Students', 
          student.docId, 
          'Prospectus', 
          student.course,
          yearName, 
          semesterName,
          'Subjects'
        );
        
        const subjectsSnapshot = await getDocs(subjectsRef);
        
        console.log(`Found ${subjectsSnapshot.docs.length} subjects in ${yearName}/${semesterName}`);
        
        // Process each subject
        subjectsSnapshot.docs.forEach(subjectDoc => {
          const subjectData = subjectDoc.data();
          console.log(`Subject ${subjectDoc.id}:`, subjectData);
          
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
    
    console.log(`Total subjects loaded: ${allSubjects.length}`);
    
    // Sort subjects
    allSubjects.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.semester !== b.semester) return a.semester - b.semester;
      return a.code.localeCompare(b.code);
    });
    
    setSubjects(allSubjects);
    
    // Set default semester selection based on student's year level
    setSelectedSemester({ 
      year: parseInt(student.yearLevel) || 1, 
      semester: 1 
    });
    
  } catch (err) {
    console.error("Error fetching student prospectus:", err);
    alert("Failed to load student prospectus. Please try again.");
  } finally {
    setLoading(false);
  }
};
  
  // Function to add a new student
  const handleAddStudent = async () => {
    if (!newStudent.id || !newStudent.name || !newStudent.email || !newStudent.course || !newStudent.yearLevel) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create the student document
      const studentData = {
        ID: parseInt(newStudent.id),
        Name: newStudent.name.trim(),
        Email: newStudent.email.trim(),
        Course: newStudent.course,
        YearLevel: parseInt(newStudent.yearLevel)
      };
      
      // Check if student ID already exists
      const studentQuery = query(
        collection(db, 'Students'),
        where('ID', '==', parseInt(newStudent.id))
      );
      const existingStudents = await getDocs(studentQuery);
      
      if (!existingStudents.empty) {
        alert('A student with this ID already exists');
        setLoading(false);
        return;
      }
      
      // Add the student to Firestore
      const studentDocRef = await addDoc(collection(db, 'Students'), studentData);

      
      // After:
      await copyProgramToStudent(studentData.Course, studentDocRef.id);
      
      const newStudentWithId = {
        docId: studentDocRef.id,
        ...studentData,
        id: studentData.ID
      };
      
      
      setStudents([...students, newStudentWithId]);
      setNewStudent({ id: '', name: '', email: '', course: '', yearLevel: '' });
      setShowAddForm(false);
      
      alert('Student added successfully');
    } catch (err) {
      console.error("Error adding student:", err);
      alert('Failed to add student. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
// Function to copy program structure to student prospectus
async function copyProgramToStudent(courseCode, studentId) {
  const batch = writeBatch(db);
  let writeCount = 0;

  // 1) Create the courseCode doc under /Students/{id}/Prospectus
  const courseRef = doc(
    db,
    "Students",  studentId,
    "Prospectus", courseCode
  );
  batch.set(courseRef, { initialized: true }, { merge: true });
  writeCount++;

  const years = ["Year1", "Year2", "Year3", "Year4"];
  for (let year of years) {
    // 2) For each semester, create the semester doc
    const semDocs = await getDocs(
      collection(db,
        "Program", courseCode,
        year
      )
    );
    for (let semDoc of semDocs.docs) {
      const semester = semDoc.id; // FirstSem, SecondSem, Summer

      // 2a) create /…/Prospectus/{courseCode}/{year}/{semester}
      const semRef = doc(
        db,
        "Students",  studentId,
        "Prospectus", courseCode,
        year,          // ← subcollection name
        semester       // ← doc name
      );
      batch.set(semRef, { initialized: true }, { merge: true });
      writeCount++;

      // 3) copy each Subject under that semester
      const subjectsSnap = await getDocs(
        collection(db,
          "Program", courseCode,
          year, semester,
          "Subjects"
        )
      );
      for (let sub of subjectsSnap.docs) {
        const dest = doc(
          db,
          "Students",  studentId,
          "Prospectus", courseCode,
          year, semester,
          "Subjects",  sub.id
        );
        batch.set(dest, {
          ...sub.data(),
          Passed: false
        });
        writeCount++;

        if (writeCount >= 450) {
          await batch.commit();
          writeCount = 0;
        }
      }
    }
  }

  // final commit
  if (writeCount > 0) await batch.commit();
}
  
  // Handle subject passed status change
// Handle subject passed status change
const handlePassedChange = async (index, passed) => {
  if (!selectedStudent) return;
  
  try {
    const updatedSubjects = [...subjects];
    const subject = updatedSubjects[index];
    updatedSubjects[index].passed = passed;
    setSubjects(updatedSubjects);
    
    // Map semester number to name
    let semesterName;
    if (subject.semester === 1) semesterName = 'FirstSem';
    else if (subject.semester === 2) semesterName = 'SecondSem';
    else if (subject.semester === 3) semesterName = 'Summer';
    
    // Update the subject in Firestore using the correct path
    const subjectRef = doc(
      db, 
      'Students', 
      selectedStudent.docId, 
      'Prospectus', 
      selectedStudent.course,
      `Year${subject.year}`, 
      semesterName,
      'Subjects',
      subject.code
    );
    
    const batch = writeBatch(db);
    batch.update(subjectRef, { Passed: passed });
    await batch.commit();
  } catch (err) {
    console.error("Error updating subject status:", err);
    alert('Failed to update subject status. Please try again.');
  }
};

  // Get available years for the selected course
  const getAvailableYears = () => {
    if (!selectedCourse || !subjects.length) return [1];
    const years = [...new Set(subjects.map(subject => subject.year))];
    return years.sort((a, b) => a - b);
  };

  // Get available semesters for the selected year and course
  const getAvailableSemesters = (year) => {
    if (!selectedCourse || !subjects.length || !year) return [1];
    const semesters = [...new Set(subjects
      .filter(subject => subject.year === parseInt(year))
      .map(subject => subject.semester))];
    return semesters.sort((a, b) => a - b);
  };
  
  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      ((student.id !== undefined && student.id !== null) ? 
        student.id.toString().includes(searchTerm) : false);
    const matchesCourse = courseFilter ? student.course === courseFilter : true;
    const matchesYear = yearFilter ? student.yearLevel === parseInt(yearFilter) : true;
    
    return matchesSearch && matchesCourse && matchesYear;
  });
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentUser?.displayName}</h1>
            <p style={{ fontSize: '0.8rem' }}>Course Evaluator</p>
          </div>
          <div onClick={() => navigate('/evaluator-dashboard')} className="sidebar-item">🏠 Home</div>
          <div onClick={() => navigate('/course-evaluation')} className="sidebar-item">📅 Course Evaluation</div>
          <div onClick={() => navigate('/history')} className="sidebar-item">📄 Evaluation History</div>
          <div onClick={() => navigate('/student-archives')} className="sidebar-item active">📚 Student Archives</div>
        </div>
        <div className="logout-container">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        
        {loading && !showAddForm ? (
          <div className="loading-message">Loading student data...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="archives-container">
            {/* Students List Section */}
            <div className="students-section">
              <div className="students-header">
                <h3>Students List</h3>
                <div className="students-actions">
                  <button 
                    className="add-student-btn" 
                    onClick={() => setShowAddForm(true)}
                  >
                    Add Student
                  </button>
                </div>
              </div>
              
              {/* Search and Filters */}
              <div className="students-filters">
                <input
                  type="text"
                  placeholder="Search by name, email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                
                <div className="filter-controls">
                  <select 
                    value={courseFilter} 
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Courses</option>
                    {availablePrograms.map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={yearFilter} 
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Years</option>
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                    <option value="4">Fourth Year</option>
                  </select>
                </div>
              </div>
              
              {/* Students Table */}
              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Year</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <tr key={student.docId} className={selectedStudent?.docId === student.docId ? 'selected-row' : ''}>
                          <td>{student.id}</td>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.course}</td>
                          <td>{student.yearLevel}</td>
                          <td>
                            <button 
                              className="view-btn"
                              onClick={() => viewStudentProspectus(student)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-students">No students found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Program Quick Buttons */}
              <div className="program-buttons">
                <h4>Programs</h4>
                <div className="program-btn-container">
                  {availablePrograms.map(program => (
                    <button 
                      key={program}
                      className={`program-btn ${courseFilter === program ? 'active' : ''}`}
                      onClick={() => setCourseFilter(program)}
                    >
                      {program}
                    </button>
                  ))}
                  <button 
                    className={`program-btn ${courseFilter === '' ? 'active' : ''}`}
                    onClick={() => setCourseFilter('')}
                  >
                    All Programs
                  </button>
                </div>
              </div>
            </div>
            
            {/* Add Student Form */}
            {showAddForm && (
              <div className="add-student-overlay">
                <div className="add-student-form">
                  <h3>Add New Student</h3>

                  <div className="form-group">
                    <label htmlFor="student-id">ID Number</label>
                    <input
                      id="student-id"
                      type="text"
                      value={newStudent.id}
                      onChange={(e) => setNewStudent({...newStudent, id: e.target.value})}
                      placeholder="Enter student ID"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="student-name">Name</label>
                    <input
                      id="student-name"
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      placeholder="Enter student name"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="student-email">Email</label>
                    <input
                      id="student-email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                      placeholder="Enter student email"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="student-course">Course</label>
                    <select
                      id="student-course"
                      value={newStudent.course}
                      onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
                      disabled={loading}
                    >
                      <option value="">Select Course</option>
                      {availablePrograms.map(program => (
                        <option key={program} value={program}>{program}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="student-year">Year Level</label>
                    <select
                      id="student-year"
                      value={newStudent.yearLevel}
                      onChange={(e) => setNewStudent({...newStudent, yearLevel: e.target.value})}
                      disabled={loading}
                    >
                      <option value="">Select Year Level</option>
                      <option value="1">First Year</option>
                      <option value="2">Second Year</option>
                      <option value="3">Third Year</option>
                      <option value="4">Fourth Year</option>
                    </select>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="cancel-btn" 
                      onClick={() => setShowAddForm(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      className="save-btn" 
                      onClick={handleAddStudent}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Student"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Prospectus Display */}
            {selectedStudent && selectedCourse && (
              <div className="prospectus-section">
                <div className="prospectus-header">
                  <h3>Student Prospectus</h3>
                  <div className="student-info">
                    <p><strong>Name:</strong> {selectedStudent.name}</p>
                    <p><strong>Email:</strong> {selectedStudent.email}</p>
                    <p><strong>Course:</strong> {selectedStudent.course}</p>
                    <p><strong>Year Level:</strong> {selectedStudent.yearLevel}</p>
                  </div>
                  
                  {/* View mode selector */}
                  <div className="view-mode-selector">
                    <button 
                      className={`view-mode-button ${viewMode === 'all' ? 'active' : ''}`}
                      onClick={() => setViewMode('all')}
                    >
                      All Semesters
                    </button>
                    <button 
                      className={`view-mode-button ${viewMode === 'semester' ? 'active' : ''}`}
                      onClick={() => setViewMode('semester')}
                    >
                      By Semester
                    </button>
                  </div>
                  
                  {viewMode === 'semester' && (
                    <div className="semester-selector">
                      <select 
                        value={selectedSemester.year}
                        onChange={(e) => setSelectedSemester({...selectedSemester, year: parseInt(e.target.value)})}
                        className="semester-select"
                      >
                        {getAvailableYears().map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                      
                      <select 
                          value={selectedSemester.semester}
                          onChange={(e) => setSelectedSemester({...selectedSemester, semester: parseInt(e.target.value)})}
                          className="semester-select"
                        >
                          {getAvailableSemesters(selectedSemester.year).map(semester => (
                            <option key={semester} value={semester}>
                              {semester === 1 ? 'First Semester' : 
                              semester === 2 ? 'Second Semester' : 
                              semester === 3 ? 'Summer' : ''}
                            </option>
                          ))}
                        </select>
                    </div>
                  )}
                </div>
                
                {viewMode === 'all' ? (
  /* Display all years and semesters */
  <div className="all-semesters-view">
    {[1, 2, 3, 4].map(year => {
      const yearSubjects = subjects.filter(subject => subject.year === year);
      if (yearSubjects.length === 0) return null;
      
      return (
        <div key={year} className="academic-year">
          <h4>Year {year}</h4>
          
          {[1, 2, 3].map(semester => { // Changed to include semester 3 (Summer)
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
                      <th>Passed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semesterSubjects.map((subject, index) => (
                      <tr key={subject.code} className={subject.passed ? 'passed-subject' : ''}>
                        <td>{subject.code}</td>
                        <td>{subject.description}</td>
                        <td>{subject.units}</td>
                        <td>
                          <div className="checkbox-container">
                            <input 
                              type="checkbox" 
                              id={`passed-${subject.code}`}
                              checked={subject.passed}
                              onChange={(e) => {
                                // Update local state only, don't save to DB yet
                                const updatedSubjects = [...subjects];
                                const idx = subjects.indexOf(subject);
                                updatedSubjects[idx].passed = e.target.checked;
                                setSubjects(updatedSubjects);
                              }}
                              className="passed-checkbox"
                            />
                            <label htmlFor={`passed-${subject.code}`} className="checkbox-label">
                            </label>
                          </div>
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
) : (
  /* Display only selected semester */
  <div className="single-semester-view">
    <div className="semester-block">
      <h4>Year {selectedSemester.year} - {
        selectedSemester.semester === 1 ? 'First Semester' : 
        selectedSemester.semester === 2 ? 'Second Semester' : 'Summer'
      }</h4>
      
      <table className="subjects-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Description</th>
            <th>Units</th>
            <th>Passed</th>
          </tr>
        </thead>
        <tbody>
          {subjects
            .filter(subject => 
              subject.year === selectedSemester.year && 
              subject.semester === selectedSemester.semester
            )
            .map((subject, index) => (
              <tr key={subject.code} className={subject.passed ? 'passed-subject' : ''}>
                <td>{subject.code}</td>
                <td>{subject.description}</td>
                <td>{subject.units}</td>
                <td>
                  <div className="checkbox-container">
                    <input 
                      type="checkbox" 
                      id={`passed-sem-${subject.code}`}
                      checked={subject.passed}
                      onChange={(e) => {
                        // Update local state only, don't save to DB yet
                        const updatedSubjects = [...subjects];
                        const idx = subjects.indexOf(subject);
                        updatedSubjects[idx].passed = e.target.checked;
                        setSubjects(updatedSubjects);
                      }}
                      className="passed-checkbox"
                    />
                    <label htmlFor={`passed-sem-${subject.code}`} className="checkbox-label">
                    </label>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
)}
                
                {/* Summary Section */}
                <div className="summary-section">
                  <h4>Summary</h4>
                  <div className="summary-stats">
                    <div className="stat-box">
                      <span className="stat-label">Total Subjects</span>
                      <span className="stat-value">{subjects.length}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Passed</span>
                      <span className="stat-value">{subjects.filter(s => s.passed).length}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Not Passed</span>
                      <span className="stat-value">{subjects.filter(s => !s.passed).length}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="action-buttons">

                <button 
                  className="action-button save" 
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const batch = writeBatch(db);
                      let batchCount = 0;

                      // Save all subjects to Firestore
                      for (const subject of subjects) {
                        // Map semester number to name
                        let semesterName;
                        if (subject.semester === 1) semesterName = 'FirstSem';
                        else if (subject.semester === 2) semesterName = 'SecondSem';
                        else if (subject.semester === 3) semesterName = 'Summer';
                        
                        const subjectRef = doc(
                          db, 
                          'Students', 
                          selectedStudent.docId, 
                          'Prospectus', 
                          selectedStudent.course,
                          `Year${subject.year}`, 
                          semesterName,
                          'Subjects',
                          subject.code
                        );
                        
                        batch.update(subjectRef, { Passed: subject.passed });
                        batchCount++;
                        
                        // Firestore batches are limited to 500 operations
                        if (batchCount >= 450) {
                          await batch.commit();
                          batchCount = 0;
                        }
                      }
                      
                      // Commit any remaining operations
                      if (batchCount > 0) {
                        await batch.commit();
                      }
                      
                      alert("Changes saved successfully.");
                    } catch (err) {
                      console.error("Error saving changes:", err);
                      alert("Failed to save changes. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Save Changes
                </button>

                <button 
                      className="action-button reset" 
                      onClick={async () => {
                        if (confirm("Are you sure you want to reset all subjects to 'Not Passed'?")) {
                          try {
                            setLoading(true);
                            const batch = writeBatch(db);
                            let batchCount = 0;

                            // Update all subjects in Firestore
                            for (const subject of subjects) {
                              // Map semester number to name
                              let semesterName;
                              if (subject.semester === 1) semesterName = 'FirstSem';
                              else if (subject.semester === 2) semesterName = 'SecondSem';
                              else if (subject.semester === 3) semesterName = 'Summer';
                              
                              const subjectRef = doc(
                                db, 
                                'Students', 
                                selectedStudent.docId, 
                                'Prospectus', 
                                selectedStudent.course,
                                `Year${subject.year}`, 
                                semesterName,
                                'Subjects',
                                subject.code
                              );
                              
                              batch.update(subjectRef, { Passed: false });
                              batchCount++;
                              
                              // Firestore batches are limited to 500 operations
                              if (batchCount >= 450) {
                                await batch.commit();
                                batchCount = 0;
                              }
                            }
                            
                            // Commit any remaining operations
                            if (batchCount > 0) {
                              await batch.commit();
                            }
                            
                            // Update local state
                            const resetSubjects = subjects.map(s => ({...s, passed: false}));
                            setSubjects(resetSubjects);
                            
                            alert("All subjects have been reset.");
                          } catch (err) {
                            console.error("Error resetting subjects:", err);
                            alert("Failed to reset subjects. Please try again.");
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                    >
                      Reset Status
                    </button>
                  

                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline Styles */}
      <style>{`
        .loading-message {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-size: 1.2rem;
          color: #666;
        }
        
        .error-message {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-size: 1.2rem;
          color: red;
          text-align: center;
          padding: 0 20px;
        }
        
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
          height: 105%;
        }
        
        /* Archives Container */
        .archives-container {
          display: flex;
          gap: 20px;
          height: calc(100vh - 100px);
        }
        
        /* Students Section */
        .students-section {
          flex: 1;
          max-width: max-content;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 105%;
        }
        
        .students-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .add-student-btn {
          background-color: ${coralColor};
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 15px;
          cursor: pointer;
          font-weight: bold;
          transition: opacity 0.2s;
        }
        
        .add-student-btn:hover {
          opacity: 0.9;
        }
        
        .students-filters {
          margin-bottom: 15px;
        }
        
        .search-input {
          width: 96.3%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }
        .filter-controls {
          display: flex;
          gap: 10px;
        }
        
        .filter-select {
          flex: 1;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
        }
        
        /* Students Table */
        .students-table-container {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 15px;
          border: 1px solid #eee;
          border-radius: 4px;
        }
        
        .students-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .students-table th {
          background-color: #f5f5f5;
          padding: 10px;
          text-align: left;
          font-weight: bold;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        
        .students-table td {
          padding: 10px;
          border-top: 1px solid #eee;
        }
        
        .students-table tr:hover {
          background-color: #f9f9f9;
        }
        
        .students-table .selected-row {
          background-color: #f0f7ff;
        }
        
        .view-btn {
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 5px 10px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        .view-btn:hover {
          background-color: #3a80d2;
        }
        
        .no-students {
          text-align: center;
          padding: 20px;
          color: #888;
        }
        
        /* Program Quick Buttons */
        .program-buttons {
          margin-top: auto;
        }
        
        .program-buttons h4 {
          margin-bottom: 10px;
        }
        
        .program-btn-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .program-btn {
          background-color: gray;
          border: none;
          border-radius: 4px;
          padding: 8px 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .program-btn:hover {
          background-color: #e0e0e0;
        }
        
        .program-btn.active {
          background-color: ${coralColor};
          color: white;
        }
        
        /* Add Student Form */
        .add-student-overlay {
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
        
        .add-student-form {
          background-color: white;
          border-radius: 8px;
          padding: 25px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .add-student-form h3 {
          margin-top: 0;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-group input,
        .form-group select {
          width: 95%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .cancel-btn {
          background-color: #f0f0f0;
          border: none;
          border-radius: 4px;
          padding: 10px 15px;
          cursor: pointer;
        }
        
        .save-btn {
          background-color: ${coralColor};
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 15px;
          cursor: pointer;
        }
        
        /* Prospectus Section */
        .prospectus-section {
          flex: 2;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 105%;
          overflow-y: auto;
        }
        
        .prospectus-header {
          margin-bottom: 20px;
        }
        
        .student-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 6px;
        }
        
        .student-info p {
          margin: 0;
        }
        
        .view-mode-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .view-mode-button {
          background-color: #8e8e93;
          border: none;
          border-radius: 4px;
          padding: 8px 15px;
          cursor: pointer;
          flex: 1;
          transition: all 0.2s;
        }
        
        .view-mode-button:hover {
          background-color: #e0e0e0;
        }
        
        .view-mode-button.active {
          background-color: ${coralColor};
          color: white;
        }
        
        .semester-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .semester-select {
          flex: 1;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        /* Subjects Tables */
        .all-semesters-view,
        .single-semester-view {
          flex: 1;
          overflow-y: auto;
        }
        
        .academic-year {
          margin-bottom: 25px;
        }
        
        .academic-year h4 {
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
        }
        
        .semester-block {
          margin-bottom: 20px;
        }
        
        .semester-block h5 {
          margin-bottom: 10px;
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
          font-weight: bold;
        }
        
        .subjects-table td {
          padding: 10px;
          border-top: 1px solid #eee;
        }
        
        .passed-subject {
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        /* Checkbox styling */
        .checkbox-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .passed-checkbox {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        
        .checkbox-label {
          position: relative;
          cursor: pointer;
          font-size: 22px;
          user-select: none;
          width: 20px;
          height: 20px;
          display: inline-block;
          border: 2px solid #ccc;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .passed-checkbox:checked + .checkbox-label {
          background-color: #4CAF50;
          border-color: #4CAF50;
        }
        
        .passed-checkbox:checked + .checkbox-label:after {
          content: "";
          position: absolute;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        
        /* Summary Section */
        .summary-section {
          margin-top: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 6px;
        }
        
        .summary-section h4 {
          margin-top: 0;
          margin-bottom: 15px;
        }
        
        .summary-stats {
          display: flex;
          gap: 15px;
        }
        
        .stat-box {
          flex: 1;
          background-color: white;
          padding: 15px;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
        
        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .action-button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: opacity 0.2s;
        }
        
        .action-button.save {
          background-color: #4CAF50;
          color: white;
        }
        
        .action-button.print {
          background-color: #2196F3;
          color: white;
        }
        
        .action-button.reset {
          background-color: #f44336;
          color: white;
        }
        
        .action-button:hover {
          opacity: 0.7;
        }
        
        /* Print styles */
        @media print {
          .sidebar, .students-section, .add-student-btn, .action-buttons {
            display: none;
          }
          
          .main-content {
            padding: 0;
          }
          
          .prospectus-section {
            box-shadow: none;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentArchives;