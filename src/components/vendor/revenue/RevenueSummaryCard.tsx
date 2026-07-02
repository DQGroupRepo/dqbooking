import "./RevenueSummaryCard.css";

interface Props {

    title: string;

    value: string;

}

export default function RevenueSummaryCard({

    title,

    value

}: Props) {

    return (

        <div className="revenue-summary-card">

            <p>{title}</p>

            <h2>{value}</h2>

        </div>

    );

}