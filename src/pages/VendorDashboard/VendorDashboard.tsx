import { useEffect, useState } from "react";
import DashboardHero from "../../components/vendor/dashboard/DashboardHero/DashboardHero";

import VendorBookingService from "../../services/VendorBookingService";
import VendorDashboardService from "../../services/VendorDashboardService";

import type { VendorBooking } from "../../types/VendorBooking";
import type { VendorDashboardSummary } from "../../types/VendorDashboard";

import DashboardStats from "../../components/vendor/dashboard/DashboardStats/DashboardStats";
import DashboardContent from "../../components/vendor/dashboard/DashboardContent/DashboardContent";

import styles from "./VendorDashboard.module.css";

export default function VendorDashboard() {
  const [summary, setSummary] =
    useState<VendorDashboardSummary | null>(null);

  const [bookings, setBookings] = useState<VendorBooking[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {

    const dashboard =
      await VendorDashboardService.getDashboardSummary();

    setSummary(dashboard);

    const recentBookings =
      await VendorBookingService.getRecentBookings();

    setBookings(recentBookings);

  };

  if (!summary) {
    return <p>Loading Dashboard...</p>;
  }

  return (
    <div className={styles.dashboard}>

      <DashboardHero
        vendorName="Royal Palace Events"
      />

      <DashboardStats
        summary={summary}
      />

      <DashboardContent

          bookings={bookings}

          summary={summary}

      />

    </div>
  );
}