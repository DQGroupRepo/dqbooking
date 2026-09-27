import {

    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip

} from "recharts";

import type {

    MonthlyRevenue

} from "../../../types/Revenue";

import "./RevenueChart.css";

interface Props{

    data:MonthlyRevenue[];

}

export default function RevenueChart({

    data

}:Props){

    return(

        <div className="revenue-chart-card">

            <h2>

                Monthly Revenue

            </h2>

            <ResponsiveContainer

                width="100%"

                height={320}

            >

                <LineChart

                    data={data}

                >

                    <CartesianGrid

                        strokeDasharray="3 3"

                    />

                    <XAxis

                        dataKey="month"

                    />

                    <YAxis/>

                    <Tooltip/>

                    <Line

                        type="monotone"

                        dataKey="revenue"

                        stroke="#D9974D"

                        strokeWidth={3}

                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );

}
