import { useEffect, useState } from "react";
import DashboardHero from "../../components/vendor/dashboard/DashboardHero/DashboardHero";

import VendorDashboardService from "../../services/VendorDashboardService";

import type { RecentBooking } from "../../types/RecentBooking";
import type { VendorDashboardSummary } from "../../types/VendorDashboard";

import DashboardStats from "../../components/vendor/dashboard/DashboardStats/DashboardStats";
import DashboardContent from "../../components/vendor/dashboard/DashboardContent/DashboardContent";

import styles from "./VendorDashboard.module.css";

export default function VendorDashboard() {
  const [summary, setSummary] =
    useState<VendorDashboardSummary | null>(null);

  const [bookings, setBookings] = useState<RecentBooking[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {

      try {

          setLoading(true);

          const dashboard =
              await VendorDashboardService.getDashboard();
            console.log(
                "VENDOR DASHBOARD RESPONSE:",
                dashboard
            );
          setSummary(dashboard);

          setBookings(dashboard.recentBookings);

      }

      catch (err) {

          console.error(err);

          setError("Unable to load dashboard.");

      }

      finally {

          setLoading(false);

      }

  };

  if (loading) {

      return <p>Loading Dashboard...</p>;

  }

  if (error) {

      return <p>{error}</p>;

  }

  if (!summary) {
    return <p>Loading Dashboard...</p>;
  }

  return (
    <div className={styles.dashboard}>

      <DashboardHero
        vendorName={summary.vendorName}
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