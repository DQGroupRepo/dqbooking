import DashboardPanel from "../DashboardPanel/DashboardPanel";
import type { VendorDashboardSummary } from "../../../../types/VendorDashboard";

import styles from "./TodaySummary.module.css";

interface Props {
    summary: VendorDashboardSummary;
}

export default function TodaySummary({ summary }: Props) {
    return (
        <DashboardPanel title="Today's Summary">

            <div className={styles.summary}>

                <div className={styles.item}>
                    <span className={styles.icon}>📅</span>
                    <div>
                        <h4>{summary.upcomingEvents}</h4>
                        <p>Upcoming Events</p>
                    </div>
                </div>

                <div className={styles.item}>
                    <span className={styles.icon}>⭐</span>
                    <div>
                        <h4>{summary.newReviews}</h4>
                        <p>New Reviews</p>
                    </div>
                </div>

                <div className={styles.item}>
                    <span className={styles.icon}>💰</span>
                    <div>
                        <h4>₹{summary.todaysRevenue.toLocaleString()}</h4>
                        <p>Today's Revenue</p>
                    </div>
                </div>

            </div>

        </DashboardPanel>
    );
}