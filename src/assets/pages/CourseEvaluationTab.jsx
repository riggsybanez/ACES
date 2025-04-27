// CourseEvaluationTab.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/authService';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  writeBatch,
  serverTimestamp, 
  query, 
  where 
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';
import { createWorker } from 'tesseract.js';

const coralColor = 'rgba(255,79,78,255)';

const STAGES = {
  UPLOAD: "upload",
  EXTRACTION: "extraction",
  RESULTS: "results",
  REVIEW: "review",
};

// University of Mindanao grading system
const ADDU_GRADING = {
  'A': 4.0, 
  'B+': 3.5,
  'B': 3.0, 
  'C+': 2.5,
  'C': 2.0, 
  'D': 1.0,
  'F': 0, 
  'FD': 0
};

const MIN_PASSING_GRADE = 1.0; // C+ or better

export default function CourseEvaluationTab() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState(STAGES.UPLOAD);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentNameError, setStudentNameError] = useState("");
  const [program, setProgram] = useState("BSCS");
  const [university, setUniversity] = useState("University of Mindanao");
  const [extractedCourses, setExtractedCourses] = useState([]);
  const [evaluatedCourses, setEvaluatedCourses] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProspectus, setShowProspectus] = useState(false);
  const [prospectusData, setProspectusData] = useState({});
  const [currentProspectus, setCurrentProspectus] = useState([]);
  const [selectedYear, setSelectedYear] = useState("Year1");
  const [selectedSemester, setSelectedSemester] = useState("FirstSem");
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [semesterDropdownOpen, setSemesterDropdownOpen] = useState(false);
  const [rawOcrText, setRawOcrText] = useState("");
  const [yearLevelSelection, setYearLevelSelection] = useState(1);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  
  const workerRef = useRef(null);
  
  // Email validation function
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Handle email change with validation
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail && !isValidEmail(newEmail)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };
  
  // Handle name change
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setStudentName(newName);
    
    if (newName.trim() === "") {
      setStudentNameError("Student name is required");
    } else {
      setStudentNameError("");
    }
  };
  

// Check if email or student name already exists in the database
const checkForDuplicates = async () => {
  if (!email || !studentName || emailError) return false;
  
  setIsCheckingDuplicates(true);
  try {
    // Check for email duplicates
    const emailQuery = query(
      collection(db, "Students"),
      where("Email", "==", email)
    );
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      // Don't proceed if email exists
      alert(`A student with email "${email}" already exists in the database.`);
      return false;
    }
    
    // Check for name duplicates
    const nameQuery = query(
      collection(db, "Students"),
      where("Name", "==", studentName)
    );
    const nameSnapshot = await getDocs(nameQuery);
    
    if (!nameSnapshot.empty) {
      // Don't proceed if name exists
      alert(`A student named "${studentName}" already exists in the database.`);
      return false;
    }
    
    return true; // No duplicates found
  } catch (error) {
    console.error("Error checking for duplicates:", error);
    alert("Error checking for duplicates. Please try again.");
    return false;
  } finally {
    setIsCheckingDuplicates(false);
  }
};
  
  // Initialize Tesseract worker
  useEffect(() => {
    const initWorker = async () => {
      workerRef.current = await createWorker('eng');
    };
    
    initWorker();
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Check session storage for any saved evaluation data
  useEffect(() => {
    const savedData = sessionStorage.getItem('evaluationData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.extractedCourses) setExtractedCourses(parsedData.extractedCourses);
        if (parsedData.evaluatedCourses) setEvaluatedCourses(parsedData.evaluatedCourses);
        if (parsedData.rawOcrText) setRawOcrText(parsedData.rawOcrText);
        if (parsedData.email) setEmail(parsedData.email);
        if (parsedData.studentName) setStudentName(parsedData.studentName);
        if (parsedData.program) setProgram(parsedData.program);
        if (parsedData.university) setUniversity(parsedData.university);
        if (parsedData.yearLevelSelection) setYearLevelSelection(parsedData.yearLevelSelection);
        
        // If we have evaluated courses, go directly to extraction stage
        if (parsedData.evaluatedCourses && parsedData.evaluatedCourses.length > 0) {
          setStage(STAGES.EXTRACTION);
          setShowProspectus(true);
        }
      } catch (error) {
        console.error("Error parsing saved evaluation data:", error);
      }
    }
  }, []);

 // Fetch all prospectus data for the selected program
useEffect(() => {
  const fetchAllProspectusData = async () => {
    try {
      const data = {};
      const years = ["Year1", "Year2", "Year3", "Year4"];
      
      for (const year of years) {
        data[year] = {};
        
        try {
          // Get all semesters for this year
          const semestersRef = collection(db, `Program/${program}/${year}`);
          const semestersSnapshot = await getDocs(semestersRef);
          
          if (!semestersSnapshot.empty) {
            for (const semesterDoc of semestersSnapshot.docs) {
              const semesterId = semesterDoc.id;
              data[year][semesterId] = [];
              
              try {
                // Get all subjects for this semester
                const subjectsRef = collection(db, `Program/${program}/${year}/${semesterId}/Subjects`);
                const subjectsSnapshot = await getDocs(subjectsRef);
                
                subjectsSnapshot.docs.forEach(subjectDoc => {
                  data[year][semesterId].push({
                    code: subjectDoc.id,
                    ...subjectDoc.data()
                  });
                });
              } catch (subjectError) {
                console.warn(`Error fetching subjects for ${program}/${year}/${semesterId}:`, subjectError);
              }
            }
          }
        } catch (semesterError) {
          console.warn(`Error fetching semesters for ${program}/${year}:`, semesterError);
        }
      }
      
      setProspectusData(data);
      console.log("Prospectus data loaded:", data);
    } catch (error) {
      console.error("Error fetching prospectus data:", error);
    }
  };
  
  if (program) {
    fetchAllProspectusData();
  }
}, [program]);

  // Update current prospectus when year/semester selection changes
  useEffect(() => {
    if (prospectusData && prospectusData[selectedYear] && prospectusData[selectedYear][selectedSemester]) {
      setCurrentProspectus(prospectusData[selectedYear][selectedSemester]);
    } else {
      setCurrentProspectus([]);
    }
  }, [prospectusData, selectedYear, selectedSemester]);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
    }
  };

