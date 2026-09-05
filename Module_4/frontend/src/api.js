import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/module4",
  headers: { "Content-Type": "application/json" }
});

export const health = () => axios.get("http://localhost:5000/api/health");

export const getAudit = () => api.get("/audit").then(r => r.data);
export const createAudit = payload => api.post("/audit", payload).then(r => r.data);

export const getCompanies = () => api.get("/admin/companies").then(r => r.data);
export const addCompany = payload => api.post("/admin/companies", payload).then(r => r.data);
export const changePlan = (id, plan) =>
  api.patch(`/admin/subscription/${id}`, { plan }).then(r => r.data);

export const getNotifications = () => api.get("/notifications").then(r => r.data);
export const markRead = id => api.patch(`/notifications/${id}/read`).then(r => r.data);
export const markAll = () => api.patch("/notifications/read-all").then(r => r.data);

export const exportExcel = () => api.get("/export/excel", { responseType: "blob" });
export const exportPDF = () => api.get("/export/pdf", { responseType: "blob" });

export default api;
