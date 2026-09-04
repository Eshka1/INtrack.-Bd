import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getNotifications, markNotificationRead } from "../api/module4Api";

export default function Notifications(){
  const { t }=useTranslation(); const [notifications,setNotifications]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  useEffect(()=>{ loadNotifications(); },[]);
  const loadNotifications=async()=>{ try{ setLoading(true); setError(""); const response=await getNotifications(); const data=response?.data||response||[]; setNotifications(Array.isArray(data)?data:[]); }catch(err){ console.error(err); setError(t("failedNotifications")); }finally{ setLoading(false); } };
  const handleRead=async(id)=>{ try{ await markNotificationRead(id); await loadNotifications(); }catch(err){ console.error(err); alert(t("unableUpdateNotification")); } };
  if(loading) return <div className="module4-card">{t("loadingNotifications")}</div>;
  if(error) return <div className="module4-error">{error}</div>;
  return <div className="module4-card"><h2>{t("zeroActivityNotifications")}</h2><p className="module4-muted">{t("notificationDescription")}</p><div className="module4-notification-list">
    {notifications.length===0?<div className="module4-empty">{t("noNotifications")}</div>:notifications.map(n=><div key={n._id} className={n.isRead?"module4-notification read":"module4-notification"}><div><h3>{n.title}</h3><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString()}</small></div>{!n.isRead&&<button onClick={()=>handleRead(n._id)}>{t("markRead")}</button>}</div>)}
  </div></div>;
}
