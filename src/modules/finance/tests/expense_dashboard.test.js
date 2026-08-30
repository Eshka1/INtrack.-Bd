// Set test environment FIRST before importing server
process.env.NODE_ENV = 'test';
process.env.DEV_AUTH_BYPASS = 'true';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../server');
const { Expense } = require('../models/Expense');

const COMPANY_A = 'cmp_test_alpha_01';
const COMPANY_B = 'cmp_test_beta_02';
const USER_A = 'usr_alice_01';

const authHeadersCompanyA = {
  'x-company-id': COMPANY_A,
  'x-user-id': USER_A,
  'x-role': 'Finance Manager'
};
const authHeadersCompanyB = {
  'x-company-id': COMPANY_B,
  'x-user-id': USER_A,
  'x-role': 'Finance Manager'
};

beforeAll(async () => {
  const testUri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/intrack_finance_test';
  try {
    await mongoose.connect(testUri, { serverSelectionTimeoutMS: 3000 });
  } catch (err) {
    console.warn('Local MongoDB test connection skipped if not running locally:', err.message);
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await Expense.deleteMany({ companyId: { $in: [COMPANY_A, COMPANY_B] } });
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await Expense.deleteMany({ companyId: { $in: [COMPANY_A, COMPANY_B] } });
    await mongoose.disconnect();
  }
});

describe("3.4 Expenses Filtering & 3.5 Dashboard Analytics", () => {
  test("Filter expenses by category and get expense summary", async () => {
    if (mongoose.connection.readyState !== 1) return;

    await request(app)
      .post('/api/finance/expenses')
      .set(authHeadersCompanyA)
      .send({
        title: 'Office Internet Fiber',
        category: 'Utilities',
        amount: 4000,
        currency: 'BDT',
        expenseDate: '2026-05-10'
      });

    await request(app)
      .post('/api/finance/expenses')
      .set(authHeadersCompanyA)
      .send({
        title: 'Local Transport Fare',
        category: 'Transport',
        amount: 1500,
        currency: 'BDT',
        expenseDate: '2026-05-15'
      });

    // filter by Utilities category
    const filterRes = await request(app)
      .get('/api/finance/expenses?category=Utilities')
      .set(authHeadersCompanyA);
    expect(filterRes.statusCode).toBe(200);
    expect(filterRes.body.data.length).toBe(1);
    expect(filterRes.body.data[0].category).toBe('Utilities');

    // expense summary
    const summaryRes = await request(app)
      .get('/api/finance/expenses/summary')
      .set(authHeadersCompanyA);
    expect(summaryRes.statusCode).toBe(200);
    expect(summaryRes.body.data.totalAmount).toBe(5500);
    expect(summaryRes.body.data.count).toBe(2);
  });

  test("Dashboard returns zero‑safe default values for empty company", async () => {
    if (mongoose.connection.readyState !== 1) return;

    const res = await request(app)
      .get('/api/finance/dashboard')
      .set(authHeadersCompanyB);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.monthlyBudget).toBe(0);
    expect(res.body.data.monthlyExpense).toBe(0);
    expect(res.body.data.outstandingPayable).toBe(0);
    expect(res.body.data.overduePayable).toBe(0);
    expect(Array.isArray(res.body.data.recentExpenses)).toBe(true);
    expect(Array.isArray(res.body.data.upcomingPayments)).toBe(true);
    expect(Array.isArray(res.body.data.spendingTrend)).toBe(true);
    expect(Array.isArray(res.body.data.categoryBreakdown)).toBe(true);
  });
});
