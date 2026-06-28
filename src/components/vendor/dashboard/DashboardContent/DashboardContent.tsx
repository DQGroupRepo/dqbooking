import VendorBookingTable from "../../booking/VendorBookingTable/VendorBookingTable";

import TodaySummary from "../TodaySummary/TodaySummary";
import QuickActions from "../QuickActions/QuickActions";
import DashboardPanel from "../DashboardPanel/DashboardPanel";
import Notifications from "../Notifications/Notifications";
import RevenueSnapshot from "../RevenueSnapshot/RevenueSnapshot";
import ReviewList from "../../../common/reviews/ReviewList/ReviewList";

import type { VendorBooking } from "../../../types/VendorBooking";
import type { VendorDashboardSummary } from "../../../types/VendorDashboard";

import styles from "./DashboardContent.module.css";

interface Props {
    bookings: VendorBooking[];
    summary: VendorDashboardSummary;
}

export default function DashboardContent({
    bookings,
    summary,
}: Props) {

    return (

        <div className={styles.grid}>

            <VendorBookingTable
                title="Recent Booking Requests"
                bookings={bookings}
            />

            <div className={styles.rightPanel}>

                <TodaySummary summary={summary}/>

                <QuickActions />

                <Notifications />

                <RevenueSnapshot />

            </div>

            <DashboardPanel title="Recent Reviews">

                <ReviewList

                    title=""

                    limit={2}

                    layout="list"

                />

            </DashboardPanel>

        </div>

    );

}