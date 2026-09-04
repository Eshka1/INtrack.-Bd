import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCompanies, getAnalytics, updateSubscription } from "../api/module4Api";

export default function SuperAdmin(){
  const { t } = useTranslation();
  const [companies,setCompanies]=useState([]); const [analytics,setAnalytics]=useState({}); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [updatingId,setUpdatingId]=useState(null);
  useEffect(()=>{ loadData(); },[]);
  const loadData=async()=>{ try{ setLoading(true); setError(""); const c=await getCompanies(); const a=await getAnalytics(); const cd=c?.data||c||[]; setCompanies(Array.isArray(cd)?cd:[]); setAnalytics(a?.data||a||{}); }catch(err){ console.error(err); setError(t("failedAdmin")); }finally{ setLoading(false); } };
  const changePlan=async(companyId,currentPlan)=>{ try{ setUpdatingId(companyId); const newPlan=currentPlan==="Premium"?"Basic":"Premium"; await updateSubscription(companyId,newPlan); await loadData(); }catch(err){ console.error(err); alert(err.response?.data?.message||t("subscriptionUpdateFailed")); }finally{ setUpdatingId(null); } };
  if(loading) return <div className="module4-card">{t("loadingAdmin")}</div>;
  if(error) return <div className="module4-error">{error}</div>;
  return <div className="module4-card">
    <h2>{t("saasSuperAdminPanel")}</h2><p className="module4-muted">{t("adminDescription")}</p>
    <div className="module4-stats">
      <div className="module4-stat-card"><h3>{t("totalCompanies")}</h3><p>{analytics.totalCompanies??0}</p></div>
      <div className="module4-stat-card"><h3>{t("activeUsers")}</h3><p>{analytics.activeUsers??0}</p></div>
      <div className="module4-stat-card"><h3>{t("premiumCompanies")}</h3><p>{analytics.premiumCompanies??0}</p></div>
    </div>
    <h3>{t("registeredCompanies")}</h3>
    <div className="module4-table-wrapper"><table className="module4-table"><thead><tr><th>{t("company")}</th><th>{t("subscription")}</th><th>{t("action")}</th></tr></thead><tbody>
      {companies.length===0?<tr><td colSpan="3">{t("noCompaniesFound")}</td></tr>:companies.map(company=>{
        const currentPlan=company.subscription||"Basic"; const isPremium=currentPlan==="Premium"; const isUpdating=updatingId===company._id; const planKey=`plan.${currentPlan.toLowerCase()}`;
        return <tr key={company._id}><td>{company.name||t("unnamedCompany")}</td><td>{t(planKey,{ defaultValue: currentPlan })}</td><td>
          <button disabled={isUpdating} onClick={()=>changePlan(company._id,currentPlan)}>{isUpdating?t("updating"):(isPremium?t("downgradeBasic"):t("upgradePremium"))}</button>
        </td></tr>;
      })}
    </tbody></table></div>
  </div>;
}
