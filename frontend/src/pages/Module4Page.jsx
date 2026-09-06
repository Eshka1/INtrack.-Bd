import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../context/TenantContext";

import {
  getAudit,
  createAudit,
  getCompanies,
  addCompany,
  changePlan,
  getNotifications,
  markRead,
  markAll,
  exportExcel,
  exportPDF
} from "../services/module4Api";

import "./Module4Page.css";

const ENTITIES = ["Inventory", "PurchaseOrder", "Recipe", "Supplier", "Warehouse", "Subscription", "User", "Expense"];
const ACTIONS = ["CREATE", "UPDATE", "ADJUSTMENT", "TRANSFER", "STATUS_CHANGE", "DELETE"];
const PLANS = ["Basic", "Premium", "Enterprise"];

function Module4Page() {
  const { user, logout } = useTenant();
  const navigate = useNavigate();
  const [tab, setTab] = useState("audit");
  const [online, setOnline] = useState(true);
  const [audit, setAudit] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const loadAll = async () => {
    try {
      const [auditResponse, companiesResponse, notificationsResponse] = await Promise.all([
        getAudit(),
        getCompanies(),
        getNotifications()
      ]);
      setAudit(auditResponse.data || []);
      setCompanies(companiesResponse.data || []);
      setNotifications(notificationsResponse.data || []);
      setOnline(true);
    } catch (error) {
      console.error(error);
      setOnline(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const unread = notifications.filter(notification => !notification.isRead).length;

  return (
    <div className="module4-app">
      <header className="dashboard-header module4-header">
        <div>
          <h1>Module 4 Operations Control</h1>
          <p>Audit trail, company administration, exports, and notifications.</p>
        </div>
        <div className="module4-user-actions">
          <div>
            <strong>{user?.firstName} {user?.lastName}</strong>
            <span>{user?.role || "User"}</span>
          </div>
          <button type="button" onClick={() => { logout(); navigate("/login"); }}>Log Out</button>
        </div>
      </header>

      {!online && <div className="module4-error">Module 4 API is offline or access is restricted.</div>}

      <nav className="module4-tabs">
        <button className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}>Audit</button>
        <button className={tab === "companies" ? "active" : ""} onClick={() => setTab("companies")}>Companies</button>
        <button className={tab === "export" ? "active" : ""} onClick={() => setTab("export")}>Export</button>
        <button className={tab === "notifications" ? "active" : ""} onClick={() => setTab("notifications")}>
          Notifications {unread > 0 && <span className="module4-badge">{unread}</span>}
        </button>
      </nav>

      {tab === "audit" && <AuditPage audit={audit} onSaved={loadAll} />}
      {tab === "companies" && <CompaniesPage companies={companies} onChanged={loadAll} />}
      {tab === "export" && <ExportPage />}
      {tab === "notifications" && (
        <NotificationsPage
          notifications={notifications}
          onRead={async id => {
            await markRead(id);
            await loadAll();
          }}
          onReadAll={async () => {
            await markAll();
            await loadAll();
          }}
        />
      )}
    </div>
  );
}

function SectionHead({ title, help, action }) {
  return (
    <div className="module4-section-head">
      <div>
        <h2>{title}</h2>
        {help && <p>{help}</p>}
      </div>
      {action}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="module4-field">
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}

function AuditPage({ audit, onSaved }) {
  const empty = {
    entity: "Inventory",
    action: "UPDATE",
    recordRef: "",
    reason: "",
    oldFields: [
      { key: "quantity", value: "148" },
      { key: "status", value: "Available" }
    ],
    newFields: [
      { key: "quantity", value: "132" },
      { key: "status", value: "Available" }
    ]
  };

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const parseValue = value => {
    const trimmed = String(value ?? "").trim();
    if (trimmed === "") return "";
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    if (trimmed.toLowerCase() === "true") return true;
    if (trimmed.toLowerCase() === "false") return false;
    if (trimmed.toLowerCase() === "null") return null;
    return trimmed;
  };

  const rowsToObject = rows => {
    const value = {};
    rows.forEach(row => {
      const key = row.key.trim();
      if (key) value[key] = parseValue(row.value);
    });
    return value;
  };

  const hasFields = rows => rows.some(row => row.key.trim());

  const submit = async event => {
    event.preventDefault();
    const nextErrors = {};
    const oldObj = rowsToObject(form.oldFields);
    const newObj = rowsToObject(form.newFields);
    const hasOld = hasFields(form.oldFields);
    const hasNew = hasFields(form.newFields);

    if (!form.recordRef.trim()) nextErrors.recordRef = "Required";
    if (form.reason.trim().length < 8) nextErrors.reason = "Use at least 8 characters";

    const duplicateKeys = rows => rows
      .map(row => row.key.trim())
      .filter(Boolean)
      .filter((key, index, all) => all.indexOf(key) !== index);

    if (duplicateKeys(form.oldFields).length) nextErrors.oldValue = "Field names must be unique";
    if (duplicateKeys(form.newFields).length) nextErrors.newValue = "Field names must be unique";

    if (form.action === "CREATE" && !hasNew) nextErrors.newValue = "CREATE requires a New Value";
    if (form.action === "DELETE" && !hasOld) nextErrors.oldValue = "DELETE requires an Old Value";
    if (["UPDATE", "ADJUSTMENT", "TRANSFER", "STATUS_CHANGE"].includes(form.action)) {
      if (!hasOld || !hasNew) {
        nextErrors.oldValue = nextErrors.oldValue || "Both states are required";
        nextErrors.newValue = nextErrors.newValue || "Both states are required";
      } else if (JSON.stringify(oldObj) === JSON.stringify(newObj)) {
        nextErrors.newValue = "Updated state must be different";
      }
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      await createAudit({
        entity: form.entity,
        action: form.action,
        recordRef: form.recordRef.trim(),
        reason: form.reason.trim(),
        oldValue: hasOld ? oldObj : null,
        newValue: hasNew ? newObj : null
      });
      setForm(empty);
      setErrors({});
      setMessage("Audit record saved successfully.");
      await onSaved();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save audit record.");
    }
  };

  return (
    <div className="module4-stack">
      <section className="module4-card">
        <SectionHead title="Audit Trail" help="Record validated operational changes with a clear before-and-after business state." />
        {message && <div className="module4-message">{message}</div>}
        <form className="module4-form" onSubmit={submit}>
          <div className="module4-two">
            <Field label="Entity" error={errors.entity}>
              <select value={form.entity} onChange={event => setForm({ ...form, entity: event.target.value })}>
                {ENTITIES.map(entity => <option key={entity}>{entity}</option>)}
              </select>
            </Field>
            <Field label="Action" error={errors.action}>
              <select value={form.action} onChange={event => setForm({ ...form, action: event.target.value })}>
                {ACTIONS.map(action => <option key={action}>{action}</option>)}
              </select>
            </Field>
          </div>
          <div className="module4-two">
            <Field label="Reference" error={errors.recordRef}>
              <input value={form.recordRef} onChange={event => setForm({ ...form, recordRef: event.target.value })} placeholder="SKU-COF-ARAB-1KG" />
            </Field>
            <Field label="Reason" error={errors.reason}>
              <input value={form.reason} onChange={event => setForm({ ...form, reason: event.target.value })} placeholder="Cycle count adjustment after damaged units were identified" />
            </Field>
          </div>

          <div className="module4-two module4-state-grid">
            <StateEditor
              title="Previous State"
              hint="Values before the change"
              rows={form.oldFields}
              onChange={rows => setForm({ ...form, oldFields: rows })}
              error={errors.oldValue}
              tone="before"
            />
            <StateEditor
              title="Updated State"
              hint="Values after the change"
              rows={form.newFields}
              onChange={rows => setForm({ ...form, newFields: rows })}
              error={errors.newValue}
              tone="after"
            />
          </div>

          <div className="module4-form-footer">
            <span>✓ Append-only audit record — saved changes cannot be edited from this module.</span>
            <button className="module4-primary">Save Audit Record</button>
          </div>
        </form>
      </section>

      <section className="module4-card">
        <SectionHead title="Audit History" help="Recent business changes recorded for the current tenant." />
        <div className="module4-list">
          {audit.length === 0 ? <div className="module4-empty">No audit records yet.</div> :
            audit.map(log => <AuditRow key={log._id} log={log} />)}
        </div>
      </section>
    </div>
  );
}

function StateEditor({ title, hint, rows, onChange, error, tone }) {
  const updateRow = (index, field, value) => {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  };

  const removeRow = index => {
    const next = rows.filter((_, rowIndex) => rowIndex !== index);
    onChange(next.length ? next : [{ key: "", value: "" }]);
  };

  return (
    <div className={`module4-state-editor ${tone}`}>
      <div className="module4-state-head">
        <div>
          <strong>{title}</strong>
          <span>{hint}</span>
        </div>
        <span className={`module4-state-badge ${tone}`}>{tone === "before" ? "BEFORE" : "AFTER"}</span>
      </div>
      <div className="module4-state-columns">
        <span>Field</span>
        <span>Value</span>
        <span />
      </div>
      <div className="module4-state-rows">
        {rows.map((row, index) => (
          <div className="module4-state-row" key={`${tone}-${index}`}>
            <input value={row.key} onChange={event => updateRow(index, "key", event.target.value)} placeholder={index === 0 ? "quantity" : "status"} />
            <input value={row.value} onChange={event => updateRow(index, "value", event.target.value)} placeholder={index === 0 ? "148" : "Available"} />
            <button type="button" className="module4-remove-field" onClick={() => removeRow(index)} aria-label="Remove field">×</button>
          </div>
        ))}
      </div>
      <button type="button" className="module4-add-field" onClick={() => onChange([...rows, { key: "", value: "" }])}>＋ Add field</button>
      {error && <div className="module4-state-error">{error}</div>}
    </div>
  );
}

function AuditRow({ log }) {
  return (
    <article className="module4-row-card">
      <div className="module4-row-top">
        <div>
          <strong>{log.entity}</strong>
          <span className="module4-pill">{log.action}</span>
        </div>
        <time>{new Date(log.createdAt).toLocaleString()}</time>
      </div>
      <div className="module4-meta">
        <span><b>Who:</b> {log.userName || log.userId || "System"}</span>
        <span><b>Reference:</b> {log.recordRef || "-"}</span>
        <span><b>Reason:</b> {log.reason || "-"}</span>
      </div>
    </article>
  );
}

function CompaniesPage({ companies, onChanged }) {
  const [form, setForm] = useState({ name: "", email: "", subscription: "Basic" });
  const [message, setMessage] = useState("");

  const submit = async event => {
    event.preventDefault();
    try {
      await addCompany(form);
      setForm({ name: "", email: "", subscription: "Basic" });
      setMessage("Company created.");
      await onChanged();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to create company.");
    }
  };

  return (
    <section className="module4-card">
      <SectionHead title="Company Administration" help="Create companies and manage Module 4 subscription labels." />
      {message && <div className="module4-message">{message}</div>}
      <form className="module4-company-form" onSubmit={submit}>
        <Field label="Company Name"><input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Email"><input value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></Field>
        <Field label="Plan">
          <select value={form.subscription} onChange={event => setForm({ ...form, subscription: event.target.value })}>
            {PLANS.map(plan => <option key={plan}>{plan}</option>)}
          </select>
        </Field>
        <button className="module4-primary">Create</button>
      </form>
      <div className="module4-list">
        {companies.length === 0 ? <div className="module4-empty">No companies yet.</div> :
          companies.map(company => (
            <article className="module4-company-row" key={company._id}>
              <div>
                <strong>{company.name}</strong>
                <span>{company.email}</span>
              </div>
              <select value={company.subscription || "Basic"} onChange={async event => {
                await changePlan(company._id, event.target.value);
                await onChanged();
              }}>
                {PLANS.map(plan => <option key={plan}>{plan}</option>)}
              </select>
            </article>
          ))}
      </div>
    </section>
  );
}

function ExportPage() {
  const download = async (getter, filename) => {
    const response = await getter();
    const url = URL.createObjectURL(new Blob([response.data]));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="module4-card module4-narrow">
      <SectionHead title="Exports" help="Download authenticated Module 4 operational data for the current tenant." />
      <div className="module4-export-buttons">
        <button className="module4-primary" onClick={() => download(exportExcel, "INTrack_Module4.csv")}>Download CSV</button>
        <button className="module4-secondary" onClick={() => download(exportPDF, "INTrack_Module4.pdf")}>Download PDF</button>
      </div>
    </section>
  );
}

function NotificationsPage({ notifications, onRead, onReadAll }) {
  return (
    <section className="module4-card">
      <SectionHead title="Notifications" help="Review audit and subscription activity." action={<button className="module4-secondary" onClick={onReadAll}>Mark All Read</button>} />
      <div className="module4-list">
        {notifications.length === 0 ? <div className="module4-empty">No notifications yet.</div> :
          notifications.map(notification => (
            <article className={`module4-notification ${notification.isRead ? "read" : ""}`} key={notification._id}>
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </div>
              {!notification.isRead && <button className="module4-secondary" onClick={() => onRead(notification._id)}>Mark Read</button>}
            </article>
          ))}
      </div>
    </section>
  );
}

export default Module4Page;
