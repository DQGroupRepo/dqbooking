import VendorBookingTable from "../../booking/VendorBookingTable/VendorBookingTable";

import TodaySummary from "../TodaySummary/TodaySummary";
import QuickActions from "../QuickActions/QuickActions";

import type { RecentBooking } from "../../../../types/RecentBooking";
import type { VendorDashboardSummary } from "../../../../types/VendorDashboard";

import styles from "./DashboardContent.module.css";

interface Props {

    bookings: RecentBooking[];

    summary: VendorDashboardSummary;

}

export default function DashboardContent({

    bookings,

    summary

}: Props) {

    return (

        <div className={styles.grid}>

            <VendorBookingTable
                title="Recent Booking Requests"
                bookings={bookings}
            />

            <div className={styles.rightPanel}>

                <TodaySummary summary={summary} />

                <QuickActions />

            </div>

        </div>

    );

}