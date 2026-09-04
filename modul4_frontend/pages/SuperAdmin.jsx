import { useEffect, useState } from "react";
import {
    getCompanies,
    getAnalytics,
    updateSubscription
} from "../api/module4Api";


export default function SuperAdmin(){

    const [companies,setCompanies] = useState([]);
    const [analytics,setAnalytics] = useState({});
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");



    useEffect(()=>{

        loadData();

    },[]);



    const loadData = async()=>{

        try{

            setLoading(true);


            const companyResponse =
                await getCompanies();


            const analyticsResponse =
                await getAnalytics();


            setCompanies(
                companyResponse.data ||
                companyResponse ||
                []
            );


            setAnalytics(
                analyticsResponse.data ||
                analyticsResponse ||
                {}
            );


        }
        catch(err){

            setError(
                "Failed to load super admin data"
            );

        }
        finally{

            setLoading(false);

        }

    };




    const changePlan = async(id,plan)=>{

        try{

            await updateSubscription(
                id,
                plan
            );


            loadData();


        }
        catch(err){

            alert(
                "Subscription update failed"
            );

        }

    };




    if(loading){

        return (
            <div className="module4-card">
                Loading super admin panel...
            </div>
        );

    }



    if(error){

        return (
            <div className="module4-error">
                {error}
            </div>
        );

    }



    return (

        <div className="module4-card">


            <h2>
                SaaS Super Admin Panel
            </h2>


            <div className="module4-stats">


                <div className="module4-stat-card">

                    <h3>
                        Total Companies
                    </h3>

                    <p>
                        {analytics.totalCompanies || 0}
                    </p>

                </div>



                <div className="module4-stat-card">

                    <h3>
                        Usage
                    </h3>

                    <p>
                        {analytics.activeUsers || 0}
                    </p>

                </div>


            </div>



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
                                Override
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                    {
                        companies.length === 0 ?

                        <tr>
                            <td colSpan="3">
                                No companies found
                            </td>
                        </tr>

                        :

                        companies.map(company=>(

                            <tr key={company._id}>

                                <td>
                                    {company.name}
                                </td>


                                <td>
                                    {
                                    company.subscription ||
                                    "Basic"
                                    }
                                </td>


                                <td>

                                    <button
                                    onClick={()=>
                                        changePlan(
                                            company._id,
                                            "Premium"
                                        )
                                    }
                                    >
                                        Upgrade Premium
                                    </button>

                                </td>


                            </tr>

                        ))
                    }


                    </tbody>


                </table>

            </div>


        </div>

    );

}