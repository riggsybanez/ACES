import { useState } from "react";

const STAGES = {
  UPLOAD: "upload",
  EXTRACTION: "extraction",
  RESULTS: "results",
  REVIEW: "review",
};

export default function EvaluateTab() {
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
    <div className="p-10">
      <h3 className="text-xl font-semibold">Evaluation Process</h3>

      {stage === STAGES.UPLOAD && (
        <div className="space-y-4">
          <label>Upload Transcript</label>
          <input type="file" onChange={handleFileUpload} />
          <label>Assign Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
          <label>Student Name</label>
          <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="John Doe" />
          <button onClick={handleExtract}>Extract</button>
        </div>
      )}
    </div>
  );
}
