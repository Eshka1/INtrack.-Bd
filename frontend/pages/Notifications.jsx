import { useEffect, useState } from "react";
import {
    getNotifications,
    markNotificationRead
} from "../api/module4Api";


export default function Notifications(){

    const [notifications,setNotifications] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");



    useEffect(()=>{

        loadNotifications();

    },[]);



    const loadNotifications = async()=>{

        try{

            setLoading(true);

            const response =
                await getNotifications();

            setNotifications(
                response.data ||
                response ||
                []
            );

        }
        catch(err){

            setError(
                "Failed to load notifications"
            );

        }
        finally{

            setLoading(false);

        }

    };



    const handleRead = async(id)=>{

        try{

            await markNotificationRead(id);

            loadNotifications();

        }
        catch(err){

            alert(
                "Unable to update notification"
            );

        }

    };



    if(loading){

        return (

            <div className="module4-card">
                Loading notifications...
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
                Zero Activity Notifications
            </h2>


            <p className="module4-muted">
                Monitor tenant activities and system alerts.
            </p>



            <div className="module4-notification-list">


            {
                notifications.length === 0 ?

                <div className="module4-empty">

                    No notifications available

                </div>

                :

                notifications.map(notification=>(

                    <div
                    key={notification._id}
                    className={
                        notification.isRead
                        ? "module4-notification read"
                        : "module4-notification"
                    }
                    >


                        <div>

                            <h3>
                                {notification.title}
                            </h3>


                            <p>
                                {notification.message}
                            </p>


                            <small>

                            {
                                new Date(
                                    notification.createdAt
                                ).toLocaleString()
                            }

                            </small>

                        </div>



                        {
                            !notification.isRead &&

                            <button
                            onClick={()=>
                                handleRead(
                                    notification._id
                                )
                            }
                            >

                                Mark Read

                            </button>

                        }


                    </div>

                ))

            }


            </div>


        </div>

    );

}