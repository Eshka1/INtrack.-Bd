export default function AuditTable({logs=[]}){

    return (
        <table className="module4-table">

            <thead>
                <tr>
                    <th>User</th>
                    <th>Entity</th>
                    <th>Action</th>
                    <th>Time</th>
                </tr>
            </thead>

            <tbody>

            {
                logs.length === 0 ?

                <tr>
                    <td colSpan="4">
                        No audit data
                    </td>
                </tr>

                :

                logs.map(log=>(

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
                            {
                            new Date(
                                log.createdAt
                            ).toLocaleString()
                            }
                        </td>

                    </tr>

                ))

            }

            </tbody>

        </table>
    );
}