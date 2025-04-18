// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ requiredRole }) => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" />;
    } else if (userRole === 'evaluator') {
      return <Navigate to="/evaluator-dashboard" />;
    } else {
      return <Navigate to="/login" />;
    }
  }
  
  return <Outlet />;
};