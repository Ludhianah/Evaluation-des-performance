import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Objectifs from './pages/Objectifs';
import Indicateurs from './pages/Indicateurs';
import Evaluations from './pages/Evaluations';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/objectifs" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout>
                  <Objectifs />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/indicateurs" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardLayout>
                  <Indicateurs />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/evaluations" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Evaluations />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;