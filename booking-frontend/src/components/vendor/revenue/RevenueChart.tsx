import type {

    MonthlyRevenue

} from "../../../types/Revenue";

import "./RevenueChart.css";

interface Props {

    data: MonthlyRevenue[];

}

export default function RevenueChart({

    data

}: Props) {

    const width = 640;
    const height = 320;
    const padding = 28;

    const values = data.map((item) => Number(item.revenue ?? 0));
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    const points = data.map((item, index) => {

        const value = Number(item.revenue ?? 0);
        const x =
            padding +
            (index * (width - padding * 2)) /
            Math.max(data.length - 1, 1);
        const y =
            height -
            padding -
            ((value - minValue) / range) * (height - padding * 2);

        return { x, y, label: item.month, value };

    });

    const linePath = points
        .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
        .join(" ");

    const areaPath = points.length
        ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
        : "";

    return (

        <div className="revenue-chart-card">

            <h2>

                Monthly Revenue

            </h2>

            <svg

                viewBox={`0 0 ${width} ${height}`}

                width="100%"

                height={320}

                role="img"

                aria-label="Monthly revenue chart"

            >

                {[0, 1, 2, 3].map((step) => {

                    const y = padding + (step * (height - padding * 2)) / 3;

                    return (

                        <line

                            key={step}

                            x1={padding}

                            x2={width - padding}

                            y1={y}

                            y2={y}

                            stroke="rgba(217, 151, 77, 0.15)"

                            strokeDasharray="4 6"

                        />

                    );

                })}

                {points.length > 0 && (

                    <path d={areaPath} fill="rgba(217, 151, 77, 0.12)" />

                )}

                {points.length > 0 && (

                    <path

                        d={linePath}

                        fill="none"

                        stroke="#D9974D"

                        strokeWidth={3}

                        strokeLinecap="round"

                        strokeLinejoin="round"

                    />

                )}

                {points.map((point) => (

                    <g key={`${point.label}-${point.value}`}>

                        <circle

                            cx={point.x}

                            cy={point.y}

                            r={4}

                            fill="#D9974D"

                        />

                        <text

                            x={point.x}

                            y={height - 8}

                            textAnchor="middle"

                            fontSize="10"

                            fill="#6b7280"

                        >

                            {point.label}

                        </text>

                    </g>

                ))}

            </svg>

        </div>

    );

}