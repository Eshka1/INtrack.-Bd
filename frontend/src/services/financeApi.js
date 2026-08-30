import api from "./api";

// Dashboard
export const getFinanceDashboard = async () => {
  const res = await api.get("/finance/dashboard");
  return res.data;
};

// Budget
export const getBudget = async () => await api.get("/finance/budgets/summary");
export const createOrUpdateBudget = async (payload) => await api.post("/finance/budgets", payload);

// Expenses
export const fetchExpenses = async () => await api.get("/finance/expenses");
export const createExpense = async (expenseData) => await api.post("/finance/expenses", expenseData);

// Payables & Payments
export const fetchPayables = async () => await api.get("/finance/payables");
export const createPayable = async (payableData) => await api.post("/finance/payables", payableData);
export const recordPayment = async (payableId, paymentPayload) =>
  await api.post(`/finance/payables/${payableId}/payments`, paymentPayload);
