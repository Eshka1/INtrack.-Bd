import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import RegisterCompany from './pages/RegisterCompany';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeamManagement from './pages/TeamManagement';
import AcceptInvite from './pages/AcceptInvite';

import './App.css';

function App() {
  return (
    <TenantProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterCompany />} />
          <Route path="/login" element={<Login />} />
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <TeamManagement />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TenantProvider>
  );
}

export default App;
