import { useState } from "react";
import { useTranslation } from "react-i18next";
import AuditTrailPage from "./AuditTrailPage";
import SuperAdminPanel from "./SuperAdminPanel";
import NotificationsPage from "./NotificationsPage";
import ExportButtons from "../components/ExportButtons";
import LanguageSwitcher from "../components/LanguageSwitcher";
import "../module4-neomorphism.css";

export default function Module4Dashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("audit");

  const tabs = [
    { id: "audit", label: t("auditTrail"), icon: "◫" },
    { id: "admin", label: t("superAdmin"), icon: "◇" },
    { id: "export", label: t("export"), icon: "⇩" },
    { id: "notifications", label: t("notifications"), icon: "●" }
  ];

  return (
    <main className="intrack-module4-shell">
      <div className="intrack-container">
        <header className="intrack-topbar">
          <div className="intrack-brand">
            <div className="intrack-logo">IN</div>
            <div>
              <h1 className="intrack-title">IN-Track Control Center</h1>
              <div className="intrack-subtitle">
                {t("module4")} · Audit, admin, export & system activity
              </div>
            </div>
          </div>

          <LanguageSwitcher />
        </header>

        <nav className="intrack-nav" aria-label="Module 4 navigation">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`intrack-tab ${tab === item.id ? "is-active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              <span aria-hidden="true" style={{ marginRight: 8 }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <section className="intrack-panel">
          {tab === "audit" && <AuditTrailPage />}
          {tab === "admin" && <SuperAdminPanel />}
          {tab === "export" && (
            <section>
              <h2 className="intrack-section-title">{t("export")}</h2>
              <div className="intrack-export-hero">
                <div className="intrack-export-copy">
                  <h3>Tenant Data, Ready to Share</h3>
                  <p>
                    Generate an Excel workbook or a compact PDF summary from
                    the authenticated tenant's inventory and financial records.
                  </p>
                </div>
                <div className="intrack-export-action">
                  <ExportButtons />
                </div>
              </div>
            </section>
          )}
          {tab === "notifications" && <NotificationsPage />}
        </section>
      </div>
    </main>
  );
}
