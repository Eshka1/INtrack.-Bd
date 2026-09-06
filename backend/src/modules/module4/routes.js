const express = require('express');

const store = require('./store');

const router = express.Router();

const ENTITIES = ['Inventory', 'PurchaseOrder', 'Recipe', 'Supplier', 'Warehouse', 'Subscription', 'User', 'Expense'];
const ACTIONS = ['CREATE', 'UPDATE', 'ADJUSTMENT', 'TRANSFER', 'STATUS_CHANGE', 'DELETE'];
const PLANS = ['Basic', 'Premium', 'Enterprise'];
const CHANGE_ACTIONS = ['UPDATE', 'ADJUSTMENT', 'TRANSFER', 'STATUS_CHANGE'];

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function getModule4User(req) {
  const user = req.user || {};
  const firstLast = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return {
    id: user._id || user.id || process.env.DEV_USER_ID || '64b000000000000000000002',
    name: user.name || user.fullName || firstLast || process.env.DEV_USER_NAME || 'Development User',
    role: user.role?.name || user.role || process.env.DEV_USER_ROLE || 'super_admin',
    tenantId: user.tenantId || user.tenant?.tenantId || user.tenant?._id || process.env.DEV_TENANT_ID || '64b000000000000000000001'
  };
}

function requireSuperAdmin(req, res, next) {
  const user = getModule4User(req);
  const developmentOwner = process.env.NODE_ENV !== 'production' && user.role === 'Owner';
  if (user.role !== 'super_admin' && !developmentOwner) {
    return res.status(403).json({ success: false, message: 'Super admin access required.' });
  }
  req.module4User = user;
  next();
}

function makeChanges(oldValue = {}, newValue = {}) {
  const before = oldValue || {};
  const after = newValue || {};
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  return keys
    .filter(key => !same(before[key], after[key]))
    .map(key => ({ key, before: before[key], after: after[key] }));
}

function validateAudit(body = {}) {
  const errors = [];
  if (!ENTITIES.includes(body.entity)) errors.push('Invalid entity.');
  if (!ACTIONS.includes(body.action)) errors.push('Invalid action.');
  if (!body.recordRef || String(body.recordRef).trim().length < 1) errors.push('Record reference is required.');
  if (!body.reason || String(body.reason).trim().length < 8) errors.push('Reason must be at least 8 characters.');

  const oldValue = body.oldValue ?? null;
  const newValue = body.newValue ?? null;

  if (body.action === 'CREATE' && !newValue) errors.push('CREATE requires New Value.');
  if (body.action === 'DELETE' && !oldValue) errors.push('DELETE requires Old Value.');

  if (CHANGE_ACTIONS.includes(body.action)) {
    if (!oldValue || !newValue) errors.push(`${body.action} requires both Old Value and New Value.`);
    else if (same(oldValue, newValue)) errors.push('Old Value and New Value must be different.');
  }

  return errors;
}

router.use(async (req, res, next) => {
  try {
    await store.init();
    req.module4User = getModule4User(req);
    next();
  } catch (error) {
    next(error);
  }
});

router.get('/audit', async (req, res) => {
  const data = await store.list('auditlogs', { tenantId: req.module4User.tenantId });
  res.json({ success: true, data });
});

router.post('/audit', async (req, res) => {
  const errors = validateAudit(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(' '), errors });
  }

  const audit = await store.insert('auditlogs', {
    tenantId: req.module4User.tenantId,
    userId: req.module4User.id,
    userName: req.module4User.name,
    entity: req.body.entity,
    action: req.body.action,
    recordRef: String(req.body.recordRef).trim(),
    reason: String(req.body.reason).trim(),
    oldValue: req.body.oldValue ?? null,
    newValue: req.body.newValue ?? null
  });

  await store.insert('activitylogs', {
    tenantId: req.module4User.tenantId,
    userId: req.module4User.id,
    entity: req.body.entity,
    action: req.body.action,
    recordRef: req.body.recordRef
  });

  await store.insert('notifications', {
    tenantId: req.module4User.tenantId,
    type: 'AUDIT_CHANGE',
    title: `${req.body.entity} ${String(req.body.action).toLowerCase()}`,
    message: `${req.module4User.name} changed ${req.body.entity} ${req.body.recordRef}.`,
    actorId: req.module4User.id,
    actorName: req.module4User.name,
    entity: req.body.entity,
    action: req.body.action,
    recordRef: req.body.recordRef,
    changes: makeChanges(req.body.oldValue, req.body.newValue),
    isRead: false
  });

  res.status(201).json({ success: true, message: 'Audit record saved.', data: audit });
});

router.get('/admin/companies', requireSuperAdmin, async (req, res) => {
  const data = await store.list('tenants');
  res.json({ success: true, data });
});

