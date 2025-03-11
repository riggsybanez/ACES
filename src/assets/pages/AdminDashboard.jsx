import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from '../../firebase/authService'; // Import Firestore
import { collection, addDoc } from 'firebase/firestore';

const AdminDashboard = () => {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      setNotification({ type: "error", content: "Passwords do not match" });
      return;
    }
  
    try {
      const docRef = await addDoc(collection(db, 'Evaluator'), {
        Name: name,             
        ID: parseInt(id, 10),   
        Password: password,
        Active: false   
      });
  
      console.log("Evaluator account created with ID:", docRef.id);
      setNotification({ type: "success", content: "Evaluator account created successfully" });
  
      setName("");
      setId("");
      setPassword("");
      setConfirmPassword("");
  
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error("Error adding document:", error);
      setNotification({ type: "error", content: "An error occurred. Please try again." });
    }
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
        .logout-button {
          background-color: #ff4c4c;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 20px;
          transition: background-color 0.3s ease;
        }
        .logout-button:hover {
          background-color: #fb8a8a;
        }
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 400px;
          margin: 50px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background-color: white;
        }
        .button {
          background-color: #ff4c4c;
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          font-size: 1rem;
        }
        .button:hover {
          background-color: #fb8a8a;
        }
        .form-group {
          margin-bottom: 15px;
          width: 100%;
          position: relative;
        }
        label {
          display: block;
          margin-bottom: 5px;
          color: #555;
        }
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 1rem;
        }
        .password-toggle {
          position: relative;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
        }
        .password-toggle svg {
          width: 20px;
          height: 20px;
        }
        .notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #4caf50;
          color: white;
          padding: 15px;
          border-radius: 6px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 250px;
          transition: opacity 0.3s ease-in-out;
        }
        .notification.error {
          background-color: #ff4c4c;
        }
        .close-btn {
          margin-left: 10px;
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>JANE SMITH</h1>
          <p>Administrative Assistant</p>
        </div>
        <div onClick={() => navigate('/admin-dashboard')} className="sidebar-item">🏠 Home</div>
        <div onClick={() => navigate('/evaluator-accounts')} className="sidebar-item">📄 List of Evaluators</div>
        <button onClick={() => navigate('/login')} className="logout-button">Logout</button>
      </div>

      {/* Main Content */}
      <div className="content">
        <div className="container">
          <h2 className="title">Admin Account Creation</h2>
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

      {/* Notification Pop-up */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.content}</span>
          <button className="close-btn" onClick={() => setNotification(null)}>✖</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;