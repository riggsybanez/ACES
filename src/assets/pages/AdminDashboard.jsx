import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';
import { db } from '../../firebase/authService';
import { collection, addDoc } from 'firebase/firestore';

const coralColor = 'rgba(255,79,78,255)';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (password !== confirmPassword) {
      setNotification({ type: "error", content: "Passwords do not match" });
      return;
    }

    if (!name.trim() || !id.trim() || !password.trim()) {
      setNotification({ type: "error", content: "All fields are required" });
      return;
    }

    // Validate ID is a number
    const idNumber = parseInt(id);
    if (isNaN(idNumber)) {
      setNotification({ type: "error", content: "ID must be a number" });
      return;
    }

    setLoading(true);
    
    try {
      // Add new evaluator to Firestore
      const evaluatorData = {
        ID: idNumber,
        Name: name.trim(),
        Password: password,
        Active: false  // Default to inactive
      };
      
      // Add document to Evaluator collection
      await addDoc(collection(db, 'Evaluator'), evaluatorData);
      
      // Show success notification
      setNotification({ 
        type: "success", 
        content: "Evaluator account created successfully. Account is inactive by default." 
      });

      // Reset form
      setName("");
      setId("");
      setPassword("");
      setConfirmPassword("");
      
    } catch (error) {
      console.error("Error creating evaluator account:", error);
      setNotification({ 
        type: "error", 
        content: "Failed to create account. Please try again." 
      });
    } finally {
      setLoading(false);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              Welcome, {currentUser?.displayName || 'Administrator'}
            </h1>
          </div>
          <div className="sidebar-item active" onClick={() => navigate('/admin-dashboard')}>
            🏠 Home
          </div>
          <div className="sidebar-item" onClick={() => navigate('/evaluator-accounts')}>
            📄 List of Evaluators
          </div>
        </div>
        <div className="logout-container">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2>Evaluator Account Creation</h2>
        
        <div className="filter-container">
          <form onSubmit={handleSubmit}>
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="name">Name of New Evaluator</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="filter-input"
                  placeholder="Enter evaluator name"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="id">ID Number</label>
                <input
                  type="text"
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="filter-input"
                  placeholder="Enter ID number"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="filter-input"
                    placeholder="Enter password"
                    required
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    className="toggle-password-button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="filter-input"
                  placeholder="Confirm password"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                type="submit" 
                className="action-button save"
                aria-label="Create evaluator account"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
        
        <div className="info-box">
          <h3>Note:</h3>
          <p>New evaluator accounts are created as inactive by default. 
          Go to the "List of Evaluators" page to activate accounts.</p>
        </div>
      </div>

      {/* Notification Pop-up */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.content}</span>
          <button 
            className="close-notification" 
            onClick={() => setNotification(null)}
            aria-label="Close notification"
          >
            ✖
          </button>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .info-box {
          background-color: #f0f8ff;
          border-left: 4px solid #1e90ff;
          padding: 15px;
          margin-top: 20px;
          border-radius: 4px;
        }
        
        .info-box h3 {
          margin-top: 0;
          color: #1e90ff;
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
        .action-button:hover {
          opacity: 0.9;
        }
        .action-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .action-button.save {
          background-color: ${coralColor};
          color: white;
        }
        .action-button.reset {
          background-color: #9e9e9e;
          color: white;
        }
        
        /* Password Input Container */
        .password-input-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .password-input-container .filter-input {
          width: 100%;
          padding-right: 40px;
        }
        .toggle-password-button {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: #666;
        }
        .toggle-password-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Notification */
        .notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 6px;
          background-color: #4CAF50;
          color: white;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 300px;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }
        .notification.error {
          background-color: ${coralColor};
        }
        .close-notification {
          background: none;
          border: none;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          margin-left: 15px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .close-notification:hover {
          opacity: 1;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Responsive styles */
        @media (max-width: 1024px) {
          .filter-row {
            flex-direction: column;
            gap: 10px;
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
        }
        
        /* Accessibility enhancements */
        .filter-select:focus, 
        .filter-input:focus,
        .action-button:focus,
        .toggle-password-button:focus {
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
          
          .action-button {
            padding: 8px 15px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;