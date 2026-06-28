import { useEffect, useState } from "react";

import { FaArrowTrendUp } from "react-icons/fa6";

import DashboardPanel from "../DashboardPanel/DashboardPanel";

import VendorRevenueService from "../../../../services/VendorRevenueService";

import type { VendorRevenue } from "../../../../types/VendorRevenue";

import styles from "./RevenueSnapshot.module.css";

export default function RevenueSnapshot() {

    const [revenue, setRevenue] = useState<VendorRevenue | null>(null);

    useEffect(() => {

        loadRevenue();

    }, []);

    async function loadRevenue() {

        const data =
            await VendorRevenueService.getRevenueSummary();

        setRevenue(data);

    }

    if (!revenue) {

        return null;

    }

    return (

        <DashboardPanel title="Revenue Snapshot">

            <div className={styles.container}>

                <div className={styles.card}>

                    <span>Today</span>

                    <h3>₹{revenue.today.toLocaleString()}</h3>

                </div>

                <div className={styles.card}>

                    <span>This Week</span>

                    <h3>₹{revenue.thisWeek.toLocaleString()}</h3>

                </div>

                <div className={styles.card}>

                    <span>This Month</span>

                    <h3>₹{revenue.thisMonth.toLocaleString()}</h3>

                </div>

                <div className={styles.growth}>

                    <FaArrowTrendUp />

                    <span>18% increase compared to last month</span>

                </div>

            </div>

        </DashboardPanel>

    );

}