// Process image with OCR
const processImage = async () => {
  if (!file || !workerRef.current) return null;
  
  try {
    const { data } = await workerRef.current.recognize(file);
    console.log("Raw OCR Text:", data.text); // Log the raw OCR text
    return data.text;
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
};

// Clean and process OCR text
// Clean and process OCR text based on university format
const processOcrText = (text) => {
  // Store raw text for debugging
  setRawOcrText(text);
  
  // Split text into lines and filter out empty lines
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Select the appropriate parsing function based on university
  switch (university) {
    case "Ateneo de Davao University":
      return parseAteneoDavaoTranscript(lines);
    case "University of Mindanao":
      return parseUniversityOfMindanaoTranscript(lines);
    case "Holy Cross of Davao College":
      return parseHolyCrossTranscript(lines);
    default:
      // Default parsing as fallback
      return parseGenericTranscript(lines);
  }
};

// Parser for Ateneo de Davao University transcripts
const parseAteneoDavaoTranscript = (lines) => {
  const courses = [];
  let inCourseSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if we're entering a semester section
    if (line.includes("Semester") && line.includes("-")) {
      inCourseSection = true;
      continue;
    }
    
    // Check if we're at the end of the course sections
    if (line.includes("Transcript Closed") || line.includes("XeXeXoXeXo")) {
      inCourseSection = false;
      continue;
    }
    
    // Only process lines when we're in a course section
    if (inCourseSection) {
      // Try to identify course codes in various formats
      const codeMatch = line.match(/^(\s*[A-Za-z]{2,5}\s*\d{3,5}[A-Za-z]*)/);
      
      if (codeMatch) {
        const courseCode = codeMatch[1].trim();
        // Remove the course code from the line
        let remaining = line.substring(codeMatch[0].length).trim();
        
        // For Ateneo format, let's extract the grade and credits
        let grade = '';
        let credits = ''; // Default to empty string
        
        // Special case for "FD w" or "FD rE" patterns at the end
        const fdWithLetterMatch = remaining.match(/\s+FD\s+([a-zA-Z]{1,2})$/);
        if (fdWithLetterMatch) {
          grade = 'FD';
          // Remove the pattern from the remaining text
          remaining = remaining.substring(0, remaining.lastIndexOf(fdWithLetterMatch[0])).trim();
          console.log(`Found FD with letter pattern. Grade set to FD. Remaining: ${remaining}`);
        }
        
        // First, try to extract known valid grades if not already found
        if (!grade) {
          // Look for valid grade pattern (A, B+, B, C+, C, D, F, FD, W) at the end or followed by a number
          const gradeMatch = remaining.match(/\s+(A|B\+|B|C\+|C|D|F|FD|W)\s*(\d+(?:\.\d+)?)?$/i);
          
          if (gradeMatch) {
            grade = gradeMatch[1].toUpperCase();
            
            // If there's a number after the grade, it's the credits
            if (gradeMatch[2]) {
              credits = gradeMatch[2].trim();
            }

            // Remove the grade and credits from the remaining text
            remaining = remaining.substring(0, remaining.lastIndexOf(gradeMatch[0])).trim();
          } else {
            // If no clear grade+credit pattern, look for just a grade at the end
            const soloGradeMatch = remaining.match(/\s+(A|B\+|B|C\+|C|D|F|FD|W)$/i);

            if (soloGradeMatch) {
              grade = soloGradeMatch[1].toUpperCase();
              // Remove the grade from the remaining text
              remaining = remaining.substring(0, remaining.lastIndexOf(soloGradeMatch[0])).trim();
            }
          }
        }
        
        // Look for a number at the end which would be credits
        if (credits === '') {
          const creditMatch = remaining.match(/\s+(\d+(?:\.\d+)?)$/);

          if (creditMatch) {
            credits = creditMatch[1];
            // Remove the credits from the remaining text
            remaining = remaining.substring(0, remaining.lastIndexOf(creditMatch[0])).trim();
          }
        }
        
        // Clean up the description
        let description = remaining.trim();
        
        // Add the course
        const newCourse = {
          code: courseCode,
          description: description,
          credits: (credits === '' || credits === '-') ? '' : parseFloat(credits) || 0,
          grade: grade,
          status: 'pending',
          remarks: ''
        };
        
        // If both grade and credits are blank, mark as "not credited"
        if (grade === '' && (credits === '' || credits === 0)) {
          newCourse.status = 'not-credited';
          newCourse.remarks = 'No credits found';
        }
        
        courses.push(newCourse);
        
        // Debug logging
        console.log(`Parsed course: ${courseCode} | ${description} | Grade: ${grade} | Credits: ${credits}`);
      } else {
        // Check if this might be a continuation of the previous course description
        // or a course with unusual formatting
        
        // For now, log these lines for debugging
        console.log(`Could not parse course code from line: ${line}`);
      }
    }
  }
  
  // Additional validation and cleanup
  const validCourses = courses.filter(course => {
    // Keep courses that have at least a code
    return course.code && course.code.trim() !== '';
  });
  
  return validCourses;
};

