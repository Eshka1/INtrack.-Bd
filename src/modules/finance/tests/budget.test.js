// Set test environment FIRST before importing server
process.env.NODE_ENV = 'test';
process.env.DEV_AUTH_BYPASS = 'true';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../server');
const { OperationalBudget } = require('../models/OperationalBudget');

const COMPANY_A = 'cmp_test_alpha_01';
const COMPANY_B = 'cmp_test_beta_02';
const USER_A = 'usr_alice_01';
const USER_B = 'usr_bob_02';

const authHeadersCompanyA = {
  'x-company-id': COMPANY_A,
  'x-user-id': USER_A,
  'x-role': 'Finance Manager'
};
const authHeadersCompanyB = {
  'x-company-id': COMPANY_B,
  'x-user-id': USER_B,
  'x-role': 'Finance Manager'
};
const readOnlyHeadersCompanyA = {
  'x-company-id': COMPANY_A,
  'x-user-id': USER_A,
  'x-role': 'Viewer'
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
    await OperationalBudget.deleteMany({ companyId: { $in: [COMPANY_A, COMPANY_B] } });
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await OperationalBudget.deleteMany({ companyId: { $in: [COMPANY_A, COMPANY_B] } });
    await mongoose.disconnect();
  }
});

describe("3.2 Operational Budgets & Tenant Isolation", () => {
  test("Create budget and verify tenant‑isolation (cross‑company 404)", async () => {
    if (mongoose.connection.readyState !== 1) return;

    const createRes = await request(app)
      .post('/api/finance/budgets')
      .set(authHeadersCompanyA)
      .send({
        name: 'Factory Wages Alpha',
        category: 'Factory Wages',
        monthlyAmount: 100000,
        currency: 'BDT',
        dueDay: 10,
        startDate: '2026-01-01'
      });
    expect(createRes.statusCode).toBe(201);
    const budgetId = createRes.body.data._id;

    // Owner company can fetch
    const getResA = await request(app)
      .get(`/api/finance/budgets/${budgetId}`)
      .set(authHeadersCompanyA);
    expect(getResA.statusCode).toBe(200);
    expect(getResA.body.data.name).toBe('Factory Wages Alpha');

    // Different company cannot access → must return 404
    const getResB = await request(app)
      .get(`/api/finance/budgets/${budgetId}`)
      .set(authHeadersCompanyB);
    expect(getResB.statusCode).toBe(404);

    // Summary for company‑B should show zero
    const summaryB = await request(app)
      .get('/api/finance/budgets/summary')
      .set(authHeadersCompanyB);
    expect(summaryB.body.data.totalMonthlyBudget).toBe(0);
    expect(summaryB.body.data.activeBudgetCount).toBe(0);
  });

  test("Validation: reject invalid dueDay (>31) and negative monthlyAmount → 400", async () => {
    if (mongoose.connection.readyState !== 1) return;

    const invalidDayRes = await request(app)
      .post('/api/finance/budgets')
      .set(authHeadersCompanyA)
      .send({
        name: 'Bad Day Budget',
        category: 'Rent',
        monthlyAmount: 5000,
        dueDay: 40,
        startDate: '2026-01-01'
      });
    expect(invalidDayRes.statusCode).toBe(400);

    const negAmountRes = await request(app)
      .post('/api/finance/budgets')
      .set(authHeadersCompanyA)
      .send({
        name: 'Bad Amount Budget',
        category: 'Rent',
        monthlyAmount: -500,
        dueDay: 15,
        startDate: '2026-01-01'
      });
    expect(negAmountRes.statusCode).toBe(400);
  });

  test("Viewer role cannot create budget → 403 forbidden", async () => {
    if (mongoose.connection.readyState !== 1) return;

    const res = await request(app)
      .post('/api/finance/budgets')
      .set(readOnlyHeadersCompanyA)
      .send({
        name: 'Viewer‑Try‑Create',
        category: 'Utilities',
        monthlyAmount: 3000,
        dueDay: 5,
        startDate: '2026-01-01'
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
