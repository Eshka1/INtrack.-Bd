const fs = require('fs');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'intrack-smoke-'));
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.SMOKE_PORT || '5099';
process.env.JWT_SECRET = 'intrack-smoke-test-secret';
process.env.JWT_EXPIRE = '1h';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27018/intrack-smoke-unavailable';
process.env.MONGO_TIMEOUT_MS = '250';
process.env.ALLOW_LOCAL_AUTH_FALLBACK = 'true';
process.env.MODULE4_USE_MONGODB = 'false';
process.env.LOCAL_AUTH_DATA_FILE = path.join(tempDir, 'local-auth.json');
process.env.MODULE4_DATA_FILE = path.join(tempDir, 'module4-store.json');

const app = require('../server');

const base = `http://127.0.0.1:${process.env.PORT}/api`;

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { response, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  let server;
  try {
    server = await app.start();

    const health = await jsonRequest(`${base}/health`);
    assert(health.response.ok, 'Health endpoint failed');
    assert(health.body.databaseMode === 'local-auth-fallback', 'Backend did not enter local fallback mode');

    const unauthAudit = await jsonRequest(`${base}/module4/audit`);
    assert(unauthAudit.response.status === 401, 'Module 4 should require authentication');

    const stamp = Date.now();
    const ownerEmail = `farhan.${stamp}@example.com`;
    const companyEmail = `company.${stamp}@example.com`;
    const password = 'DemoPass123!';

    const register = await jsonRequest(`${base}/auth/register-company`, {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Farhan Demo Inventory Ltd',
        companyEmail,
        industry: 'Manufacturing',
        phoneNumber: '01700000000',
        firstName: 'Farhan',
        lastName: 'Ahmed',
        ownerEmail,
        password
      })
    });
    assert(register.response.status === 201, `Registration failed: ${JSON.stringify(register.body)}`);
    assert(register.body.token, 'Registration did not return a JWT');

    const wrongLogin = await jsonRequest(`${base}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: ownerEmail, password: 'WrongPassword!' })
    });
    assert(wrongLogin.response.status === 401, 'Wrong password should be rejected');

    const login = await jsonRequest(`${base}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: ownerEmail, password })
    });
    assert(login.response.ok, `Login failed: ${JSON.stringify(login.body)}`);
    const token = login.body.token;
    assert(token, 'Login did not return a JWT');

    const authHeaders = { Authorization: `Bearer ${token}` };
    const me = await jsonRequest(`${base}/auth/me`, { headers: authHeaders });
    assert(me.response.ok, `Authenticated /me failed: ${JSON.stringify(me.body)}`);
    assert(me.body.data.email === ownerEmail, 'Authenticated user email mismatch');

    const auditCreate = await jsonRequest(`${base}/module4/audit`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        entity: 'Inventory',
        action: 'UPDATE',
        recordRef: 'SKU-SMOKE-001',
        reason: 'Smoke test inventory correction',
        oldValue: { quantity: 10, status: 'Available' },
        newValue: { quantity: 15, status: 'Available' }
      })
    });
    assert(auditCreate.response.status === 201, `Audit creation failed: ${JSON.stringify(auditCreate.body)}`);

    const auditList = await jsonRequest(`${base}/module4/audit`, { headers: authHeaders });
    assert(auditList.response.ok, 'Audit list failed');
    assert(auditList.body.data.some(row => row.recordRef === 'SKU-SMOKE-001'), 'Audit record was not persisted');

    const companyCreate = await jsonRequest(`${base}/module4/admin/companies`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'NorthStar Smoke Test Ltd',
        email: `northstar.${stamp}@example.com`,
        subscription: 'Basic'
      })
    });
    assert(companyCreate.response.status === 201, `Company creation failed: ${JSON.stringify(companyCreate.body)}`);

    const companyId = companyCreate.body.data._id;
    const planChange = await jsonRequest(`${base}/module4/admin/subscription/${companyId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ plan: 'Premium' })
    });
    assert(planChange.response.ok, `Subscription update failed: ${JSON.stringify(planChange.body)}`);
    assert(planChange.body.data.subscription === 'Premium', 'Subscription was not updated to Premium');

    const notifications = await jsonRequest(`${base}/module4/notifications`, { headers: authHeaders });
    assert(notifications.response.ok, 'Notification list failed');
    assert(notifications.body.data.length >= 1, 'Expected Module 4 notifications were not created');

    const csvResponse = await fetch(`${base}/module4/export/excel`, { headers: authHeaders });
    assert(csvResponse.ok, 'CSV export failed');
    const csvText = await csvResponse.text();
    assert(csvText.includes('Audit Trail') && csvText.includes('Companies'), 'CSV export content is incomplete');

    const pdfResponse = await fetch(`${base}/module4/export/pdf`, { headers: authHeaders });
    assert(pdfResponse.ok, 'PDF export failed');
    const pdfBytes = Buffer.from(await pdfResponse.arrayBuffer());
    assert(pdfBytes.subarray(0, 4).toString() === '%PDF', 'PDF export signature is invalid');

    console.log('\nIN-Track local smoke test PASSED');
    console.log('✓ backend health + local fallback');
    console.log('✓ Module 4 rejects unauthenticated requests');
    console.log('✓ company registration with email/password');
    console.log('✓ wrong password is rejected');
    console.log('✓ login with email/password');
    console.log('✓ authenticated /auth/me');
    console.log('✓ Module 4 audit trail create/list');
    console.log('✓ Module 4 company create/subscription update');
    console.log('✓ Module 4 notifications');
    console.log('✓ Module 4 CSV/PDF export');
  } catch (error) {
    console.error('\nIN-Track local smoke test FAILED');
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect().catch(() => {});
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
})();
