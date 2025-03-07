import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StartingPage from './assets/pages/StartingPage';
import LoginPage from './assets/pages/LoginPage'; 
import EvaluateTab from './assets/pages/CourseEvaluationTab';
import AdminDashboard from './assets/pages/AdminDashboard';
import EvaluatorDashboard from './assets/pages/EvaluatorDashboard';
import EvaluationHistory from './assets/pages/EvaluationHistory';


function App() {
  return (
    <Routes>
      <Route path="/" element={<StartingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/evaluator-dashboard" element={<EvaluatorDashboard />} />
      <Route path="/history" element={<EvaluationHistory />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/course-evaluation" element={<EvaluateTab />} />
      
    </Routes>
  );
}

export default App;
