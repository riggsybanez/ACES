import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
import StudentArchives from './assets/pages/StudentArchives';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<StartingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/check-status" element={<EmailCheck />} />
        <Route path="/student-status" element={<StudentStatus />} />
        
        {/* Admin routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/evaluator-accounts" element={<EvaluatorAccounts />} />
        </Route>
        
        {/* Evaluator routes */}
        <Route element={<ProtectedRoute requiredRole="evaluator" />}>
          <Route path="/evaluator-dashboard" element={<EvaluatorDashboard />} />
          <Route path="/history" element={<EvaluationHistory />} />
          <Route path="/course-evaluation" element={<EvaluateTab />} />
          <Route path="/evaluation-results" element={<ExtractionResults />} />
          <Route path="/student-archives" element={<StudentArchives />} />
        </Route>
        
        {/* Default redirect for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
