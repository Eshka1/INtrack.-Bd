export default function NotificationCard({
    notification,
    onRead
}){

    return (

        <div className="module4-notification">

            <h3>
                {notification.title}
            </h3>

            <p>
                {notification.message}
            </p>


            {
                !notification.isRead &&

                <button
                onClick={()=>onRead(notification._id)}
                >
                    Mark Read
                </button>

            }

        </div>

    );

}