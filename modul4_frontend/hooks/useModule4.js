import { useState, useEffect } from "react";

import {
    getAuditLogs,
    getNotifications,
    getCompanies,
    getAnalytics
} from "../api/module4Api";


export default function useModule4(){

    const [auditLogs,setAuditLogs] = useState([]);
    const [notifications,setNotifications] = useState([]);
    const [companies,setCompanies] = useState([]);
    const [analytics,setAnalytics] = useState({});

    const [loading,setLoading] = useState(false);
    const [error,setError] = useState("");



    const loadAuditLogs = async()=>{

        try{

            setLoading(true);

            const data = await getAuditLogs();

            setAuditLogs(
                data.data || data
            );

        }
        catch(error){

            setError(
                "Unable to load audit logs"
            );

        }
        finally{

            setLoading(false);

        }

    };




    const loadNotifications = async()=>{

        try{

            const data =
                await getNotifications();

            setNotifications(
                data.data || data
            );

        }
        catch(error){

            setError(
                "Unable to load notifications"
            );

        }

    };




    const loadSuperAdminData = async()=>{

        try{

            const companyData =
                await getCompanies();

            const analyticsData =
                await getAnalytics();


            setCompanies(
                companyData.data || companyData
            );


            setAnalytics(
                analyticsData.data || analyticsData
            );

        }
        catch(error){

            setError(
                "Unable to load admin data"
            );

        }

    };




    useEffect(()=>{

        loadAuditLogs();
        loadNotifications();

    },[]);



    return {

        auditLogs,
        notifications,
        companies,
        analytics,

        loading,
        error,

        loadAuditLogs,
        loadNotifications,
        loadSuperAdminData

    };

}