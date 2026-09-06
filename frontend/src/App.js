import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import RegisterCompany from './pages/RegisterCompany';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeamManagement from './pages/TeamManagement';
import AcceptInvite from './pages/AcceptInvite';
import AssetCategories from './pages/AssetCategories';
import Warehouses from './pages/Warehouses';
import Billing from './pages/Billing';
import FinanceDashboard from './pages/FinanceDashboard';
import BudgetPage from './pages/BudgetPage';
import ExpensesPage from './pages/ExpensesPage';
import ExpenseCreatePage from './pages/ExpenseCreatePage';
import PayablesPage from './pages/PayablesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CurrencySettingsPage from './pages/CurrencySettingsPage';

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
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <AssetCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouses"
            element={
              <ProtectedRoute>
                <Warehouses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <FinanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/budget"
            element={
              <ProtectedRoute>
                <BudgetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/expenses"
            element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/expenses/new"
            element={
              <ProtectedRoute>
                <ExpenseCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/payables"
            element={
              <ProtectedRoute>
                <PayablesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/currency"
            element={
              <ProtectedRoute>
                <CurrencySettingsPage />
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
