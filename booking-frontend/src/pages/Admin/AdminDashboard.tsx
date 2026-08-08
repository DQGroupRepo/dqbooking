import { useEffect, useState } from "react";

import AdminDashboardService, {
    type AdminDashboardData
} from "../../services/AdminDashboardService";

import "./AdminDashboard.css";

const AdminDashboard = () => {

    const [dashboard, setDashboard] =
        useState<AdminDashboardData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        loadDashboard();

    }, []);


    async function loadDashboard() {

        try {

            setLoading(true);
            setError("");

            const data =
                await AdminDashboardService
                    .getDashboard();

            setDashboard(data);

        } catch (error) {

            console.error(
                "Failed to load admin dashboard:",
                error
            );

            setError(
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (
            <section className="admin-dashboard">

                <div className="admin-empty-state">

                    <h3>
                        Loading dashboard...
                    </h3>

                </div>

            </section>
        );

    }


    if (error || !dashboard) {

        return (
            <section className="admin-dashboard">

                <div className="admin-empty-state">

                    <h3>
                        {error ||
                            "Dashboard data unavailable."}
                    </h3>

                </div>

            </section>
        );

    }


    return (

        <section className="admin-dashboard">

            {/* =========================================
                PAGE HEADER
            ========================================= */}

            <div className="admin-dashboard-header">

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Overview of your EventNest platform.
                    </p>

                </div>

            </div>


            {/* =========================================
                STAT CARDS
            ========================================= */}

            <div className="admin-stat-grid">

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        👥
                    </div>

                    <div>

                        <span>
                            Total Users
                        </span>

                        <strong>
                            {dashboard.totalUsers}
                        </strong>

                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        🏢
                    </div>

                    <div>

                        <span>
                            Total Vendors
                        </span>

                        <strong>
                            {dashboard.totalVendors}
                        </strong>

                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        📅
                    </div>

                    <div>

                        <span>
                            Total Bookings
                        </span>

                        <strong>
                            {dashboard.totalBookings}
                        </strong>

                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        ₹
                    </div>

                    <div>

                        <span>
                            Total Revenue
                        </span>

                        <strong>
                            ₹{dashboard.totalRevenue.toLocaleString()}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================================
                BOOKING OVERVIEW
            ========================================= */}

            <div className="admin-dashboard-grid">

                <div className="admin-dashboard-card">

                    <div className="admin-card-header">

                        <div>

                            <h2>
                                Booking Overview
                            </h2>

                            <p>
                                Current booking status across EventNest.
                            </p>

                        </div>

                    </div>


                    <div className="admin-booking-stats">

                        <div className="admin-booking-stat">

                            <span className="status-dot pending">
                            </span>

                            <div>

                                <strong>
                                    {dashboard.pendingBookings}
                                </strong>

                                <span>
                                    Pending
                                </span>

                            </div>

                        </div>


                        <div className="admin-booking-stat">

                            <span className="status-dot confirmed">
                            </span>

                            <div>

                                <strong>
                                    {dashboard.confirmedBookings}
                                </strong>

                                <span>
                                    Confirmed
                                </span>

                            </div>

                        </div>


                        <div className="admin-booking-stat">

                            <span className="status-dot completed">
                            </span>

                            <div>

                                <strong>
                                    {dashboard.completedBookings}
                                </strong>

                                <span>
                                    Completed
                                </span>

                            </div>

                        </div>


                        <div className="admin-booking-stat">

                            <span className="status-dot cancelled">
                            </span>

                            <div>

                                <strong>
                                    {dashboard.cancelledBookings}
                                </strong>

                                <span>
                                    Cancelled
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    PLATFORM SUMMARY
                ===================================== */}

                <div className="admin-dashboard-card">

                    <div className="admin-card-header">

                        <div>

                            <h2>
                                Platform Summary
                            </h2>

                            <p>
                                Key platform activity.
                            </p>

                        </div>

                    </div>


                    <div className="admin-summary-list">

                        <div>

                            <span>
                                Active Customers
                            </span>

                            <strong>
                                {dashboard.activeCustomers}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Active Vendors
                            </span>

                            <strong>
                                {dashboard.activeVendors}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Active Services
                            </span>

                            <strong>
                                {dashboard.activeServices}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Reviews
                            </span>

                            <strong>
                                {dashboard.totalReviews}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================================
                RECENT BOOKINGS
            ========================================= */}

            <div className="admin-dashboard-card admin-recent-bookings">

                <div className="admin-card-header">

                    <div>

                        <h2>
                            Recent Bookings
                        </h2>

                        <p>
                            Latest activity on the platform.
                        </p>

                    </div>

                </div>


                {dashboard.recentBookings.length === 0 ? (

                    <div className="admin-empty-state">

                        <div className="admin-empty-icon">
                            📋
                        </div>

                        <h3>
                            No booking data yet
                        </h3>

                        <p>
                            Recent booking information will appear here
                            once bookings are created.
                        </p>

                    </div>

                ) : (

                    <div className="admin-recent-bookings-list">

                        {dashboard.recentBookings.map(
                            (booking) => (

                                <div
                                    key={booking.id}
                                    className="admin-recent-booking"
                                >

                                    <div>

                                        <strong>
                                            {booking.bookingNumber}
                                        </strong>

                                        <span>
                                            {booking.customerName}
                                        </span>

                                    </div>


                                    <div>

                                        <span>
                                            {booking.serviceName}
                                        </span>

                                        <span>
                                            {booking.eventDate}
                                        </span>

                                    </div>


                                    <strong>
                                        ₹
                                        {booking.totalAmount
                                            .toLocaleString()}
                                    </strong>


                                    <span
                                        className={
                                            `admin-booking-status ${booking.status.toLowerCase()}`
                                        }
                                    >
                                        {booking.status}
                                    </span>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </section>

    );

};

export default AdminDashboard;