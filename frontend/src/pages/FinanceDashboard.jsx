// src/pages/FinanceDashboard.jsx
import { useState, useEffect } from "react";
import { getFinanceDashboard } from "../services/financeApi";

const FinanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getFinanceDashboard();
        // axios res.data → http body; then .data is backend wrapped payload
        const payload = res.data.data;
        setDashboardData(payload);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{color:"red"}}>{error}</div>;
  if (!dashboardData) return null;

  return (
    <div>
      <h2>Dashboard Overview</h2>
      <div>
        <p><strong>Monthly Budget:</strong> {dashboardData.monthlyBudget} BDT</p>
        <p><strong>Total Expense:</strong> {dashboardData.monthlyExpense} BDT</p>
        <p><strong>Remaining:</strong> {dashboardData.monthlyBudget - dashboardData.monthlyExpense} BDT</p>
      </div>
      <h3 style={{marginTop:"2rem"}}>Expense Breakdown</h3>
      {dashboardData.recentExpenses?.map((item, idx) => (
        <div key={idx} style={{border:"1px solid #ccc", padding:"0.5rem", margin:"0.4rem 0"}}>
          {item.title} — {item.amount} BDT
        </div>
      ))}
    </div>
  );
};

export default FinanceDashboard;
