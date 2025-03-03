import { useState } from "react";
import EvaluateTab from "./EvaluationTab";
import AccountManagementTab from "./AccountManagementTab";
import CreateAnotherAdminTab from "./CreateAnotherAdminTab";
import EvaluationHistoryTab from "./EvaluationHistoryTab";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("evaluation");

  const renderContent = () => {
    switch (activeTab) {
      case "evaluation":
        return <EvaluateTab />;
      case "account-management":
        return <AccountManagementTab />;
      case "create-admin":
        return <CreateAnotherAdminTab />;
      case "evaluation-history":
        return <EvaluationHistoryTab />;
      default:
        return <EvaluateTab />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <button className="logout-button">Log Out</button>
        </div>

        {/* Navigation Buttons */}
        <div className="nav-buttons">
          <button
            className={`nav-button ${activeTab === "evaluation" ? "active" : ""}`}
            onClick={() => setActiveTab("evaluation")}
          >
            Evaluation
          </button>
          <button
            className={`nav-button ${activeTab === "account-management" ? "active" : ""}`}
            onClick={() => setActiveTab("account-management")}
          >
            Account Management
          </button>
          <button
            className={`nav-button ${activeTab === "create-admin" ? "active" : ""}`}
            onClick={() => setActiveTab("create-admin")}
          >
            Add Another Admin
          </button>
          <button
            className={`nav-button ${activeTab === "evaluation-history" ? "active" : ""}`}
            onClick={() => setActiveTab("evaluation-history")}
          >
            Evaluation History
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="content-container">{renderContent()}</div>
      </div>
    </div>
  );
}

// ✅ CSS Styles
const styles = `
  .dashboard-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: cover;
    background-position: center;
    padding: 20px;
  }

  .dashboard-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
    width: 900px;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .dashboard-title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #d32f2f;
  }

  .logout-button {
    padding: 10px 20px;
    background-color: #fff;
    border: 2px solid #d32f2f;
    color: #d32f2f;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .logout-button:hover {
    background-color: #d32f2f;
    color: white;
  }

  .nav-buttons {
    display: flex;
    justify-content: space-around;
    gap: 10px;
    margin-bottom: 20px;
  }

  .nav-button {
    flex-grow: 1;
    padding: 12px;
    border: 2px solid #d32f2f;
    color: #d32f2f;
    font-weight: bold;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .nav-button:hover, .nav-button.active {
    background-color: #d32f2f;
    color: white;
  }

  .content-container {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #fff;
    min-height: 400px;
  }
`;

// ✅ Append styles to the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
