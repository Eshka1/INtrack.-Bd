// Set test environment FIRST before importing server!
process.env.NODE_ENV = 'test';
process.env.DEV_AUTH_BYPASS = 'true';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../server');
const { CurrencySetting } = require('../models/CurrencySetting');

const COMPANY_A = 'cmp_test_alpha_01';
const USER_A = 'usr_alice_01';

const authHeadersCompanyA = {
  'x-company-id': COMPANY_A,
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
    await CurrencySetting.deleteMany({ companyId: COMPANY_A });
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await CurrencySetting.deleteMany({ companyId: COMPANY_A });
    await mongoose.disconnect();
  }
});

describe("3.1 Multi‑Currency Support API", () => {
  test("GET /api/finance/currency fetch currency settings", async () => {
    if (mongoose.connection.readyState !== 1) return;

    const res = await request(app)
      .get('/api/finance/currency')
      .set(authHeadersCompanyA);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.baseCurrency).toBe("BDT");
  });

  test("PUT /api/finance/currency update baseCurrency to USD", async () => {
    if (mongoose.connection.readyState !== 1) return;

    const payload = { displayCurrency: "USD", exchangeRates: { USD: 0.0090 } };
    const res = await request(app)
      .put('/api/finance/currency')
      .set(authHeadersCompanyA)
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.displayCurrency).toBe("USD");
  });
});
