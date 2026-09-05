require("dotenv").config();

const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const cron = require("node-cron");

const store = require("./store");

const app = express();
const PORT = Number(process.env.PORT || 5000);

const ENTITIES = ["Inventory", "PurchaseOrder", "Recipe", "Supplier", "Warehouse", "Subscription", "User", "Expense"];
const ACTIONS = ["CREATE", "UPDATE", "ADJUSTMENT", "TRANSFER", "STATUS_CHANGE", "DELETE"];
const PLANS = ["Basic", "Premium", "Enterprise"];
const CHANGE_ACTIONS = ["UPDATE", "ADJUSTMENT", "TRANSFER", "STATUS_CHANGE"];

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  req.user = {
    id: process.env.DEV_USER_ID || "64b000000000000000000002",
    name: process.env.DEV_USER_NAME || "Farhan Ahmed",
    role: process.env.DEV_USER_ROLE || "super_admin",
    tenantId: process.env.DEV_TENANT_ID || "64b000000000000000000001"
  };
  next();
});

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

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
  if (!ENTITIES.includes(body.entity)) errors.push("Invalid entity.");
  if (!ACTIONS.includes(body.action)) errors.push("Invalid action.");
  if (!body.recordRef || String(body.recordRef).trim().length < 1) errors.push("Record reference is required.");
  if (!body.reason || String(body.reason).trim().length < 8) errors.push("Reason must be at least 8 characters.");

  const oldValue = body.oldValue ?? null;
  const newValue = body.newValue ?? null;

  if (body.action === "CREATE" && !newValue) errors.push("CREATE requires New Value.");
  if (body.action === "DELETE" && !oldValue) errors.push("DELETE requires Old Value.");

  if (CHANGE_ACTIONS.includes(body.action)) {
    if (!oldValue || !newValue) errors.push(`${body.action} requires both Old Value and New Value.`);
    else if (same(oldValue, newValue)) errors.push("Old Value and New Value must be different.");
  }
  return errors;
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "IN-Track Module 4 API is running",
    mode: store.useMongo ? "mongodb" : "local-json"
  });
});