// Parser for University of Mindanao transcripts
const parseUniversityOfMindanaoTranscript = (lines) => {
  const courses = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for patterns that might indicate a course line
    const codeMatch = line.match(/^([A-Z]{2,4}\s*\d{3,4}[A-Z]?)/);
    
    if (codeMatch) {
      const courseCode = codeMatch[1].trim();
      let description = line.substring(codeMatch[0].length).trim();
      let credits = '';
      let grade = '';
      
      // For UM, the grade is often at the end, followed by credits
      // First look for grade at the end of the line
      const gradeMatch = description.match(/\s+(A|B\+|B|C\+|C|D|F|FD)$/i);
      
      if (gradeMatch) {
        grade = gradeMatch[1].toUpperCase();
        // Remove the grade from the description
        description = description.substring(0, description.lastIndexOf(gradeMatch[0])).trim();
      }
      
      // Look for credits (typically a number before the grade)
      const creditsMatch = description.match(/\s+(\d+(?:\.\d+)?)$/);
      
      if (creditsMatch) {
        credits = creditsMatch[1];
        // Remove the credits from the description
        description = description.substring(0, description.lastIndexOf(creditsMatch[0])).trim();
      }
      
      // If no grade found yet, check the next line
      if (!grade && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const standAloneGradeMatch = nextLine.match(/^(A|B\+|B|C\+|C|D|F|FD)$/i);
        
        if (standAloneGradeMatch) {
          grade = standAloneGradeMatch[1].toUpperCase();
          i++; // Skip the next line
        }
      }
      
      courses.push({
        code: courseCode,
        description: description,
        credits: credits === '' ? 0 : parseFloat(credits) || 0,
        grade: grade,
        status: 'pending',
        remarks: ''
      });
    }
  }
  
  return courses;
};

