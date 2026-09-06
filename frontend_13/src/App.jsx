import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  health, getAudit, createAudit,
  getCompanies, addCompany, changePlan,
  getNotifications, markRead, markAll,
  exportExcel, exportPDF
} from "./api";

const ENTITIES = ["Inventory", "PurchaseOrder", "Recipe", "Supplier", "Warehouse", "Subscription", "User", "Expense"];
const ACTIONS = ["CREATE", "UPDATE", "ADJUSTMENT", "TRANSFER", "STATUS_CHANGE", "DELETE"];
const PLANS = ["Basic", "Premium", "Enterprise"];

function App() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("audit");
  const [online, setOnline] = useState(true);
  const [audit, setAudit] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const loadAll = async () => {
    try {
      await health();
      setOnline(true);
      const [a, c, n] = await Promise.all([getAudit(), getCompanies(), getNotifications()]);
      setAudit(a.data || []);
      setCompanies(c.data || []);
      setNotifications(n.data || []);
    } catch (e) {
      console.error(e);
      setOnline(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const changeLanguage = async e => {
    const lang = e.target.value;
    await i18n.changeLanguage(lang);
    localStorage.setItem("intrack_language", lang);
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{t("appTitle")}</h1>
          <p>{t("appSub")}</p>
        </div>

        <label className="language">
          <span>{t("language")}</span>
          <select value={i18n.language?.startsWith("bn") ? "bn" : "en"} onChange={changeLanguage}>
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
          </select>
        </label>
      </header>

      {!online && <div className="error-banner">{t("backendOffline")}</div>}

      <nav className="tabs">
        <button className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}>{t("audit")}</button>
        <button className={tab === "companies" ? "active" : ""} onClick={() => setTab("companies")}>{t("companies")}</button>
        <button className={tab === "export" ? "active" : ""} onClick={() => setTab("export")}>{t("export")}</button>
        <button className={tab === "notifications" ? "active" : ""} onClick={() => setTab("notifications")}>
          {t("notifications")}
          {unread > 0 && <span className="badge">{unread}</span>}
        </button>
      </nav>

      <main>
        {tab === "audit" && <AuditPage t={t} audit={audit} onSaved={loadAll} />}
        {tab === "companies" && <CompaniesPage t={t} companies={companies} onChanged={loadAll} />}
        {tab === "export" && <ExportPage t={t} />}
        {tab === "notifications" && (
          <NotificationsPage
            t={t}
            notifications={notifications}
            onRead={async id => { await markRead(id); await loadAll(); }}
            onReadAll={async () => { await markAll(); await loadAll(); }}
          />
        )}
      </main>
    </div>
  );
}

function SectionHead({ title, help, action }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        <p>{help}</p>
      </div>
      {action}
    </div>
  );
}

