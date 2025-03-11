import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EvaluatorAccounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", password: "1234", active: true },
    { id: 2, name: "Jane Smith", email: "jane@example.com", password: "5678", active: false },
  ]);
  const [sortOrder, setSortOrder] = useState("asc");

  const toggleStatus = (id) => {
    setAccounts(accounts.map(account => 
      account.id === id ? { ...account, active: !account.active } : account
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
        <h2>Admin Accounts</h2>
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
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Password</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.filter(account => account.active).map(account => (
                <tr key={account.id}>
                  <td style={tableCellStyle}>{account.name}</td>
                  <td style={tableCellStyle}>{account.email}</td>
                  <td style={tableCellStyle}>{account.password}</td>
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
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Password</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.filter(account => !account.active).map(account => (
                <tr key={account.id}>
                  <td style={tableCellStyle}>{account.name}</td>
                  <td style={tableCellStyle}>{account.email}</td>
                  <td style={tableCellStyle}>{account.password}</td>
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
