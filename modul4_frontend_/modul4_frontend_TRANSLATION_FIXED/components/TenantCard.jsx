export default function TenantCard({tenant}){

    return (

        <div className="module4-card-small">

            <h3>
                {tenant.name}
            </h3>

            <p>
                Plan:
                {" "}
                {tenant.subscription || "Basic"}
            </p>

        </div>

    );

}