import DashboardPanel
    from "../DashboardPanel/DashboardPanel";

import type {
    VendorDashboardSummary
} from "../../../../types/VendorDashboard";

import styles
    from "./TodaySummary.module.css";


interface Props {

    summary:
        VendorDashboardSummary;

}


export default function TodaySummary({

    summary

}: Props) {


    /*
     * =========================================
     * SAFE NUMBER
     * =========================================
     */

    const safeNumber = (
        value: unknown
    ): number => {


        const parsedValue =
            Number(value);


        return Number.isFinite(
            parsedValue
        )
            ? parsedValue
            : 0;

    };


    return (


        <DashboardPanel
            title="Business Summary"
        >


            <div
                className={
                    styles.summary
                }
            >


                <div
                    className={
                        styles.item
                    }
                >


                    <span
                        className={
                            styles.icon
                        }
                    >
                        📋
                    </span>


                    <div>


                        <h4>

                            {
                                safeNumber(
                                    summary.totalBookings
                                )
                            }

                        </h4>


                        <p>
                            Total Bookings
                        </p>


                    </div>


                </div>


                <div
                    className={
                        styles.item
                    }
                >


                    <span
                        className={
                            styles.icon
                        }
                    >
                        ⏳
                    </span>


                    <div>


                        <h4>

                            {
                                safeNumber(
                                    summary.pendingBookings
                                )
                            }

                        </h4>


                        <p>
                            Pending Bookings
                        </p>


                    </div>


                </div>


                <div className={styles.item}>

                    <span className={styles.icon}>
                        ⭐
                    </span>

                    <div>

                        <h4>

                            {
                                (
                                    summary.averageRating ?? 0
                                ).toFixed(1)
                            }

                        </h4>

                        <p>
                            Average Rating
                        </p>

                    </div>

                </div>


                <div
                    className={
                        styles.item
                    }
                >


                    <span
                        className={
                            styles.icon
                        }
                    >
                        💰
                    </span>


                    <div>


                        <h4>

                            ₹
                            {
                                safeNumber(
                                    summary.monthlyRevenue
                                ).toLocaleString(
                                    "en-IN"
                                )
                            }

                        </h4>


                        <p>
                            Monthly Revenue
                        </p>


                    </div>


                </div>


            </div>


        </DashboardPanel>


    );


}