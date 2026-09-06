import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import api from '../services/api';
import { getFinanceDashboard } from '../services/financeApi';

const Dashboard = () => {
  const { user, tenantId, companyName, logout } = useTenant();
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [finance, setFinance] = useState(null);
  const [loadingFinance, setLoadingFinance] = useState(true);
  const [financeError, setFinanceError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await api.get('/items');
        setItems(data.data);
      } catch (err) {
        console.error('Failed to load items', err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const { data } = await getFinanceDashboard();
        setFinance(data.data);
      } catch (err) {
        console.error('Failed to load finance dashboard', err);
        setFinanceError('Finance summary is temporarily unavailable.');
      } finally {
        setLoadingFinance(false);
      }
    };
    fetchFinance();
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>{companyName}</h1>
          <p className="tenant-id">Tenant ID: <code>{tenantId}</code></p>
        </div>
        <div className="user-info">
          <Link to="/categories" className="link-nav">Categories</Link>
          <Link to="/warehouses" className="link-nav">Warehouses</Link>
          <Link to="/team" className="link-nav">Team &amp; Roles</Link>
          <Link to="/billing" className="link-nav">Billing</Link>
          <span>{user?.firstName} {user?.lastName} · {user?.role}</span>
          <button onClick={logout}>Log Out</button>
        </div>
      </header>

      <main>
        <section className="finance-dashboard-summary" aria-labelledby="finance-summary-heading">
          <div className="section-header">
            <div>
              <h2 id="finance-summary-heading">Finance Overview</h2>
              <p className="section-subtitle">Your current budget, expenses, payables, and finance tools.</p>
            </div>
            <Link to="/finance" className="link-nav">Finance Dashboard</Link>
          </div>

          {loadingFinance ? (
            <p>Loading finance summary...</p>
          ) : financeError ? (
            <div className="alert alert-error">{financeError}</div>
          ) : finance ? (
            <>
              <div className="finance-stat-grid">
                <div className="finance-stat-card">
                  <span>Monthly Expense</span>
                  <strong>{finance.monthlyExpense?.toLocaleString()} {finance.displayCurrency}</strong>
                </div>
                <div className="finance-stat-card">
                  <span>Budget</span>
                  <strong>{finance.monthlyBudget?.toLocaleString()} {finance.displayCurrency}</strong>
                </div>
                <div className="finance-stat-card">
                  <span>Expenses</span>
                  <strong>{finance.recentExpenses?.length || 0} recent</strong>
                  <Link to="/finance/expenses">View expenses</Link>
                </div>
                <div className="finance-stat-card">
                  <span>Payables</span>
                  <strong>{finance.outstandingPayable?.toLocaleString()} {finance.displayCurrency}</strong>
                  <Link to="/finance/payables">View payables</Link>
                </div>
              </div>

              <nav className="finance-action-grid" aria-label="Finance actions">
                <Link to="/finance/expenses/new">Add Expense</Link>
                <Link to="/finance/budget">Budget</Link>
                <Link to="/finance/expenses">Expenses</Link>
                <Link to="/finance/payables">Payables</Link>
                <Link to="/finance/analytics">Analytics</Link>
                <Link to="/finance/currency">Currency</Link>
              </nav>
            </>
          ) : null}
        </section>

        <h2>Your Items (Isolated to {companyName})</h2>
        <p className="isolation-note">
          Every item below belongs exclusively to <strong>{tenantId}</strong>.
          No other company registered on IN-Track can see, query, or modify this data.
        </p>

        {loadingItems ? (
          <p>Loading items...</p>
        ) : items.length === 0 ? (
          <p>No items yet. Your workspace is empty and ready to go.</p>
        ) : (
          <ul className="item-list">
            {items.map((item) => (
              <li key={item._id}>
                {item.name} — Qty: {item.quantity}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
