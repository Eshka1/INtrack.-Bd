import { useEffect, useState } from "react";

import {
    getCompanies,
    getAnalytics,
    updateSubscription
} from "../api/module4Api";


export default function SuperAdmin(){

    const [companies, setCompanies] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);


    // ===============================
    // Load Super Admin Data
    // ===============================

    useEffect(() => {

        loadData();

    }, []);


    const loadData = async () => {

        try {

            setLoading(true);
            setError("");


            const companyResponse =
                await getCompanies();


            const analyticsResponse =
                await getAnalytics();


            const companyData =
                companyResponse?.data ||
                companyResponse ||
                [];


            const analyticsData =
                analyticsResponse?.data ||
                analyticsResponse ||
                {};


            setCompanies(
                Array.isArray(companyData)
                    ? companyData
                    : []
            );


            setAnalytics(
                analyticsData
            );

        }
        catch(err){

            console.error(
                "SUPER ADMIN LOAD ERROR:",
                err
            );


            setError(
                "Failed to load super admin data"
            );

        }
        finally{

            setLoading(false);

        }

    };


    // ===============================
    // Change Subscription Plan
    // Basic <-> Premium
    // ===============================

    const changePlan = async (
        companyId,
        currentPlan
    ) => {

        try {

            setUpdatingId(companyId);


            const newPlan =
                currentPlan === "Premium"
                    ? "Basic"
                    : "Premium";


            await updateSubscription(
                companyId,
                newPlan
            );


            // Reload companies + analytics
            // after successful update
            await loadData();

        }
        catch(err){

            console.error(
                "SUBSCRIPTION UPDATE ERROR:",
                err.response?.data || err
            );


            alert(
                err.response?.data?.message ||
                "Subscription update failed"
            );

        }
        finally{

            setUpdatingId(null);

        }

    };


    // ===============================
    // Loading State
    // ===============================

    if(loading){

        return (

            <div className="module4-card">

                Loading super admin panel...

            </div>

        );

    }


    // ===============================
    // Error State
    // ===============================

    if(error){

        return (

            <div className="module4-error">

                {error}

            </div>

        );

    }


    // ===============================
    // Main UI
    // ===============================

    return (

        <div className="module4-card">


            <h2>
                SaaS Super Admin Panel
            </h2>


            <p className="module4-muted">
                Monitor companies, subscription plans,
                and system usage.
            </p>


            {/* ===============================
                Analytics Cards
            =============================== */}

            <div className="module4-stats">


                <div className="module4-stat-card">

                    <h3>
                        Total Companies
                    </h3>

                    <p>
                        {
                            analytics.totalCompanies
                            ?? 0
                        }
                    </p>

                </div>


                <div className="module4-stat-card">

                    <h3>
                        Active Users
                    </h3>

                    <p>
                        {
                            analytics.activeUsers
                            ?? 0
                        }
                    </p>

                </div>


                <div className="module4-stat-card">

                    <h3>
                        Premium Companies
                    </h3>

                    <p>
                        {
                            analytics.premiumCompanies
                            ?? 0
                        }
                    </p>

                </div>


            </div>


            {/* ===============================
                Registered Companies
            =============================== */}

            <h3>
                Registered Companies
            </h3>


            <div className="module4-table-wrapper">


                <table className="module4-table">


                    <thead>

                        <tr>

                            <th>
                                Company
                            </th>

                            <th>
                                Subscription
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                    {
                        companies.length === 0
                        ?

                        <tr>

                            <td colSpan="3">

                                No companies found

                            </td>

                        </tr>

                        :

                        companies.map(
                            (company) => {

                                const currentPlan =
                                    company.subscription ||
                                    "Basic";


                                const isPremium =
                                    currentPlan ===
                                    "Premium";


                                const isUpdating =
                                    updatingId ===
                                    company._id;


                                return (

                                    <tr
                                        key={
                                            company._id
                                        }
                                    >


                                        <td>

                                            {
                                                company.name
                                                ||
                                                "Unnamed Company"
                                            }

                                        </td>


                                        <td>

                                            {
                                                currentPlan
                                            }

                                        </td>


                                        <td>


                                            <button

                                                disabled={
                                                    isUpdating
                                                }

                                                onClick={
                                                    () =>
                                                        changePlan(
                                                            company._id,
                                                            currentPlan
                                                        )
                                                }

                                            >


                                                {
                                                    isUpdating

                                                    ?

                                                    "Updating..."

                                                    :

                                                    isPremium

                                                    ?

                                                    "Downgrade Basic"

                                                    :

                                                    "Upgrade Premium"
                                                }


                                            </button>


                                        </td>


                                    </tr>

                                );

                            }
                        )
                    }


                    </tbody>


                </table>


            </div>


        </div>

    );

}
