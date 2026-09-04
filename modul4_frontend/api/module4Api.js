import axios from "axios";


const API = axios.create({

    baseURL: "http://localhost:5000/api/module4",

    headers:{
        "Content-Type":"application/json"
    }

});


// ===========================
// Audit Trail APIs
// ===========================

export const getAuditLogs = async()=>{

    const response =
        await API.get("/audit");

    return response.data;

};



export const createAuditLog = async(data)=>{

    const response =
        await API.post(
            "/audit",
            data
        );

    return response.data;

};




// ===========================
// Super Admin APIs
// ===========================

export const getCompanies = async()=>{

    const response =
        await API.get(
            "/admin/companies"
        );

    return response.data;

};



export const getAnalytics = async()=>{

    const response =
        await API.get(
            "/admin/analytics"
        );

    return response.data;

};



export const updateSubscription = async(
    id,
    plan
)=>{

    const response =
        await API.patch(
            `/admin/subscription/${id}`,
            {
                plan
            }
        );


    return response.data;

};




// ===========================
// Export APIs
// ===========================

export const exportExcel = async()=>{

    const response =
        await API.get(
            "/export/excel",
            {
                responseType:"blob"
            }
        );


    return response.data;

};



export const exportPDF = async()=>{

    const response =
        await API.get(
            "/export/pdf",
            {
                responseType:"blob"
            }
        );


    return response.data;

};




// ===========================
// Notification APIs
// ===========================

export const getNotifications = async()=>{

    const response =
        await API.get(
            "/notifications"
        );


    return response.data;

};



export const markNotificationRead = async(id)=>{

    const response =
        await API.patch(
            `/notifications/${id}/read`
        );


    return response.data;

};



export default API;