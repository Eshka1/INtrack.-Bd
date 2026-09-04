import { useState } from "react";

import AuditTrail from "./pages/AuditTrail";
import SuperAdmin from "./pages/SuperAdmin";
import Export from "./pages/Export";
import Notifications from "./pages/Notifications";

import "./styles/module4.css";


export default function Module4Dashboard() {

    const [activePage, setActivePage] = useState("audit");


    const renderPage = () => {

        switch(activePage) {

            case "audit":
                return <AuditTrail />;

            case "admin":
                return <SuperAdmin />;

            case "export":
                return <Export />;

            case "notifications":
                return <Notifications />;

            default:
                return <AuditTrail />;

        }

    };


    return (

        <div className="module4-shell">


            <div className="module4-header">

                <div>

                    <h1>
                        IN-Track Module 4
                    </h1>

                    <p>
                        Audit, Export, Notification and Super Admin Management
                    </p>

                </div>


            </div>



            <div className="module4-navigation">

                <button
                    className={activePage==="audit" ? "active":""}
                    onClick={()=>setActivePage("audit")}
                >
                    Audit Trail
                </button>


                <button
                    className={activePage==="admin" ? "active":""}
                    onClick={()=>setActivePage("admin")}
                >
                    Super Admin
                </button>


                <button
                    className={activePage==="export" ? "active":""}
                    onClick={()=>setActivePage("export")}
                >
                    Export
                </button>


                <button
                    className={activePage==="notifications" ? "active":""}
                    onClick={()=>setActivePage("notifications")}
                >
                    Notifications
                </button>


            </div>



            <div className="module4-content">

                {renderPage()}

            </div>


        </div>

    );

}