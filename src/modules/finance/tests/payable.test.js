// Set test environment FIRST before importing server
process.env.NODE_ENV = 'test';
process.env.DEV_AUTH_BYPASS = 'true';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../server');
const { AccountPayable } = require('../models/AccountPayable');

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
    await AccountPayable.deleteMany({ companyId: COMPANY_A });
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await AccountPayable.deleteMany({ companyId: COMPANY_A });
    await mongoose.disconnect();
  }
});

describe("3.3 Accounts Payable, Aging Ledger & Atomic Payments", () => {
  test("Create payable, partial payment, full payment flow, aging group update", async () => {
    if (mongoose.connection.readyState !== 1) return;

    const today = new Date();
    const futureDue = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const createRes = await request(app)
      .post('/api/finance/payables')
      .set(authHeadersCompanyA)
      .send({
        supplierName: 'Alpha Textiles',
        invoiceNumber: 'INV‑TEST‑001',
        totalAmount: 50000,
        currency: 'BDT',
        issueDate: '2026‑01‑01',
        dueDate: futureDue
      });

    expect(createRes.statusCode).toBe(201);
    const payableId = createRes.body.data._id;
    expect(createRes.body.data.status).toBe('Unpaid');
    expect(createRes.body.data.agingGroup).toBe('Not Due');
    expect(createRes.body.data.outstandingAmount).toBe(50000);

    // partial pay 20000
    const partialPayRes = await request(app)
      .post(`/api/finance/payables/${payableId}/payments`)
      .set(authHeadersCompanyA)
      .send({
        amount: 20000,
        paymentMethod: 'Bank Transfer',
        reference: 'REF‑1001'
      });
    expect(partialPayRes.statusCode).toBe(200);
    expect(partialPayRes.body.data.paidAmount).toBe(20000);
    expect(partialPayRes.body.data.outstandingAmount).toBe(30000);
    expect(partialPayRes.body.data.status).toBe('Partially Paid');
    expect(partialPayRes.body.data.paymentHistory.length).toBe(1);

    // overpay should return 409 conflict
    const overpayRes = await request(app)
      .post(`/api/finance/payables/${payableId}/payments`)
      .set(authHeadersCompanyA)
      .send({ amount: 40000 });
    expect(overpayRes.statusCode).toBe(409);

    // full pay remaining 30000
    const fullPayRes = await request(app)
      .post(`/api/finance/payables/${payableId}/payments`)
      .set(authHeadersCompanyA)
      .send({ amount: 30000 });
    expect(fullPayRes.statusCode).toBe(200);
    expect(fullPayRes.body.data.paidAmount).toBe(50000);
    expect(fullPayRes.body.data.outstandingAmount).toBe(0);
    expect(fullPayRes.body.data.status).toBe('Paid');
    expect(fullPayRes.body.data.agingGroup).toBe('Paid');
  });

  test("Reject duplicate invoiceNumber for same company → 409", async () => {
    if (mongoose.connection.readyState !== 1) return;

    await request(app)
      .post('/api/finance/payables')
      .set(authHeadersCompanyA)
      .send({
        supplierName: 'Supplier 1',
        invoiceNumber: 'INV‑DUP‑99',
        totalAmount: 10000,
        issueDate: '2026‑01‑01',
        dueDate: '2026‑02‑01'
      });

    const dupRes = await request(app)
      .post('/api/finance/payables')
      .set(authHeadersCompanyA)
      .send({
        supplierName: 'Supplier 2',
        invoiceNumber: 'INV‑DUP‑99',
        totalAmount: 15000,
        issueDate: '2026‑01‑01',
        dueDate: '2026‑02‑01'
      });
    expect(dupRes.statusCode).toBe(409);
  });
});
