export default function AnalyticsCard({title,value}){

    return (

        <div className="module4-stat-card">

            <h3>
                {title}
            </h3>

            <p>
                {value}
            </p>

        </div>

    );

}