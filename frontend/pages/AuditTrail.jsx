import { useEffect, useState } from "react";
import { getAuditLogs } from "../api/module4Api";


export default function AuditTrail(){

    const [logs,setLogs] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");


    useEffect(()=>{

        loadAuditLogs();

    },[]);



    const loadAuditLogs = async()=>{

        try{

            setLoading(true);

            const data = await getAuditLogs();

            setLogs(data.data || data || []);

        }
        catch(err){

            setError(
                "Failed to load audit records"
            );

        }
        finally{

            setLoading(false);

        }

    };



    if(loading){

        return (
            <div className="module4-card">
                Loading audit records...
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
                Historical Batch Audit Trail
            </h2>


            <p className="module4-muted">
                Track who changed what, when, and previous values.
            </p>



            <div className="module4-table-wrapper">

                <table className="module4-table">

                    <thead>

                        <tr>

                            <th>User</th>
                            <th>Entity</th>
                            <th>Action</th>
                            <th>Old Value</th>
                            <th>New Value</th>
                            <th>Date</th>

                        </tr>

                    </thead>


                    <tbody>


                    {logs.length === 0 ? (

                        <tr>
                            <td colSpan="6">
                                No audit records found
                            </td>
                        </tr>

                    ) : (

                        logs.map((log)=>(

                            <tr key={log._id}>

                                <td>
                                    {log.userId || "System"}
                                </td>

                                <td>
                                    {log.entity}
                                </td>

                                <td>
                                    {log.action}
                                </td>

                                <td>
                                    <pre>
                                    {JSON.stringify(
                                        log.oldValue,
                                        null,
                                        2
                                    )}
                                    </pre>
                                </td>

                                <td>
                                    <pre>
                                    {JSON.stringify(
                                        log.newValue,
                                        null,
                                        2
                                    )}
                                    </pre>
                                </td>

                                <td>
                                    {
                                    new Date(
                                        log.createdAt
                                    ).toLocaleString()
                                    }
                                </td>


                            </tr>

                        ))

                    )}


                    </tbody>

                </table>

            </div>


        </div>

    );

}