import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage text="Checking authorization..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to their own dashboard
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'COMPANY') return <Navigate to="/company" replace />;
    return <Navigate to="/student" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
