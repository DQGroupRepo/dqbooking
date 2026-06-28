import {
  FaCalendarCheck,
  FaClock,
  FaCheckCircle,
  FaRupeeSign,
} from "react-icons/fa";

import DashboardCard from "../DashboardCard/DashboardCard";

import type { VendorDashboardSummary } from "../../../types/VendorDashboard";

import styles from "./DashboardStats.module.css";

interface Props {
  summary: VendorDashboardSummary;
}

export default function DashboardStats({ summary }: Props) {
  return (
    <div className={styles.statsGrid}>
      <DashboardCard
        title="Total Bookings"
        value={summary.totalBookings}
        icon={FaCalendarCheck}
      />

      <DashboardCard
        title="Pending"
        value={summary.pendingBookings}
        icon={FaClock}
      />

      <DashboardCard
        title="Confirmed"
        value={summary.confirmedBookings}
        icon={FaCheckCircle}
      />

      <DashboardCard
        title="Revenue"
        value={`₹${(summary.totalRevenue / 100000).toFixed(1)} L`}
        icon={FaRupeeSign}
      />
    </div>
  );
}