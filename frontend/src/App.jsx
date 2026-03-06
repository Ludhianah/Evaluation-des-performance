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
import EvaluationResult from './pages/EvaluationResult';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>

              {/* Routes publiques */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Objectifs */}
              <Route path="/dashboard/objectifs" element={
                <ProtectedRoute requiredRoles={['ADMIN', 'RESPONSABLE']}>
                  <DashboardLayout>
                    <Objectifs />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Indicateurs */}
              <Route path="/dashboard/indicateurs" element={
                <ProtectedRoute requiredRoles={['ADMIN', 'RESPONSABLE']}>
                  <DashboardLayout>
                    <Indicateurs />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Evaluation générale */}
              <Route path="/dashboard/evaluations" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Evaluations />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Evaluation d'un employé */}
              <Route path="/dashboard/evaluations/:employeId" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Evaluations />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* ⭐ RESULTAT D'EVALUATION D'UN EMPLOYE */}
              <Route path="/dashboard/evaluation-result/:employeId" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <EvaluationResult />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Services */}
              <Route path="/dashboard/services" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <Services />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Utilisateurs */}
              <Route path="/dashboard/users" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <Users />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Employés */}
              <Route path="/dashboard/employees" element={
                <ProtectedRoute requiredRoles={['ADMIN', 'RESPONSABLE']}>
                  <DashboardLayout>
                    <Employees />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Rapports */}
              <Route path="/dashboard/reports" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Redirection */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;