router.post('/admin/companies', requireSuperAdmin, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const subscription = req.body.subscription || 'Basic';

  if (!name) return res.status(400).json({ success: false, message: 'Company name is required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid company email is required.' });
  }
  if (!PLANS.includes(subscription)) {
    return res.status(400).json({ success: false, message: 'Invalid subscription plan.' });
  }

  const existing = await store.findOne('tenants', { email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'A company with this email already exists.' });
  }

  const company = await store.insert('tenants', { name, email, subscription });

  await store.insert('auditlogs', {
    tenantId: req.module4User.tenantId,
    userId: req.module4User.id,
    userName: req.module4User.name,
    entity: 'Subscription',
    action: 'CREATE',
    recordRef: company.name,
    reason: 'Super admin registered a new company',
    oldValue: null,
    newValue: { company: company.name, email: company.email, plan: company.subscription }
  });

  res.status(201).json({ success: true, message: 'Company created.', data: company });
});

router.patch('/admin/subscription/:id', requireSuperAdmin, async (req, res) => {
  const plan = req.body.plan;
  if (!PLANS.includes(plan)) {
    return res.status(400).json({ success: false, message: 'Invalid subscription plan.' });
  }

  const company = await store.findOne('tenants', { _id: req.params.id });
  if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
  if (company.subscription === plan) return res.json({ success: true, data: company });

  const oldPlan = company.subscription || 'Basic';
  const updated = await store.updateById('tenants', req.params.id, { subscription: plan });

  await store.insert('auditlogs', {
    tenantId: req.module4User.tenantId,
    userId: req.module4User.id,
    userName: req.module4User.name,
    entity: 'Subscription',
    action: 'UPDATE',
    recordRef: company.name,
    reason: `Super admin changed company subscription from ${oldPlan} to ${plan}`,
    oldValue: { plan: oldPlan },
    newValue: { plan }
  });

  await store.insert('notifications', {
    tenantId: req.module4User.tenantId,
    type: 'SUBSCRIPTION_CHANGE',
    title: 'Subscription changed',
    message: `${req.module4User.name} changed ${company.name} from ${oldPlan} to ${plan}.`,
    actorId: req.module4User.id,
    actorName: req.module4User.name,
    entity: 'Subscription',
    action: 'UPDATE',
    recordRef: company.name,
    changes: [{ key: 'plan', before: oldPlan, after: plan }],
    isRead: false
  });

  res.json({ success: true, message: 'Subscription updated.', data: updated });
});

router.get('/notifications', async (req, res) => {
  const data = await store.list('notifications', { tenantId: req.module4User.tenantId });
  res.json({ success: true, data });
});

router.patch('/notifications/read-all', async (req, res) => {
  const rows = await store.list('notifications', { tenantId: req.module4User.tenantId });
  await Promise.all(rows.filter(row => !row.isRead).map(row =>
    store.updateById('notifications', row._id, { isRead: true })
  ));
  res.json({ success: true, message: 'All notifications marked read.' });
});

router.patch('/notifications/:id/read', async (req, res) => {
  const data = await store.updateById('notifications', req.params.id, { isRead: true });
  if (!data) return res.status(404).json({ success: false, message: 'Notification not found.' });
  res.json({ success: true, data });
});

router.get('/export/excel', async (req, res) => {
  const audit = await store.list('auditlogs', { tenantId: req.module4User.tenantId });
  const notifications = await store.list('notifications', { tenantId: req.module4User.tenantId });
  const companies = await store.list('tenants');

  const sections = [
    ['Audit Trail', audit],
    ['Companies', companies],
    ['Notifications', notifications]
  ];
  const csv = sections.flatMap(([name, rows]) => {
    const normalized = rows.length ? rows : [{ message: 'No data' }];
    const keys = [...new Set(normalized.flatMap(row => Object.keys(row)))];
    const escape = value => `"${String(typeof value === 'object' && value !== null ? JSON.stringify(value) : value ?? '').replace(/"/g, '""')}"`;
    return [
      name,
      keys.map(escape).join(','),
      ...normalized.map(row => keys.map(key => escape(row[key])).join(',')),
      ''
    ];
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="INTrack_Module4.csv"');
  res.send(csv);
});

router.get('/export/pdf', async (req, res) => {
  const audit = await store.list('auditlogs', { tenantId: req.module4User.tenantId });
  const companies = await store.list('tenants');
  const notifications = await store.list('notifications', { tenantId: req.module4User.tenantId });
  const lines = [
    'IN-Track Module 4',
    '',
    `Companies: ${companies.length}`,
    `Audit records: ${audit.length}`,
    `Notifications: ${notifications.length}`,
    '',
    'Recent Audit History',
    ...audit.slice(0, 20).map((item, index) =>
      `${index + 1}. ${item.userName || item.userId} | ${item.action} | ${item.entity} | ${item.recordRef} | ${item.reason || ''}`
    )
  ];

  const objects = [];
  const addObject = content => {
    objects.push(content);
    return objects.length;
  };

  const escapedLines = lines.map(line => String(line).replace(/[()\\]/g, '\\$&'));
  const text = escapedLines.map((line, index) => `BT /F1 10 Tf 50 ${760 - (index * 16)} Td (${line}) Tj ET`).join('\n');
  const contentId = addObject(`<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`);
  const pageId = addObject(`<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents ${contentId} 0 R >>`);
  addObject(`<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`);
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const catalogId = addObject('<< /Type /Catalog /Pages 3 0 R >>');
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="INTrack_Module4.pdf"');
  res.send(Buffer.from(pdf));
});

module.exports = router;
