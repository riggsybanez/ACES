import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StartingPage from './assets/pages/StartingPage';
import LoginPage from './assets/pages/LoginPage'; 
import EvaluateTab from './assets/pages/CourseEvaluationTab';
import AdminDashboard from './assets/pages/AdminDashboard';
import EvaluatorAccounts from './assets/pages/EvaluatorAccounts';
import EvaluatorDashboard from './assets/pages/EvaluatorDashboard';
import EvaluationHistory from './assets/pages/EvaluationHistory';
import ExtractionResults from './assets/pages/EvaluationResults';
import StudentStatus from './assets/pages/StudentStatus';
import EmailCheck from './assets/pages/EmailCheck';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/evaluator-dashboard" element={<EvaluatorDashboard />} />
      <Route path="/history" element={<EvaluationHistory />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/evaluator-accounts" element={<EvaluatorAccounts />} />
      <Route path="/course-evaluation" element={<EvaluateTab />} />
      <Route path="/evaluation-results" element={<ExtractionResults />} />
      <Route path="/student-status" element={<StudentStatus />} />
      <Route path="/check-status" element={<EmailCheck />} />
    </Routes>
  );
}

export default App;
