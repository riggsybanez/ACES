import { useState } from "react";

export default function AccountManagementTab() {
  const [id, setId] = useState("1234567891011");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="tab-content">
      <h3 className="tab-title">Edit Account Information</h3>

      <div className="form-group">
        <label>Name</label>
        <input type="text" placeholder="Enter your name" />
      </div>

      <div className="form-group">
        <label>ID</label>
        <input type="text" value={id} disabled className="disabled-input" />
      </div>

      <div className="form-group">
        <label>New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>

      <button className="primary-button">Confirm Changes</button>
    </div>
  );
}

const styles = ` /* Account Management Tab Styles */

.tab-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #d32f2f;
  margin-top: 2px;
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
  outline: none;
  border-color: #d32f2f;
  background-color: white !important; /* Keep background white when focused */
  color: black !important; /* Ensure text is black when focused */
}
.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.disabled-input {
  background-color: #e0e0e0;
  color: #777;
  cursor: not-allowed;
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

`
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);