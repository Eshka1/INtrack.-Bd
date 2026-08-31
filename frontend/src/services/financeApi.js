import api from "./api";
export const getCurrencySettings = async () => await api.get("/finance/currency");
export const updateCurrencySettings = async (payload) => await api.put("/finance/currency", payload);
export const getFinanceDashboard = async () => await api.get("/finance/dashboard");

// Budget
export const getBudgets = async () => await api.get("/finance/budgets");
export const getBudgetSummary = async () => await api.get("/finance/budgets/summary");
export const createBudget = async (payload) => await api.post("/finance/budgets", payload);
export const updateBudget = async (budgetId, payload) =>
  await api.patch(`/finance/budgets/${budgetId}`, payload);

// Expenses
export const fetchExpenses = async () => await api.get("/finance/expenses");
export const createExpense = async (expenseData) => await api.post("/finance/expenses", expenseData);

// Payables & Payments
export const fetchPayables = async () => await api.get("/finance/payables");
export const createPayable = async (payableData) => await api.post("/finance/payables", payableData);
export const recordPayment = async (payableId, paymentPayload) =>
  await api.post(`/finance/payables/${payableId}/payments`, paymentPayload);