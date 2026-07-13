import DashboardPanel from "../DashboardPanel/DashboardPanel";
import type { VendorDashboardSummary } from "../../../../types/VendorDashboard";

import styles from "./TodaySummary.module.css";

interface Props {

    summary: VendorDashboardSummary;

}

export default function TodaySummary({

    summary

}: Props) {

    return (

        <DashboardPanel title="Business Summary">

            <div className={styles.summary}>

                <div className={styles.item}>

                    <span className={styles.icon}>📋</span>

                    <div>

                        <h4>{summary.totalBookings}</h4>

                        <p>Total Bookings</p>

                    </div>

                </div>

                <div className={styles.item}>

                    <span className={styles.icon}>⏳</span>

                    <div>

                        <h4>{summary.pendingBookings}</h4>

                        <p>Pending Bookings</p>

                    </div>

                </div>

                <div className={styles.item}>

                    <span className={styles.icon}>⭐</span>

                    <div>

                        <h4>{summary.averageRating.toFixed(1)}</h4>

                        <p>Average Rating</p>

                    </div>

                </div>

                <div className={styles.item}>

                    <span className={styles.icon}>💰</span>

                    <div>

                        <h4>

                            ₹{(summary.monthlyRevenue ?? 0).toLocaleString()}

                        </h4>

                        <p>Monthly Revenue</p>

                    </div>

                </div>

            </div>

        </DashboardPanel>

    );

}