import { useState } from "react";

export default function EvaluateTab() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [studentName, setStudentName] = useState("");

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  return (
    <div className="tab-content">
      <h3 className="tab-title">Evaluation Process</h3>

      <div className="form-group">
        <label>Upload Transcript</label>
        <input type="file" onChange={handleFileUpload} />
      </div>

      <div className="form-group">
        <label>Assign Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="student@example.com" 
        />
      </div>

      <div className="form-group">
        <label>Student Name</label>
        <input 
          type="text" 
          value={studentName} 
          onChange={(e) => setStudentName(e.target.value)} 
          placeholder="John Doe" 
        />
      </div>

      <button className="primary-button">Extract</button>
    </div>
  );
}

/* ✅ Embedded CSS for Presentable Layout */
const styles = `

  .tab-title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #d32f2f;
    margin-bottom: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .form-group input {
    width: 500px; 
    padding: 10px;
    background: #f0f0f0;  /* Change this to any color you want */
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.3s ease;

  }

  .form-group input:focus {
    background: #ffffff;  /* White background when focused */
    border-color: #d32f2f; /* Highlight border */
    outline: none;
    box-shadow: 0 0 5px rgba(211, 47, 47, 0.5);
  }

  input[type="file"] {
    border: none;
    background: #f8f8f8;
    padding: 10px;
    border-radius: 6px;
  }

  .primary-button {
    width: 100%;
    padding: 10px 20px;
    background-color: #d32f2f;
    color: white;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .primary-button:hover {
    background-color: #b71c1c;
  }

`;

// ✅ Append styles to the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
