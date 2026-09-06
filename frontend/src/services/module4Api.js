import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: `${API_BASE_URL}/module4`,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("intrack_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAudit = () => api.get("/audit").then(response => response.data);
export const createAudit = payload => api.post("/audit", payload).then(response => response.data);
export const getCompanies = () => api.get("/admin/companies").then(response => response.data);
export const addCompany = payload => api.post("/admin/companies", payload).then(response => response.data);
export const changePlan = (id, plan) => api.patch(`/admin/subscription/${id}`, { plan }).then(response => response.data);
export const getNotifications = () => api.get("/notifications").then(response => response.data);
export const markRead = id => api.patch(`/notifications/${id}/read`).then(response => response.data);
export const markAll = () => api.patch("/notifications/read-all").then(response => response.data);
export const exportExcel = () => api.get("/export/excel", { responseType: "blob" });
export const exportPDF = () => api.get("/export/pdf", { responseType: "blob" });

export default api;