function AuditPage({ t, audit, onSaved }) {
  const empty = {
    entity: "Inventory",
    action: "UPDATE",
    recordRef: "",
    reason: "",
    oldValue: '{\n  "quantity": 10\n}',
    newValue: '{\n  "quantity": 25\n}'
  };

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validate = () => {
    const e = {};
    let oldObj = null;
    let newObj = null;

    if (!form.recordRef.trim()) e.recordRef = t("required");
    if (form.reason.trim().length < 8) e.reason = t("reasonLength");

    try { if (form.oldValue.trim()) oldObj = JSON.parse(form.oldValue); }
    catch { e.oldValue = t("invalidJson"); }

    try { if (form.newValue.trim()) newObj = JSON.parse(form.newValue); }
    catch { e.newValue = t("invalidJson"); }

    if (form.action === "CREATE" && !form.newValue.trim()) e.newValue = t("createNeedsNew");
    if (form.action === "DELETE" && !form.oldValue.trim()) e.oldValue = t("deleteNeedsOld");

    if (["UPDATE", "ADJUSTMENT", "TRANSFER", "STATUS_CHANGE"].includes(form.action)) {
      if (!form.oldValue.trim() || !form.newValue.trim()) {
        e.oldValue = e.oldValue || t("changeNeedsBoth");
        e.newValue = e.newValue || t("changeNeedsBoth");
      } else if (!e.oldValue && !e.newValue && JSON.stringify(oldObj) === JSON.stringify(newObj)) {
        e.newValue = t("valuesDifferent");
      }
    }

    return { e, oldObj, newObj };
  };

  const submit = async event => {
    event.preventDefault();
    setMessage("");
    const { e, oldObj, newObj } = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      await createAudit({
        entity: form.entity,
        action: form.action,
        recordRef: form.recordRef.trim(),
        reason: form.reason.trim(),
        oldValue: oldObj,
        newValue: newObj
      });
      setForm(empty);
      setErrors({});
      setMessage(t("successAudit"));
      await onSaved();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to save audit record.");
    }
  };

  return (
    <div className="stack">
      <section className="card">
        <SectionHead title={t("auditTitle")} help={t("auditHelp")} />

        {message && <div className="message">{message}</div>}

        <form className="form" onSubmit={submit}>
          <div className="two">
            <Field label={t("entity")} error={errors.entity}>
              <select value={form.entity} onChange={e => setForm({ ...form, entity: e.target.value })}>
                {ENTITIES.map(x => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label={t("action")} error={errors.action}>
              <select value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}>
                {ACTIONS.map(x => <option key={x}>{x}</option>)}
              </select>
            </Field>
          </div>

          <div className="two">
            <Field label={t("reference")} error={errors.recordRef}>
              <input value={form.recordRef} onChange={e => setForm({ ...form, recordRef: e.target.value })} placeholder="SKU-1001" />
            </Field>
            <Field label={t("reason")} error={errors.reason}>
              <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Physical stock count correction" />
            </Field>
          </div>

          <div className="two">
            <Field label={t("oldValue")} error={errors.oldValue}>
              <textarea rows="6" value={form.oldValue} onChange={e => setForm({ ...form, oldValue: e.target.value })} />
            </Field>
            <Field label={t("newValue")} error={errors.newValue}>
              <textarea rows="6" value={form.newValue} onChange={e => setForm({ ...form, newValue: e.target.value })} />
            </Field>
          </div>

          <button className="primary">{t("saveAudit")}</button>
        </form>
      </section>

      <section className="card">
        <SectionHead title={t("auditHistory")} />
        <div className="list">
          {audit.length === 0 ? <div className="empty">{t("noAudit")}</div> :
            audit.map(log => <AuditRow key={log._id} log={log} />)}
        </div>
      </section>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}

function AuditRow({ log }) {
  return (
    <article className="row-card">
      <div className="row-top">
        <div>
          <strong>{log.entity}</strong>
          <span className="pill">{log.action}</span>
        </div>
        <time>{new Date(log.createdAt).toLocaleString()}</time>
      </div>
      <div className="meta">
        <span><b>Who:</b> {log.userName || log.userId || "System"}</span>
        <span><b>Reference:</b> {log.recordRef || "—"}</span>
        <span><b>Reason:</b> {log.reason || "—"}</span>
      </div>
      <div className="before-after">
        <pre>{JSON.stringify(log.oldValue, null, 2)}</pre>
        <span>→</span>
        <pre>{JSON.stringify(log.newValue, null, 2)}</pre>
      </div>
    </article>
  );
}

function CompaniesPage({ t, companies, onChanged }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subscription: "Basic" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const submit = async e => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = t("required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = t("invalidEmail");
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      await addCompany({
        name: form.name.trim(),
        email: form.email.trim(),
        subscription: form.subscription
      });
      setForm({ name: "", email: "", subscription: "Basic" });
      setErrors({});
      setMessage(t("successCompany"));
      setShowForm(false);
      await onChanged();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to create company.");
    }
  };

  return (
    <section className="card">
      <SectionHead
        title={t("companyTitle")}
        help={t("companyHelp")}
        action={<button className="primary small" onClick={() => setShowForm(v => !v)}>{t("addCompany")}</button>}
      />

      {message && <div className="message">{message}</div>}

      {showForm && (
        <form className="company-form" onSubmit={submit}>
          <Field label={t("companyName")} error={errors.name}>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Example Trading Ltd" />
          </Field>
          <Field label={t("email")} error={errors.email}>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" />
          </Field>
          <Field label={t("plan")}>
            <select value={form.subscription} onChange={e => setForm({ ...form, subscription: e.target.value })}>
              {PLANS.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <button className="primary">{t("createCompany")}</button>
        </form>
      )}

      <div className="company-list">
        {companies.length === 0 ? <div className="empty">{t("noCompanies")}</div> :
          companies.map(company => (
            <article className="company-row" key={company._id}>
              <div>
                <strong>{company.name}</strong>
                <span>{company.email}</span>
              </div>
              <select
                value={company.subscription || "Basic"}
                onChange={async e => {
                  await changePlan(company._id, e.target.value);
                  await onChanged();
                }}
              >
                {PLANS.map(p => <option key={p}>{p}</option>)}
              </select>
            </article>
          ))}
      </div>
    </section>
  );
}

function ExportPage({ t }) {
  const download = async (getter, name) => {
    const r = await getter();
    const url = URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card narrow">
      <SectionHead title={t("exportTitle")} help={t("exportHelp")} />
      <div className="export-buttons">
        <button className="primary" onClick={() => download(exportExcel, "INTrack_Module4.xlsx")}>{t("excel")}</button>
        <button className="secondary" onClick={() => download(exportPDF, "INTrack_Module4.pdf")}>{t("pdf")}</button>
      </div>
    </section>
  );
}

function NotificationsPage({ t, notifications, onRead, onReadAll }) {
  return (
    <section className="card">
      <SectionHead
        title={t("notificationTitle")}
        help={t("notificationHelp")}
        action={<button className="secondary small" onClick={onReadAll}>{t("markAll")}</button>}
      />

      <div className="list">
        {notifications.length === 0 ? <div className="empty">{t("noNotifications")}</div> :
          notifications.map(n => (
            <article className={`notification ${n.isRead ? "read" : ""}`} key={n._id}>
              <div className="notification-main">
                <div className="row-top">
                  <strong>{n.title}</strong>
                  <time>{new Date(n.createdAt).toLocaleString()}</time>
                </div>
                <p>{n.message}</p>
                <div className="meta">
                  <span><b>Who:</b> {n.actorName || n.actorId || "System"}</span>
                  <span><b>Entity:</b> {n.entity || "—"}</span>
                  <span><b>Action:</b> {n.action || n.type || "—"}</span>
                  <span><b>Reference:</b> {n.recordRef || "—"}</span>
                </div>
                {Array.isArray(n.changes) && n.changes.length > 0 && (
                  <div className="changes">
                    {n.changes.map((c, i) => (
                      <span key={`${c.key}-${i}`}>
                        <b>{c.key}</b>: {JSON.stringify(c.before)} → {JSON.stringify(c.after)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {!n.isRead && <button className="secondary small" onClick={() => onRead(n._id)}>{t("markRead")}</button>}
            </article>
          ))}
      </div>
    </section>
  );
}

export default App;
