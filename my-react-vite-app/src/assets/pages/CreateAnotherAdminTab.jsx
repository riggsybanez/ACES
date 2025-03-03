import { useState } from "react";

export default function CreateAnotherAdminTab() {
  const [username, setUsername] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setMessage("Admin account created successfully");
  };

  return (
    <div className="tab-content">
      <h3 className="tab-title">Create Admin Account</h3>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="form-group">
          <label>ID</label>
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        <button type="submit" className="primary-button">Create Account</button>
      </form>
    </div>
  );
}

const styles = `

  /* Create Admin Account Styles */

.tab-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #d32f2f;
  margin-top: 2px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.form-group input {
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white !important; /* Ensure white background */
  color: black !important; /* Ensure black text */
  transition: 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #d32f2f;
  background-color: white !important;
  color: black !important;
}

.primary-button {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: #d32f2f;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  background-color: #b71c1c;
}

.message {
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
  color: green;
  margin-bottom: 15px;
}

`;

// ✅ Append styles to the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);