// Parser for Holy Cross of Davao College transcripts
const parseHolyCrossTranscript = (lines) => {
  // Implement specific parsing for Holy Cross format
  // This is a placeholder - adjust based on actual format
  return parseGenericTranscript(lines);
};

// Generic transcript parser as fallback
const parseGenericTranscript = (lines) => {
  const courses = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Basic pattern matching for course code at start of line
    const codeMatch = line.match(/^([A-Z]{2,4}\s*\d{3,4}[A-Z]?)/);
    
    if (codeMatch) {
      const courseCode = codeMatch[1].trim();
      let remaining = line.substring(codeMatch[0].length).trim();
      
      // Try various patterns to extract grade and credits
      let grade = '';
      let credits = '';
      let description = remaining;
      
      // Try to find a grade (A, B+, B, C+, C, D, F, FD) anywhere in the line
      const gradeMatches = remaining.match(/(A|B\+|B|C\+|C|D|F|FD)/gi);
      if (gradeMatches && gradeMatches.length > 0) {
        // Take the last match as the grade
        grade = gradeMatches[gradeMatches.length - 1].toUpperCase();
        
        // Try to remove the grade from the description
        const parts = remaining.split(new RegExp(`\\s+${grade}\\s+`, 'i'));
        if (parts.length > 1) {
          description = parts[0].trim();
          
          // Look for credits after the grade
          const afterGrade = parts[1].trim();
          const creditMatch = afterGrade.match(/^(\d+(?:\.\d+)?)/);
          if (creditMatch) {
            credits = creditMatch[1];
          }
        }
      }
      
      // If no credits found yet, look for numbers
      if (!credits) {
        const numberMatches = remaining.match(/\d+(?:\.\d+)?/g);
        if (numberMatches && numberMatches.length > 0) {
          // Take the last number as credits
          credits = numberMatches[numberMatches.length - 1];
        }
      }
      
      courses.push({
        code: courseCode,
        description: description,
        credits: credits === '' ? 0 : parseFloat(credits) || 0,
        grade: grade,
        status: 'pending',
        remarks: ''
      });
    }
  }
  
  return courses;
};

  // Convert letter grade to GPA based on university
  const getGradeValue = (grade) => {
    if (!grade) return null;
    
    if (university === "Ateneo de Davao University") {
      return ADDU_GRADING[grade] || null;
    }
    
    // Add other universities' grading systems as needed
    return null;
  };

  // Check if a course is passed based on grade
  const isCoursePassed = (grade) => {
    if (!grade) return false;
    
    const gradeValue = getGradeValue(grade);
    if (gradeValue === null) return false;
    
    return gradeValue >= MIN_PASSING_GRADE;
  };

  // Find matching course in prospectus
  const findMatchingCourse = (courseCode, courseDesc) => {
    // Normalize inputs for better matching
    const normalizedCode = courseCode.replace(/\s+/g, '').toUpperCase();
    const normalizedDesc = courseDesc.toLowerCase();
    
    // Search through all prospectus data
    for (const yearId in prospectusData) {
      for (const semesterId in prospectusData[yearId]) {
        const subjects = prospectusData[yearId][semesterId];
        
        for (const subject of subjects) {
          // Normalize subject data
          const subjectCode = subject.code.replace(/\s+/g, '').toUpperCase();
          const subjectDesc = (subject.CourseDescription || '').toLowerCase();
          
          // Check for code match (primary)
          if (subjectCode === normalizedCode) {
            return { ...subject, yearId, semesterId };
          }
          
          // Check for description similarity (secondary)
          if (normalizedDesc && subjectDesc && 
              (normalizedDesc.includes(subjectDesc) || subjectDesc.includes(normalizedDesc))) {
            return { ...subject, yearId, semesterId };
          }
        }
      }
    }
    
    return null;
  };

  // Evaluate extracted courses against prospectus
  const evaluateCourses = (courses) => {
    return courses.map(course => {
      // If the course is already marked as not-credited, preserve that status
      if (course.status === 'not-credited') {
        return {
          ...course,
          passed: false,
          inProspectus: false
        };
      }
      
      // Otherwise, determine if course is passed based on grade
      const isPassed = isCoursePassed(course.grade);
      
      // Find matching course in prospectus
      const matchingCourse = findMatchingCourse(course.code, course.description);
      
      if (matchingCourse) {
        return {
          ...course,
          status: isPassed ? 'passed' : 'failed',
          matchedTo: matchingCourse.code,
          yearId: matchingCourse.yearId,
          semesterId: matchingCourse.semesterId,
          passed: isPassed,
          inProspectus: true
        };
      } else {
        return {
          ...course,
          status: isPassed ? 'passed' : 'failed',
          passed: isPassed,
          inProspectus: false,
          remarks: course.remarks || ''
        };
      }
    });
  };

  const handleExtract = async () => {
    // Validate inputs
    if (!file) {
      alert("Please upload a transcript file.");
      return;
    }
    
    if (!studentName.trim()) {
      setStudentNameError("Student name is required");
      return;
    }
    
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    // Check for duplicates before proceeding
    const canProceed = await checkForDuplicates();
    if (!canProceed) return;
    
    try {
      setIsProcessing(true);
      
      // Process with OCR
      const ocrText = await processImage();
      if (!ocrText) {
        throw new Error("Failed to extract text from image");
      }
      
      // Process extracted text
      const extractedCourses = processOcrText(ocrText);
      setExtractedCourses(extractedCourses);
      
      // Evaluate courses
      const evaluated = evaluateCourses(extractedCourses);
      setEvaluatedCourses(evaluated);
      
      // Save to session storage
      const evaluationData = {
        extractedCourses,
        evaluatedCourses: evaluated,
        rawOcrText,
        email,
        studentName,
        program,
        university,
        yearLevelSelection
      };
      sessionStorage.setItem('evaluationData', JSON.stringify(evaluationData));
      
      setStage(STAGES.EXTRACTION);
      setShowProspectus(true);
    } catch (error) {
      console.error("Extraction error:", error);
      alert(`Error during extraction: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemarkChange = (index, value) => {
    const updatedCourses = [...evaluatedCourses];
    updatedCourses[index].remarks = value;
    setEvaluatedCourses(updatedCourses);
    
    // Update session storage
    const evaluationData = JSON.parse(sessionStorage.getItem('evaluationData') || '{}');
    evaluationData.evaluatedCourses = updatedCourses;
    sessionStorage.setItem('evaluationData', JSON.stringify(evaluationData));
  };

  const handleStatusChange = (index, passed) => {
    const updatedCourses = [...evaluatedCourses];
    updatedCourses[index].passed = passed;
    updatedCourses[index].status = passed ? 'passed' : 'failed';
    setEvaluatedCourses(updatedCourses);
    
    // Update session storage
    const evaluationData = JSON.parse(sessionStorage.getItem('evaluationData') || '{}');
    evaluationData.evaluatedCourses = updatedCourses;
    sessionStorage.setItem('evaluationData', JSON.stringify(evaluationData));
  };

  const saveEvaluation = async () => {
    if (!studentName || !email || !program) {
      alert("Missing required information");
      return;
    }
    
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // 1. Create evaluation history record
      const evaluationData = {
        StudentName: studentName,
        Course: program,
        YearLevel: yearLevelSelection,
        Email: email,
        EvaluatorName: currentUser.displayName || "Unknown Evaluator",
        EvaluationDate: serverTimestamp(),
        University: university,
        Courses: evaluatedCourses.map(course => ({
          Code: course.code,
          Description: course.description,
          Credits: course.credits,
          Grade: course.grade,
          Status: course.status,
          Passed: course.passed || false,
          Remarks: course.remarks || ''
        }))
      };
      
      const evaluationRef = await addDoc(collection(db, "EvaluationHistory"), evaluationData);
      
      // 2. Create or update student record with prospectus
      // Check if student already exists
      const studentQuery = query(
        collection(db, "Students"),
        where("Email", "==", email)
      );
      const studentSnapshot = await getDocs(studentQuery);
      
      let studentId;
      
      if (studentSnapshot.empty) {
        // Create new student
        const studentDoc = await addDoc(collection(db, "Students"), {
          Name: studentName,
          Email: email,
          Course: program,
          YearLevel: yearLevelSelection,
          CreatedAt: serverTimestamp()
        });
        studentId = studentDoc.id;
      } else {
        // Use existing student
        studentId = studentSnapshot.docs[0].id;
        
        // Update student info
        const studentDoc = doc(db, "Students", studentId);
        await setDoc(studentDoc, {
          Name: studentName,
          Course: program,
          YearLevel: yearLevelSelection,
          UpdatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      // 3. Copy program structure to student and mark passed courses
      await copyProgramToStudent(program, studentId, evaluatedCourses);
      
      // Clear session storage after successful save
      sessionStorage.removeItem('evaluationData');
      
      alert("Evaluation saved successfully!");
      setStage(STAGES.UPLOAD);
      resetForm();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      alert(`Error saving evaluation: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };


// Copy program structure to student and mark passed courses
const copyProgramToStudent = async (courseCode, studentId, evaluatedCourses) => {
  const batch = writeBatch(db);
  let writeCount = 0;
  let batchCommits = 0;

  console.log(`Starting copy of program ${courseCode} to student ${studentId}`);

  // Create the courseCode doc under /Students/{id}/Prospectus
  const courseRef = doc(db, "Students", studentId, "Prospectus", courseCode);
  batch.set(courseRef, { initialized: true }, { merge: true });
  writeCount++;

  // Map of passed courses for quick lookup
  const passedCourses = {};
  evaluatedCourses.forEach(course => {
    if (course.passed && course.matchedTo) {
      passedCourses[course.matchedTo] = true;
    }
  });

  console.log(`Passed courses:`, passedCourses);

  // Copy program structure directly from Firestore
  const years = ["Year1", "Year2", "Year3", "Year4"];
  for (let year of years) {
    try {
      // Get all semesters for this year
      const semestersRef = collection(db, `Program/${courseCode}/${year}`);
      const semestersSnapshot = await getDocs(semestersRef);
      
      console.log(`Found ${semestersSnapshot.docs.length} semesters in ${year}`);
      
      for (let semesterDoc of semestersSnapshot.docs) {
        const semester = semesterDoc.id; // FirstSem, SecondSem, Summer

        // Create semester doc
        const semRef = doc(db, "Students", studentId, "Prospectus", courseCode, year, semester);
        batch.set(semRef, { initialized: true }, { merge: true });
        writeCount++;
        
        try {
          // Get and copy all subjects for this semester
          const subjectsRef = collection(db, `Program/${courseCode}/${year}/${semester}/Subjects`);
          const subjectsSnapshot = await getDocs(subjectsRef);
          
          console.log(`Found ${subjectsSnapshot.docs.length} subjects in ${year}/${semester}`);
          
          for (let subjectDoc of subjectsSnapshot.docs) {
            const subjectId = subjectDoc.id;
            const subjectData = subjectDoc.data();
            
            const subjectRef = doc(
              db, 
              "Students", 
              studentId, 
              "Prospectus", 
              courseCode, 
              year, 
              semester, 
              "Subjects", 
              subjectId
            );
            
            batch.set(subjectRef, {
              ...subjectData,
              Passed: passedCourses[subjectId] || false
            });
            
            writeCount++;
            
            // Commit batch if approaching limit
            if (writeCount >= 450) {
              console.log(`Committing batch #${++batchCommits} with ${writeCount} operations`);
              await batch.commit();
              // Create a new batch
              batch = writeBatch(db);
              writeCount = 0;
            }
          }
        } catch (subjectError) {
          console.error(`Error copying subjects for ${year}/${semester}:`, subjectError);
        }
      }
    } catch (semesterError) {
      console.error(`Error copying semesters for ${year}:`, semesterError);
    }
  }

  // Commit any remaining operations
  if (writeCount > 0) {
    console.log(`Committing final batch #${++batchCommits} with ${writeCount} operations`);
    await batch.commit();
  }
  
  console.log(`Successfully copied program ${courseCode} to student ${studentId}`);
};

  const resetForm = () => {
    setFile(null);
    setFileUrl(null);
    setEmail("");
    setEmailError("");
    setStudentName("");
    setStudentNameError("");
    setProgram("BSCS");
    setUniversity("University of Mindanao");
    setExtractedCourses([]);
    setEvaluatedCourses([]);
    setRawOcrText("");
    setYearLevelSelection(1);
  };

  // Get available years for the program
  const getAvailableYears = () => {
    return Object.keys(prospectusData || {}).sort();
  };

  // Get available semesters for the selected year
  const getAvailableSemesters = (year) => {
    if (!prospectusData || !prospectusData[year]) return [];
    return Object.keys(prospectusData[year]).sort();
  };

  // Format semester name for display
  const formatSemesterName = (semesterId) => {
    switch(semesterId) {
      case 'FirstSem': return '1st Semester';
      case 'SecondSem': return '2nd Semester';
      case 'Summer': return 'Summer';
      default: return semesterId;
    }
  };

  // Format year name for display
  const formatYearName = (yearId) => {
    switch(yearId) {
      case 'Year1': return '1st Year';
      case 'Year2': return '2nd Year';
      case 'Year3': return '3rd Year';
      case 'Year4': return '4th Year';
      default: return yearId;
    }
  };
  const clearEvaluation = () => {
    if (window.confirm("Are you sure you want to clear the current evaluation?")) {
      sessionStorage.removeItem('evaluationData');
      resetForm();
      setStage(STAGES.UPLOAD);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentUser.displayName}</h1>
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
          <LogoutButton />
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
              
              {fileUrl && (
                <div className="image-preview">
                  <img src={fileUrl} alt="Transcript preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                </div>
              )}
              
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="university">University</label>
                  <select 
                    id="university" 
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)} 
                    className="filter-select"
                    aria-label="University selection"
                  >
                    <option value="University of Mindanao">University of Mindanao</option>
                    <option value="Ateneo de Davao University">Ateneo de Davao University</option>
                    <option value="Holy Cross of Davao College">Holy Cross of Davao College</option>
                  </select>
                </div>
              </div>
              
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="email">Student Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="student@example.com" 
                    className={`filter-input ${emailError ? 'input-error' : ''}`}
                    aria-label="Student email"
                  />
                  {emailError && <span className="error-message">{emailError}</span>}
                </div>
                
                <div className="filter-group">
                  <label htmlFor="studentName">Student Name</label>
                  <input 
                    type="text" 
                    id="studentName"
                    value={studentName} 
                    onChange={handleNameChange} 
                    placeholder="John Doe"
                    className={`filter-input ${studentNameError ? 'input-error' : ''}`}
                    aria-label="Student name"
                  />
                  {studentNameError && <span className="error-message">{studentNameError}</span>}
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
                    <option value="BSCS">BS Computer Science</option>
                    <option value="BSIS">BS Information Systems</option>
                    <option value="BSIT">BS Information Technology</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="yearLevel">Year Level</label>
                  <select 
                    id="yearLevel" 
                    value={yearLevelSelection}
                    onChange={(e) => setYearLevelSelection(parseInt(e.target.value))} 
                    className="filter-select"
                    aria-label="Year level selection"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={handleExtract} 
                  className="action-button save"
                  disabled={isProcessing || !file || isCheckingDuplicates || !!emailError || !!studentNameError}
                  aria-label="Extract information from transcript"
                >
                  {isProcessing ? "Processing..." : 
                   isCheckingDuplicates ? "Checking..." : 
                   "Extract Information"}
                </button>
              </div>
            </div>
          )}
          
          {/* Extraction Results Stage */}
          {stage === STAGES.EXTRACTION && (
            <div className="prospectus-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Evaluated Courses</h3>
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
                <p><strong>University:</strong> {university}</p>
              </div>
              
              <div className="semester-block">
                <table className="subjects-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Credits</th>
                      <th style={{ textAlign: 'center' }}>Grade</th>
                      <th>Status</th>
                      <th>Passed</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluatedCourses.map((course, idx) => (
                      <tr key={idx} className={
                        course.status === 'passed' ? 'passed-row' : 
                        course.status === 'failed' ? 'failed-row' : 
                        course.status === 'not-credited' ? 'not-credited-row' : ''
                      }>
                        <td>{course.code}</td>
                        <td>{course.description}</td>
                        <td style={{ textAlign: 'center' }}>{course.credits}</td>
                        <td style={{ textAlign: 'center' }}>{course.grade}</td>
                        <td>
                          <span className={`status-badge ${course.status}`}>
                            {course.status === 'passed' ? 'Passed' : 
                             course.status === 'failed' ? 'Failed' : 
                             course.status === 'not-credited' ? 'Not Credited' :
                            'Not Evaluated'}
                          </span>
                        </td>
                        <td>
                          <div className="checkbox-container">
                            <input 
                              type="checkbox" 
                              checked={course.passed || false}
                              onChange={(e) => handleStatusChange(idx, e.target.checked)}
                              className="passed-checkbox"
                              id={`passed-${idx}`}
                            />
                            <label htmlFor={`passed-${idx}`} className="checkbox-label"></label>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={course.remarks || ""}
                            onChange={(e) => handleRemarkChange(idx, e.target.value)}
                            placeholder="Add remarks"
                            className="filter-input"
                            aria-label={`Remarks for ${course.code}`}
                          />
                        </td>
                      </tr>
                    ))}
                    {evaluatedCourses.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                          No courses extracted. Try adjusting the image or processing parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="summary-section">
                <h4>Evaluation Summary</h4>
                <div className="summary-stats">
                  <div className="stat-box">
                    <span className="stat-label">Total Courses</span>
                    <span className="stat-value">{evaluatedCourses.length}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Passed</span>
                    <span className="stat-value">
                      {evaluatedCourses.filter(course => course.passed).length}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Failed/Not Evaluated</span>
                    <span className="stat-value">
                      {evaluatedCourses.filter(course => !course.passed).length}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Total Credits</span>
                    <span className="stat-value">
                      {evaluatedCourses.reduce((sum, course) => sum + (course.credits || 0), 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Debug section - can be removed in production */}
              <div className="debug-section" style={{ marginTop: '20px', display: 'none' }}>
                <details>
                  <summary>Debug: Raw OCR Text</summary>
                  <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
                    {rawOcrText}
                  </pre>
                </details>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={() => setStage(STAGES.UPLOAD)}
                  className="action-button reset"
                  disabled={isProcessing}
                  aria-label="Go back to upload"
                >
                  Back
                </button>
                <button 
                  onClick={clearEvaluation}
                  className="action-button reset"
                  disabled={isProcessing}
                  aria-label="Clear evaluation"
                >
                  Clear Evaluation
                </button>
                <button 
                  onClick={saveEvaluation}
                  className="action-button save"
                  disabled={isProcessing || !!emailError}
                  aria-label="Save evaluation"
                >
                  {isProcessing ? "Saving..." : "Save Evaluation"}
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
                  {formatYearName(selectedYear)} <span className="dropdown-arrow">▼</span>
                </button>
                
                {yearDropdownOpen && (
                  <div className="dropdown-menu">
                    {getAvailableYears().map((year) => (
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
                        {formatYearName(year)}
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
                  {formatSemesterName(selectedSemester)} <span className="dropdown-arrow">▼</span>
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
                        {formatSemesterName(semester)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Current Selection Display */}
          <div className="current-selection">
            <h4>{formatYearName(selectedYear)} - {formatSemesterName(selectedSemester)}</h4>
          </div>
          
          {/* Course Table - Scrollable */}
          <div className="prospectus-content">
            {currentProspectus.length > 0 ? (
              <table className="subjects-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'center' }}>Units</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProspectus.map((subject, index) => (
                    <tr key={index} className={evaluatedCourses.some(c => c.matchedTo === subject.code && c.passed) ? 'matched-course' : ''}>
                      <td>{subject.code}</td>
                      <td>{subject.CourseDescription || subject.Title || ''}</td>
                      <td style={{ textAlign: 'center' }}>{subject.UnitsTotal || subject.Units || 0}</td>
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
        .input-error {
          border-color: #dc3545 !important;
          background-color: rgba(220, 53, 69, 0.05);
        }
        .error-message {
          color: #dc3545;
          font-size: 0.8rem;
          margin-top: 5px;
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
          min-width: 120px;
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
        .action-button:hover:not(:disabled) {
          opacity: 0.9;
        }
        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .action-button.save {
          background-color: ${coralColor};
          color: white;
        }
        .action-button.reset {
          background-color: #9e9e9e;
          color: white;
        }
        
        /* Status badges */
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-badge.passed {
          background-color: rgba(76, 175, 80, 0.2);
          color: #2e7d32;
        }
        .status-badge.failed {
          background-color: rgba(244, 67, 54, 0.2);
          color: #c62828;
        }
        .status-badge.not-credited {
          background-color: rgba(255, 152, 0, 0.2);
          color: #ef6c00;
        }
        
        /* Row highlighting */
        .passed-row {
          background-color: rgba(76, 175, 80, 0.05);
        }
        .failed-row {
          background-color: rgba(244, 67, 54, 0.05);
        }
        .matched-course {
          background-color: rgba(76, 175, 80, 0.1);
        }
        .not-credited-row {
          background-color: rgba(255, 152, 0, 0.05);
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
        
        .image-preview {
          margin: 15px 0;
          text-align: center;
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 4px;
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