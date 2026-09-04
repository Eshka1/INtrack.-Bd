import { useState } from "react";
import { useTranslation } from "react-i18next";
import { exportExcel, exportPDF } from "../api/module4Api";

export default function Export(){
  const { t }=useTranslation(); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const downloadFile=async(type)=>{ try{ setLoading(true); setError(""); const response=type==="excel"?await exportExcel():await exportPDF(); const blob=new Blob([response],{type:type==="excel"?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"application/pdf"}); const url=window.URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download=type==="excel"?"INTrack_export.xlsx":"INTrack_export.pdf"; document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url); }catch(err){ console.error(err); setError(t("exportFailed")); }finally{ setLoading(false); } };
  return <div className="module4-card"><h2>{t("dataExportInfrastructure")}</h2><p className="module4-muted">{t("exportDescription")}</p>{error&&<div className="module4-error">{error}</div>}<div className="module4-export-actions"><button disabled={loading} onClick={()=>downloadFile("excel")}>{t("exportExcel")}</button><button disabled={loading} onClick={()=>downloadFile("pdf")}>{t("exportPDF")}</button></div>{loading&&<p>{t("generatingFile")}</p>}</div>;
}
