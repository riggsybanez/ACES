import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AdminDashboard = () => {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: "error", content: "Passwords do not match" });
      return;
    }
    // Here you would typically make an API call to create the account
    console.log("Admin account created", { name, id, password });
    setMessage({ type: "success", content: "Admin account created successfully" });
    // Reset form
    setName("");
    setId("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="dashboard" style={{ display: 'flex', minHeight: '100vh' }}>
      <style jsx>{`
.dashboard {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: white;
  color: black;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.sidebar-header {
  margin-bottom: 20px;
  text-align: center;
}

.sidebar-header h1 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.sidebar-header p {
  font-size: 0.8rem;
}

.sidebar-item {
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 5px;
  transition: background-color 0.3s ease;
}

.sidebar-item:hover {
  background-color: #f0f0f0;
}

const coralColor = rgba(222, 120, 120, 1);

.logout-button {
  background-color: #ff4c4c; 
  color: white; /* Set text color to white */
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}


.logout-button:hover {
  background-color: #fb8a8a; /* Lighter red hover */
}

.container {
  color: #989898;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  
  background-color: white; /* Added background color */
}

.button { //*create account
  background-color: #ff4c4c; /* Red button */
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1rem; /* Adjusted font size */
}
.content {
  flex: 1;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  color: #333; /* Darker text color */
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
  position: relative; /* Added for positioning */
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555; /* Slightly darker label color */
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem; /* Adjusted font size */
}

/* Smaller password fields */
.password-group input {
  width: calc(100% - 30px); /* Reduced width */
  padding: 10px 15px; /* Adjusted padding */
}

.password-toggle {
  position: absolute;
  top: 45%;
  right: 1px; /* Removed right: 20px */
  transform: translateY(10%);
  cursor: pointer;
}



.button:hover {
  background-color: #fb8a8a; /* Lighter red hover */
}

.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  text-align: center;
}

.alert.success {
  background-color: #d1fae5;
  color: #059669;
}

.alert.error {
  background-color: #fee2e2;
  color: #b91c1c;
}

svg {
  width: 30px;
  height: 30px;
}
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>JOHN SMITH</h1>
          <p>Administrative Assistant</p>
        </div>
        <div onClick={() => navigate('/admin-dashboard')} className="sidebar-item">🏠 Home</div>
        <div onClick={() => navigate('')} className="sidebar-item">📅 ???</div>
        <div onClick={() => navigate('/reports')} className="sidebar-item">📄 Accounts List</div>

        
        <button onClick={() => navigate('/login')} className="logout-button">Logout</button>
      </div>

      {/* Main Content */}
      <div className="content">
        <div className="container">
          <h2 className="title">Admin Account Creation</h2>
          {message.content && (
            <div className={`alert ${message.type === "error" ? "error" : "success"}`}>
              {message.content}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name of New Admin</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="id">ID Number</label>
              <input
                type="text"
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L7.414 11H13a1 1 0 100-2H7.414l2.293-2.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.894.893l3 3a1 1 0 001.106-.894V7z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            </div>
            <div className="form-group password-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L7.414 11H13a1 1 0 100-2H7.414l2.293-2.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.894.893l3 3a1 1 0 001.106-.894V7z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            </div>
            <button type="submit" className="button">Create Account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
