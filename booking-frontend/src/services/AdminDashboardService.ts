import api from "../api/axiosConfig";

export interface AdminRecentBooking {
    id: string;
    bookingNumber: string;
    customerName: string;
    serviceName: string;
    eventDate: string;
    totalAmount: number;
    status: string;
}

export interface AdminDashboardData {
    totalUsers: number;
    totalVendors: number;
    totalBookings: number;
    totalRevenue: number;

    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;

    activeCustomers: number;
    activeVendors: number;
    activeServices: number;
    totalReviews: number;

    recentBookings: AdminRecentBooking[];
}

class AdminDashboardService {

    async getDashboard(): Promise<AdminDashboardData> {

        const response =
            await api.get<AdminDashboardData>(
                "/admin/dashboard"
            );

        return response.data;
    }

}

export default new AdminDashboardService();