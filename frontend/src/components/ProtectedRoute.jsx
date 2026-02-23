import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redirige vers login si non connecté
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifie si l'utilisateur a un rôle autorisé
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;