// AUDIT
app.get("/api/module4/audit", async (req, res) => {
  try {
    const data = await store.list("auditlogs", { tenantId: req.user.tenantId });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/module4/audit", async (req, res) => {
  try {
    const errors = validateAudit(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(" "), errors });
    }

    const audit = await store.insert("auditlogs", {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      userName: req.user.name,
      entity: req.body.entity,
      action: req.body.action,
      recordRef: String(req.body.recordRef).trim(),
      reason: String(req.body.reason).trim(),
      oldValue: req.body.oldValue ?? null,
      newValue: req.body.newValue ?? null
    });

    await store.insert("activitylogs", {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      entity: req.body.entity,
      action: req.body.action,
      recordRef: req.body.recordRef
    });

    await store.insert("notifications", {
      tenantId: req.user.tenantId,
      type: "AUDIT_CHANGE",
      title: `${req.body.entity} ${String(req.body.action).toLowerCase()}`,
      message: `${req.user.name} changed ${req.body.entity} ${req.body.recordRef}.`,
      actorId: req.user.id,
      actorName: req.user.name,
      entity: req.body.entity,
      action: req.body.action,
      recordRef: req.body.recordRef,
      changes: makeChanges(req.body.oldValue, req.body.newValue),
      isRead: false
    });

    res.status(201).json({ success: true, message: "Audit record saved.", data: audit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// COMPANIES / SUPER ADMIN
app.get("/api/module4/admin/companies", async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Super admin access required." });
    }
    const data = await store.list("tenants");
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/module4/admin/companies", async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Super admin access required." });
    }

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const subscription = req.body.subscription || "Basic";

    if (!name) return res.status(400).json({ success: false, message: "Company name is required." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Valid company email is required." });
    }
    if (!PLANS.includes(subscription)) {
      return res.status(400).json({ success: false, message: "Invalid subscription plan." });
    }

    const existing = await store.findOne("tenants", { email });
    if (existing) {
      return res.status(409).json({ success: false, message: "A company with this email already exists." });
    }

    const company = await store.insert("tenants", { name, email, subscription });

    await store.insert("auditlogs", {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      userName: req.user.name,
      entity: "Subscription",
      action: "CREATE",
      recordRef: company.name,
      reason: "Super admin registered a new company",
      oldValue: null,
      newValue: {
        company: company.name,
        email: company.email,
        plan: company.subscription
      }
    });

    await store.insert("notifications", {
      tenantId: req.user.tenantId,
      type: "COMPANY_CREATED",
      title: "New company registered",
      message: `${req.user.name} added ${company.name} with ${company.subscription} plan.`,
      actorId: req.user.id,
      actorName: req.user.name,
      entity: "Subscription",
      action: "CREATE",
      recordRef: company.name,
      changes: [
        { key: "company", before: null, after: company.name },
        { key: "plan", before: null, after: company.subscription }
      ],
      isRead: false
    });

    res.status(201).json({ success: true, message: "Company created.", data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch("/api/module4/admin/subscription/:id", async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Super admin access required." });
    }

    const plan = req.body.plan;
    if (!PLANS.includes(plan)) {
      return res.status(400).json({ success: false, message: "Invalid subscription plan." });
    }

    const company = await store.findOne("tenants", { _id: req.params.id });
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    if (company.subscription === plan) return res.json({ success: true, data: company });

    const oldPlan = company.subscription || "Basic";
    const updated = await store.updateById("tenants", req.params.id, { subscription: plan });

    await store.insert("auditlogs", {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      userName: req.user.name,
      entity: "Subscription",
      action: "UPDATE",
      recordRef: company.name,
      reason: `Super admin changed company subscription from ${oldPlan} to ${plan}`,
      oldValue: { plan: oldPlan },
      newValue: { plan }
    });

    await store.insert("notifications", {
      tenantId: req.user.tenantId,
      type: "SUBSCRIPTION_CHANGE",
      title: "Subscription changed",
      message: `${req.user.name} changed ${company.name} from ${oldPlan} to ${plan}.`,
      actorId: req.user.id,
      actorName: req.user.name,
      entity: "Subscription",
      action: "UPDATE",
      recordRef: company.name,
      changes: [{ key: "plan", before: oldPlan, after: plan }],
      isRead: false
    });

    res.json({ success: true, message: "Subscription updated.", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// NOTIFICATIONS
app.get("/api/module4/notifications", async (req, res) => {
  try {
    const data = await store.list("notifications", { tenantId: req.user.tenantId });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch("/api/module4/notifications/read-all", async (req, res) => {
  try {
    const rows = await store.list("notifications", { tenantId: req.user.tenantId });
    for (const row of rows) {
      if (!row.isRead) await store.updateById("notifications", row._id, { isRead: true });
    }
    res.json({ success: true, message: "All notifications marked read." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch("/api/module4/notifications/:id/read", async (req, res) => {
  try {
    const data = await store.updateById("notifications", req.params.id, { isRead: true });
    if (!data) return res.status(404).json({ success: false, message: "Notification not found." });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// EXPORT
app.get("/api/module4/export/excel", async (req, res) => {
  try {
    const audit = await store.list("auditlogs", { tenantId: req.user.tenantId });
    const notifications = await store.list("notifications", { tenantId: req.user.tenantId });
    const companies = await store.list("tenants");

    const workbook = new ExcelJS.Workbook();

    const add = (name, rows) => {
      const sheet = workbook.addWorksheet(name);
      if (!rows.length) {
        sheet.addRow(["No data"]);
        return;
      }
      const flat = rows.map(row => {
        const out = {};
        for (const [k, v] of Object.entries(row)) {
          out[k] = typeof v === "object" && v !== null ? JSON.stringify(v) : v;
        }
        return out;
      });
      const keys = [...new Set(flat.flatMap(row => Object.keys(row)))];
      sheet.columns = keys.map(key => ({ header: key, key, width: 24 }));
      flat.forEach(row => sheet.addRow(row));
      sheet.getRow(1).font = { bold: true };
    };

    add("Audit Trail", audit);
    add("Companies", companies);
    add("Notifications", notifications);

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="INTrack_Module4.xlsx"');
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/module4/export/pdf", async (req, res) => {
  try {
    const audit = await store.list("auditlogs", { tenantId: req.user.tenantId });
    const companies = await store.list("tenants");
    const notifications = await store.list("notifications", { tenantId: req.user.tenantId });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="INTrack_Module4.pdf"');

    const doc = new PDFDocument({ margin: 42 });
    doc.pipe(res);

    doc.fontSize(20).text("IN-Track Module 4", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Companies: ${companies.length}`);
    doc.text(`Audit records: ${audit.length}`);
    doc.text(`Notifications: ${notifications.length}`);
    doc.moveDown();

    doc.fontSize(14).text("Recent Audit History");
    audit.slice(0, 20).forEach((item, i) => {
      doc.moveDown(.4);
      doc.fontSize(9).text(`${i + 1}. ${item.userName || item.userId} | ${item.action} | ${item.entity} | ${item.recordRef}`);
      doc.fontSize(8).fillColor("#666").text(item.reason || "");
      doc.fillColor("#000");
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ZERO ACTIVITY JOB
async function runZeroActivityCheck() {
  try {
    const companies = await store.list("tenants");
    const activity = await store.list("activitylogs");
    const notifications = await store.list("notifications");
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);

    for (const company of companies) {
      const hasRecent = activity.some(a =>
        String(a.tenantId) === String(company._id) &&
        new Date(a.createdAt).getTime() >= cutoff
      );

      if (!hasRecent) {
        const alreadySent = notifications.some(n =>
          String(n.tenantId) === String(company._id) &&
          n.type === "ZERO_ACTIVITY" &&
          new Date(n.createdAt).getTime() >= cutoff
        );

        if (!alreadySent) {
          await store.insert("notifications", {
            tenantId: String(company._id),
            type: "ZERO_ACTIVITY",
            title: "Zero activity detected",
            message: `${company.name} has no recorded activity in the last 24 hours.`,
            actorName: "System",
            entity: "Tenant",
            action: "ZERO_ACTIVITY",
            recordRef: company.name,
            changes: [],
            isRead: false
          });
        }
      }
    }
  } catch (error) {
    console.error("Zero activity job:", error.message);
  }
}

async function start() {
  await store.init();

  if (String(process.env.ENABLE_ZERO_ACTIVITY_JOB || "false").toLowerCase() === "true") {
    cron.schedule("0 * * * *", runZeroActivityCheck);
    console.log("✓ Zero-activity job enabled (hourly)");
  }

  app.listen(PORT, () => {
    console.log(`✓ Backend: http://localhost:${PORT}`);
    console.log(`✓ Frontend expected: http://localhost:5173`);
  });
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
