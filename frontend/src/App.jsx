import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Objectifs from './pages/Objectifs';
import Indicateurs from './pages/Indicateurs';
import Evaluations from './pages/Evaluations';
import Services from './pages/Services';
import Users from './pages/Users';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <ToastProvider>
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
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/objectifs" element={
                <ProtectedRoute requiredRoles={['ADMIN', 'RESPONSABLE']}>
                  <DashboardLayout>
                    <Objectifs />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/indicateurs" element={
                <ProtectedRoute requiredRoles={['ADMIN', 'RESPONSABLE']}>
                  <DashboardLayout>
                    <Indicateurs />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Route pour évaluation générale */}
              <Route path="/dashboard/evaluations" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Evaluations />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Route dynamique pour évaluation d'un employé spécifique */}
              <Route path="/dashboard/evaluations/:employeId" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Evaluations />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/services" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <Services />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/users" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <Users />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/employees" element={
                <ProtectedRoute requiredRoles={['ADMIN', 'RESPONSABLE']}>
                  <DashboardLayout>
                    <Employees />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/reports" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Default redirect based on role */}
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;