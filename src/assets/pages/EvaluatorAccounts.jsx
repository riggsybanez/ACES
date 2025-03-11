import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from '../../firebase/authService'; // Import Firestore
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const EvaluatorAccounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(collection(db, "Evaluator"));
      const accountsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccounts(accountsList);
    };
    fetchAccounts();
  }, []);

  const toggleStatus = async (id) => {
    const account = accounts.find(account => account.id === id);
    const accountRef = doc(db, "Evaluator", id);
    await updateDoc(accountRef, { Active: !account.Active });
    setAccounts(accounts.map(account => 
      account.id === id ? { ...account, Active: !account.Active } : account
    ));
  };

  const sortAccounts = () => {
    const sorted = [...accounts].sort((a, b) => {
      if (sortOrder === "asc") return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
    setAccounts(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{
        width: "250px",
        backgroundColor: "white",
        color: "black",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "18px", margin: "0" }}>JANE SMITH</h2>
          <p style={{ fontSize: "14px", margin: "5px 0 0" }}>Administrative Assistant</p>
        </div>
        <div 
          style={{ padding: "10px", cursor: "pointer", transition: "background 0.3s" }} 
          onClick={() => navigate('/admin-dashboard')}
          onMouseOver={(e) => e.target.style.backgroundColor = "lightgray"}
          onMouseOut={(e) => e.target.style.backgroundColor = "white"}
        >
          🏠 Home
        </div>
        <div 
          style={{ padding: "10px", cursor: "pointer", transition: "background 0.3s" }} 
          onClick={() => navigate('/evaluator-accounts')}
          onMouseOver={(e) => e.target.style.backgroundColor = "lightgray"}
          onMouseOut={(e) => e.target.style.backgroundColor = "white"}
        >
          📄 List of Evaluators
        </div>
        <button 
          onClick={() => navigate('/login')} 
          style={{
            marginTop: "auto",
            padding: "10px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2>Evaluator Accounts</h2>
        <button 
          onClick={sortAccounts} 
          style={{ padding: "5px 10px", marginBottom: "10px", cursor: "pointer" }}
        >
          Sort {sortOrder === "asc" ? "🔼" : "🔽"}
        </button>

        {/* Active Accounts Table */}
        <div style={{ marginTop: "20px" }}>
          <h3>Active Accounts</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>Password</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.filter(account => account.Active).map(account => (
                <tr key={account.id}>
                  <td style={tableCellStyle}>{account.Name}</td>
                  <td style={tableCellStyle}>{account.ID}</td>
                  <td style={tableCellStyle}>{account.Password}</td>
                  <td style={{ ...tableCellStyle, color: "green" }}>Active</td>
                  <td style={tableCellStyle}>
                    <button onClick={() => toggleStatus(account.id)}>Set Inactive</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inactive Accounts Table */}
        <div style={{ marginTop: "20px" }}>
          <h3>Inactive Accounts</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>Password</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.filter(account => !account.Active).map(account => (
                <tr key={account.id}>
                  <td style={tableCellStyle}>{account.Name}</td>
                  <td style={tableCellStyle}>{account.ID}</td>
                  <td style={tableCellStyle}>{account.Password}</td>
                  <td style={{ ...tableCellStyle, color: "red" }}>Inactive</td>
                  <td style={tableCellStyle}>
                    <button onClick={() => toggleStatus(account.id)}>Set Active</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Table Styling
const tableHeaderStyle = {
  border: "1px solid black",
  padding: "10px",
  textAlign: "left",
  backgroundColor: "#f0f0f0"
};

const tableCellStyle = {
  border: "1px solid black",
  padding: "10px",
  textAlign: "left"
};

export default EvaluatorAccounts;