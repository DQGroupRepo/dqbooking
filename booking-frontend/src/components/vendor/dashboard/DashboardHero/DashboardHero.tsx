import {
    FaCalendarCheck,
    FaPlusCircle
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import type {
    VendorDashboardSummary
} from "../../../../types/VendorDashboard";

import styles from "./DashboardHero.module.css";


interface DashboardHeroProps {

    summary: VendorDashboardSummary;

}


export default function DashboardHero({

    summary

}: DashboardHeroProps) {


    const navigate =
        useNavigate();


    const today =
        new Date().toLocaleDateString(
            "en-IN",
            {

                weekday: "long",

                day: "numeric",

                month: "long",

            }
        );


    const monthlyRevenue =
        summary.monthlyRevenue ?? 0;


    return (

        <section className={styles.hero}>


            <div className={styles.left}>


                <span className={styles.date}>

                    {today}

                </span>


                <h1>

                    Welcome back,

                    <br />

                    {summary.vendorName}

                </h1>


                <p>

                    Here's what's happening with your business today.

                </p>


                <div className={styles.actions}>


                    <button

                        onClick={() =>
                            navigate(
                                "/vendor/create-listing"
                            )
                        }

                    >

                        <FaPlusCircle />

                        Create Listing

                    </button>


                    <button

                        className={styles.secondary}

                        onClick={() =>
                            navigate(
                                "/vendor/bookings"
                            )
                        }

                    >

                        <FaCalendarCheck />

                        View Bookings

                    </button>


                </div>


            </div>


            <div className={styles.right}>


                <div className={styles.statCard}>


                    <span>

                        Today's Revenue

                    </span>


                    <h2>

                        ₹0

                    </h2>


                    <small>

                        No bookings today

                    </small>


                </div>


                <div className={styles.statCard}>


                    <span>

                        This Month

                    </span>


                    <h2>

                        ₹
                        {
                            monthlyRevenue.toLocaleString(
                                "en-IN"
                            )
                        }

                    </h2>


                    <small>

                        Monthly Revenue

                    </small>


                </div>


            </div>


        </section>

    );

}