import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./i18n";
import AuditTrail from "./pages/AuditTrail";
import SuperAdmin from "./pages/SuperAdmin";
import Export from "./pages/Export";
import Notifications from "./pages/Notifications";
import LanguageSwitcher from "./components/LanguageSwitcher";
import "./styles/module4.css";

export default function Module4Dashboard() {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState("audit");
  const renderPage = () => {
    switch(activePage){
      case "admin": return <SuperAdmin />;
      case "export": return <Export />;
      case "notifications": return <Notifications />;
      default: return <AuditTrail />;
    }
  };
  return (
    <div className="module4-shell">
      <div className="module4-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"20px",flexWrap:"wrap"}}>
        <div>
          <h1>{t("appTitle")}</h1>
          <p>{t("appSubtitle")}</p>
        </div>
        <LanguageSwitcher />
      </div>
      <div className="module4-navigation">
        <button className={activePage==="audit"?"active":""} onClick={()=>setActivePage("audit")}>{t("auditTrail")}</button>
        <button className={activePage==="admin"?"active":""} onClick={()=>setActivePage("admin")}>{t("superAdmin")}</button>
        <button className={activePage==="export"?"active":""} onClick={()=>setActivePage("export")}>{t("export")}</button>
        <button className={activePage==="notifications"?"active":""} onClick={()=>setActivePage("notifications")}>{t("notifications")}</button>
      </div>
      <div className="module4-content">{renderPage()}</div>
    </div>
  );
}
