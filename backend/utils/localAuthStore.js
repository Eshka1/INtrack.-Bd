const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const file = process.env.LOCAL_AUTH_DATA_FILE || path.join(__dirname, '..', 'data', 'local-auth.json');

function ensure() {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({ tenants: [], users: [] }, null, 2));
  }
}

function read() {
  ensure();
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function write(data) {
  ensure();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(derived).toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, expectedHex] = stored.split(':');
  const derived = await scrypt(password, salt, 64);
  const actual = Buffer.from(derived);
  const expected = Buffer.from(expectedHex, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
}

function publicUser(user, tenant) {
  return {
    _id: user._id,
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    tenantId: user.tenantId,
    isActive: user.isActive !== false,
    deletedAt: null,
    role: {
      _id: user.roleId,
      name: user.roleName || 'Owner',
      permissions: user.permissions || ['*'],
      isOwnerRole: true
    },
    tenant: {
      _id: tenant._id,
      tenantId: tenant.tenantId,
      companyName: tenant.companyName,
      companyEmail: tenant.companyEmail,
      industry: tenant.industry,
      phoneNumber: tenant.phoneNumber,
      isActive: tenant.isActive !== false,
      currency: tenant.currency || 'USD'
    }
  };
}

async function registerCompany(payload) {
  const data = read();
  const companyEmail = String(payload.companyEmail || '').trim().toLowerCase();
  const ownerEmail = String(payload.ownerEmail || '').trim().toLowerCase();

  if (data.tenants.some(t => t.companyEmail === companyEmail)) {
    const err = new Error('A company is already registered with this email');
    err.statusCode = 400;
    throw err;
  }
  if (data.users.some(u => u.email === ownerEmail)) {
    const err = new Error('A user is already registered with this email');
    err.statusCode = 400;
    throw err;
  }

  const tenant = {
    _id: newId('local_tenant'),
    tenantId: `tn_${crypto.randomBytes(8).toString('hex')}`,
    companyName: payload.companyName,
    companyEmail,
    industry: payload.industry,
    phoneNumber: payload.phoneNumber || '',
    isActive: true,
    currency: 'USD',
    createdAt: new Date().toISOString()
  };

  const user = {
    _id: newId('local_user'),
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: ownerEmail,
    passwordHash: await hashPassword(payload.password),
    tenantId: tenant.tenantId,
    tenantRef: tenant._id,
    roleId: newId('local_role'),
    roleName: 'Owner',
    permissions: ['*'],
    isActive: true,
    createdAt: new Date().toISOString()
  };

  data.tenants.push(tenant);
  data.users.push(user);
  write(data);
  return { user: publicUser(user, tenant), tenant };
}

async function authenticate(email, password) {
  const data = read();
  const normalized = String(email || '').trim().toLowerCase();
  const user = data.users.find(u => u.email === normalized && u.isActive !== false);
  if (!user) return null;
  if (!(await verifyPassword(password, user.passwordHash))) return null;
  const tenant = data.tenants.find(t => t._id === user.tenantRef || t.tenantId === user.tenantId);
  if (!tenant || tenant.isActive === false) return null;
  return publicUser(user, tenant);
}

async function getUserById(id) {
  const data = read();
  const user = data.users.find(u => String(u._id) === String(id));
  if (!user) return null;
  const tenant = data.tenants.find(t => t._id === user.tenantRef || t.tenantId === user.tenantId);
  if (!tenant) return null;
  return publicUser(user, tenant);
}

module.exports = { registerCompany, authenticate, getUserById };
