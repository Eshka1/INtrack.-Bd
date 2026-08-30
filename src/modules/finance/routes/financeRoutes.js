const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const budgetController = require('../controllers/budgetController');
const expenseController = require('../controllers/expenseController');
const payableController = require('../controllers/payableController');
const dashboardController = require('../controllers/dashboardController');

const { module1AuthMiddleware } = require('../integrations/module1AuthAdapter');
const { requireFinancePermission } = require('../middleware/requireFinancePermission');
const {
  validateObjectId,
  validateCurrencyUpdate,
  validateBudgetCreate,
  validateBudgetUpdate,
  validateExpenseCreate,
  validateExpenseUpdate,
  validatePayableCreate,
  validatePaymentRecord
} = require('../validators/financeValidators');

router.use(module1AuthMiddleware);

// 1. Dashboard Overview
router.get(
  '/dashboard',
  requireFinancePermission('finance.read'),
  dashboardController.getDashboardOverview
);

// 2. Multi‑Currency Support (REQ‑3.1)
router.get(
  '/currency',
  requireFinancePermission('finance.read'),
  currencyController.getCurrencySettings
);
router.put(
  '/currency',
  requireFinancePermission('finance.update'),
  validateCurrencyUpdate,
  currencyController.updateCurrencySettings
);

// 3. Operational Budget Mapping (REQ‑3.2)
router.get(
  '/budgets/summary',
  requireFinancePermission('finance.read'),
  budgetController.getBudgetSummary
);
router.get(
  '/budgets',
  requireFinancePermission('finance.read'),
  budgetController.getBudgets
);
router.post(
  '/budgets',
  requireFinancePermission('finance.create'),
  validateBudgetCreate,
  budgetController.createBudget
);
router.get(
  '/budgets/:budgetId',
  requireFinancePermission('finance.read'),
  validateObjectId('budgetId'),
  budgetController.getBudgetById
);
router.patch(
  '/budgets/:budgetId',
  requireFinancePermission('finance.update'),
  validateObjectId('budgetId'),
  validateBudgetUpdate,
  budgetController.updateBudget
);
router.delete(
  '/budgets/:budgetId',
  requireFinancePermission('finance.delete'),
  validateObjectId('budgetId'),
  budgetController.deleteBudget
);

// 4. Comprehensive Expense Cycle Filtering (REQ‑3.4)
router.get(
  '/expenses/summary',
  requireFinancePermission('finance.read'),
  expenseController.getExpenseSummary
);
router.get(
  '/expenses',
  requireFinancePermission('finance.read'),
  expenseController.getExpenses
);
router.post(
  '/expenses',
  requireFinancePermission('finance.create'),
  validateExpenseCreate,
  expenseController.createExpense
);
router.get(
  '/expenses/:expenseId',
  requireFinancePermission('finance.read'),
  validateObjectId('expenseId'),
  expenseController.getExpenseById
);
router.patch(
  '/expenses/:expenseId',
  requireFinancePermission('finance.update'),
  validateObjectId('expenseId'),
  validateExpenseUpdate,
  expenseController.updateExpense
);
router.delete(
  '/expenses/:expenseId',
  requireFinancePermission('finance.delete'),
  validateObjectId('expenseId'),
  expenseController.deleteExpense
);

// 5. Accounts Payable Aging Ledger (REQ‑3.3)
router.get(
  '/payables/aging',
  requireFinancePermission('finance.read'),
  payableController.getAgingLedger
);
router.get(
  '/payables',
  requireFinancePermission('finance.read'),
  payableController.getPayables
);
router.post(
  '/payables',
  requireFinancePermission('finance.create'),
  validatePayableCreate,
  payableController.createPayable
);
router.get(
  '/payables/:payableId',
  requireFinancePermission('finance.read'),
  validateObjectId('payableId'),
  payableController.getPayableById
);
router.patch(
  '/payables/:payableId',
  requireFinancePermission('finance.update'),
  validateObjectId('payableId'),
  payableController.updatePayable
);
router.delete(
  '/payables/:payableId',
  requireFinancePermission('finance.delete'),
  validateObjectId('payableId'),
  payableController.deletePayable
);
router.post(
  '/payables/:payableId/payments',
  requireFinancePermission('finance.update'),
  validateObjectId('payableId'),
  validatePaymentRecord,
  payableController.recordPayment
);

// 6. Visual Consumption Trend & Analytics (REQ‑3.5)
// Only consumption-trend is implemented in dashboardController
router.get(
  '/analytics/consumption-trend',
  requireFinancePermission('finance.read'),
  dashboardController.getConsumptionTrend
);

// The below routes are NOT implemented, commented out to prevent server crash
/*
router.get(
  '/analytics/spending‑trend',
  requireFinancePermission('finance.read'),
  analyticsController.getSpendingTrend
);
router.get(
  '/analytics/category‑breakdown',
  requireFinancePermission('finance.read'),
  analyticsController.getCategoryBreakdown
);
router.get(
  '/consumption‑records',
  requireFinancePermission('finance.read'),
  analyticsController.getConsumptionRecordsHandler
);
router.post(
  '/consumption‑records',
  requireFinancePermission('finance.create'),
  analyticsController.createConsumptionRecordHandler
);
*/

module.exports = router;
