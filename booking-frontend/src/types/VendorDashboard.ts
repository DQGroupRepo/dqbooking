import type { RecentBooking } from "./RecentBooking";

export interface VendorDashboardSummary {

    vendorName: string;

    totalBookings: number;

    pendingBookings: number;

    completedBookings: number;

    monthlyRevenue: number;

    averageRating: number;

    recentBookings: RecentBooking[];

    // Optional - we'll populate these later
    totalServices?: number;

    activeServices?: number;

}
