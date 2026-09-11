import {
    FaCalendarCheck,
    FaClock,
    FaCheckCircle,
    FaRupeeSign,
} from "react-icons/fa";

import DashboardCard from "../DashboardCard/DashboardCard";

import type {
    VendorDashboardSummary
} from "../../../types/VendorDashboard";

import styles from "./DashboardStats.module.css";


interface Props {

    summary: VendorDashboardSummary;

}


export default function DashboardStats({

    summary

}: Props) {


    const totalBookings =
        summary.totalBookings ?? 0;


    const pendingBookings =
        summary.pendingBookings ?? 0;


    const completedBookings =
        summary.completedBookings ?? 0;


    const monthlyRevenue =
        summary.monthlyRevenue ?? 0;


    return (

        <div className={styles.statsGrid}>


            <DashboardCard

                title="Total Bookings"

                value={totalBookings}

                icon={FaCalendarCheck}

            />


            <DashboardCard

                title="Pending"

                value={pendingBookings}

                icon={FaClock}

            />


            <DashboardCard

                title="Completed"

                value={completedBookings}

                icon={FaCheckCircle}

            />


            <DashboardCard

                title="Revenue"

                value={`₹${monthlyRevenue.toLocaleString("en-IN")}`}

                icon={FaRupeeSign}

            />


        </div>

    );

}