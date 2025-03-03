import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './assets/pages/HomePage';
import LoginPage from './assets/pages/LoginPage'; 
import EvaluateTab from './assets/pages/EvaluationTab';
import AdminDashboard from './assets/pages/AdminDashboard';
import AccountManagementTab from './assets/pages/AccountManagementTab';
import CreateAnotherAdminTab from './assets/pages/CreateAnotherAdminTab';
import EvaluationHistoryTab from './assets/pages/EvaluationHistoryTab';
import CheckStatusPage from './assets/pages/CheckStatusPage';
import EvaluationStatusResult from "./assets/pages/EvaluationStatusResult";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/evaluation" element={<EvaluateTab />} />
      <Route path="/account-management" element={<AccountManagementTab />} />
      <Route path="/create-another-admin" element={<CreateAnotherAdminTab />} />
      <Route path="/my-evaluation" element={<EvaluationHistoryTab />} />
      <Route path="/check-status" element={<CheckStatusPage />} />
      <Route path="/evaluation-status" element={<EvaluationStatusResult />} />
    </Routes>
  );
}

export default App;
