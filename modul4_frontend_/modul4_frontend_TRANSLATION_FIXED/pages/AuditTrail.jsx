import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAuditLogs } from "../api/module4Api";

export default function AuditTrail(){
  const { t } = useTranslation();
  const [logs,setLogs]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  useEffect(()=>{ loadAuditLogs(); },[]);
  const loadAuditLogs=async()=>{
    try{ setLoading(true); setError(""); const response=await getAuditLogs();
      if(response && Array.isArray(response.data)) setLogs(response.data); else if(Array.isArray(response)) setLogs(response); else setLogs([]);
    }catch(err){ console.error(err); setError(t("failedAudit")); }finally{ setLoading(false); }
  };
  if(loading) return <div className="module4-card">{t("loadingAudit")}</div>;
  if(error) return <div className="module4-error">{error}</div>;
  return <div className="module4-card">
    <h2>{t("historicalAuditTrail")}</h2><p className="module4-muted">{t("auditDescription")}</p>
    <div className="module4-table-wrapper"><table className="module4-table"><thead><tr>
      <th>{t("user")}</th><th>{t("entity")}</th><th>{t("action")}</th><th>{t("oldValue")}</th><th>{t("newValue")}</th><th>{t("date")}</th>
    </tr></thead><tbody>
      {logs.length===0?<tr><td colSpan="6">{t("noAuditRecords")}</td></tr>:logs.map(log=><tr key={log._id}>
        <td>{log.userId||t("system")}</td><td>{log.entity}</td><td>{log.action}</td>
        <td><pre>{JSON.stringify(log.oldValue,null,2)}</pre></td><td><pre>{JSON.stringify(log.newValue,null,2)}</pre></td>
        <td>{new Date(log.createdAt).toLocaleString()}</td>
      </tr>)}
    </tbody></table></div>
  </div>;
}
