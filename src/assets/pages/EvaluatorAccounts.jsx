import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/authService';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import LogoutButton from '../../components/LogoutButton';

const coralColor = 'rgba(255,79,78,255)';

const EvaluatorAccounts = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showPasswords, setShowPasswords] = useState(false);

  // Fetch evaluator accounts from Firestore
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const evaluatorCollection = collection(db, 'Evaluator');
        const evaluatorSnapshot = await getDocs(evaluatorCollection);
        
        const evaluatorList = evaluatorSnapshot.docs.map(doc => ({
          docId: doc.id,
          id: doc.data().ID,
          name: doc.data().Name || 'No Name',
          password: doc.data().Password || '',
          active: doc.data().Active || false
        }));
        
        // Sort the accounts by name initially
        evaluatorList.sort((a, b) => a.name.localeCompare(b.name));
        setAccounts(evaluatorList);
      } catch (err) {
        console.error("Error fetching evaluator accounts:", err);
        setError("Failed to load evaluator accounts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Toggle the active status of an evaluator
  const toggleStatus = async (docId, currentStatus) => {
    try {
      const evaluatorRef = doc(db, 'Evaluator', docId);
      await updateDoc(evaluatorRef, {
        Active: !currentStatus
      });

      // Update the local state
      setAccounts(accounts.map(account => 
        account.docId === docId ? { ...account, active: !currentStatus } : account
      ));
    } catch (err) {
      console.error("Error updating evaluator status:", err);
      alert("Failed to update evaluator status. Please try again.");
    }
  };

  // Sort accounts by name
  const sortAccounts = () => {
    const sorted = [...accounts].sort((a, b) => {
      if (sortOrder === "asc") return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
    setAccounts(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPasswords(!showPasswords);
  };

  // Function to display password (either masked or plaintext)
  const displayPassword = (password) => {
    return showPasswords ? password : '••••••••';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Welcome, Administrator
            </h1>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/admin-dashboard')}>
            🏠 Home
          </div>
          <div className="sidebar-item active" onClick={() => navigate('/evaluator-accounts')}>
            📄 List of Evaluators
          </div>
        </div>
        <div className="logout-container">
          <LogoutButton />
        </div>
      </div>

      {/* Main content area */}
      <div className="main-content">
        <h2>Evaluator Accounts</h2>
        
        {loading ? (
          <div className="loading-message">Loading accounts...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="filter-container">
            <div className="filter-row">
              <div className="action-buttons" style={{ marginTop: 0, justifyContent: 'space-between', width: '100%' }}>
                <button 
                  onClick={sortAccounts} 
                  className="action-button save"
                >
                  Sort {sortOrder === "asc" ? "🔼" : "🔽"}
                </button>
                <button 
                  onClick={togglePasswordVisibility} 
                  className={`action-button ${showPasswords ? "reset" : "save"}`}
                >
                  {showPasswords ? "Hide Passwords" : "Show Passwords"}
                </button>
              </div>
            </div>
            
            {/* Active Accounts Table */}
            <div className="prospectus-container" style={{ marginTop: '20px' }}>
              <h3>Active Accounts</h3>
              <div className="prospectus-content" style={{ maxHeight: 'none' }}>
                <table className="subjects-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Password</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.filter(account => account.active).length > 0 ? (
                      accounts.filter(account => account.active).map(account => (
                        <tr key={account.docId}>
                          <td>{account.id}</td>
                          <td>{account.name}</td>
                          <td>{displayPassword(account.password)}</td>
                          <td style={{ color: "green" }}>Active</td>
                          <td>
                            <button 
                              onClick={() => toggleStatus(account.docId, account.active)}
                              className="action-button reset"
                              style={{ margin: 0, padding: '5px 10px' }}
                            >
                              Set Inactive
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>No active accounts found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Inactive Accounts Table */}
            <div className="prospectus-container" style={{ marginTop: '20px' }}>
              <h3>Inactive Accounts</h3>
              <div className="prospectus-content" style={{ maxHeight: 'none' }}>
                <table className="subjects-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Password</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.filter(account => !account.active).length > 0 ? (
                      accounts.filter(account => !account.active).map(account => (
                        <tr key={account.docId}>
                          <td>{account.id}</td>
                          <td>{account.name}</td>
                          <td>{displayPassword(account.password)}</td>
                          <td style={{ color: "red" }}>Inactive</td>
                          <td>
                            <button 
                              onClick={() => toggleStatus(account.docId, account.active)}
                              className="action-button save"
                              style={{ margin: 0, padding: '5px 10px' }}
                            >
                              Set Active
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>No inactive accounts found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Styles */}
      <style>{`
        .loading-message, .error-message {
          padding: 20px;
          text-align: center;
          background-color: #f9f9f9;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .error-message {
          color: red;
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
        .action-button.save {
          background-color: ${coralColor};
          color: white;
        }
        .action-button.reset {
          background-color: #9e9e9e;
          color: white;
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
          
          .subjects-table th, .subjects-table td {
            padding: 8px 10px;
            font-size: 0.85rem;
          }
        }
        
        /* Accessibility enhancements */
        .filter-select:focus, 
        .filter-input:focus,
        .view-mode-button:focus,
        .action-button:focus {
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
        }
      `}</style>
    </div>
  );
};

export default EvaluatorAccounts;