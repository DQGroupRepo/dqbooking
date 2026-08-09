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
    const formatMonth = (period: string) => {

        const [year, month] = period.split("-");

        const date = new Date(
            Number(year),
            Number(month) - 1,
            1
        );

        return date.toLocaleString("en-US", {
            month: "short"
        });
    };


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

    /* =========================================
       ANALYTICS HELPERS
    ========================================= */

    const maxBookings =
        Math.max(
            ...dashboard.bookingTrend.map(
                item => item.bookings
            ),
            1
        );


    const maxRevenue =
        Math.max(
            ...dashboard.revenueTrend.map(
                item => item.revenue
            ),
            1
        );


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
                ANALYTICS
            ========================================= */}

            <div className="admin-analytics-grid">

                {/* BOOKING TREND */}

                <div className="admin-dashboard-card">

                    <div className="admin-card-header">

                        <div>

                            <h2>
                                Booking Trend
                            </h2>

                            <p>
                                Booking activity over the last six months.
                            </p>

                        </div>

                    </div>


                    {dashboard.bookingTrend.length === 0 ? (

                        <div className="admin-empty-state">

                            <div className="admin-empty-icon">
                                📊
                            </div>

                            <h3>
                                No booking trend data
                            </h3>

                            <p>
                                Booking activity will appear here
                                once bookings are created.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-trend-chart">

                            {dashboard.bookingTrend.map(
                                (item) => {

                                    const height =
                                        Math.max(
                                            (item.bookings /
                                                maxBookings) * 100,
                                            5
                                        );

                                    return (

                                        <div
                                            key={item.period}
                                            className="admin-trend-column"
                                        >

                                            <div className="admin-trend-value">
                                                {item.bookings}
                                            </div>

                                            <div className="admin-trend-bar-wrapper">

                                                <div
                                                    className="admin-trend-bar booking-bar"
                                                    style={{
                                                        height:
                                                            `${height}%`
                                                    }}
                                                />

                                            </div>

                                            <span>
                                                {formatMonth(
                                                    item.period
                                                )}
                                            </span>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </div>


                {/* REVENUE TREND */}

                <div className="admin-dashboard-card">

                    <div className="admin-card-header">

                        <div>

                            <h2>
                                Revenue Trend
                            </h2>

                            <p>
                                Revenue generated over the last six months.
                            </p>

                        </div>

                    </div>


                    {dashboard.revenueTrend.length === 0 ? (

                        <div className="admin-empty-state">

                            <div className="admin-empty-icon">
                                ₹
                            </div>

                            <h3>
                                No revenue trend data
                            </h3>

                            <p>
                                Revenue information will appear here
                                once bookings are completed.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-trend-chart">

                            {dashboard.revenueTrend.map(
                                (item) => {

                                    const height =
                                        Math.max(
                                            (item.revenue /
                                                maxRevenue) * 100,
                                            5
                                        );

                                    return (

                                        <div
                                            key={item.period}
                                            className="admin-trend-column"
                                        >

                                            <div className="admin-trend-value">

                                                ₹
                                                {item.revenue
                                                    .toLocaleString()}

                                            </div>

                                            <div className="admin-trend-bar-wrapper">

                                                <div
                                                    className="admin-trend-bar revenue-bar"
                                                    style={{
                                                        height:
                                                            `${height}%`
                                                    }}
                                                />

                                            </div>

                                            <span>
                                                {formatMonth(
                                                    item.period
                                                )}
                                            </span>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </div>

            </div>

            {/* =========================================
                PENDING ACTIONS
            ========================================= */}

            <div className="admin-dashboard-card admin-pending-actions">

                <div className="admin-card-header">

                    <div>

                        <h2>
                            Pending Actions
                        </h2>

                        <p>
                            Items that require administrator attention.
                        </p>

                    </div>

                </div>

                <div className="admin-pending-actions-list">

                    <div className="admin-pending-action-row">

                        <div>

                            <div className="admin-pending-action-icon">
                                🏢
                            </div>

                            <div>

                                <strong>
                                    Pending Vendor Verifications
                                </strong>

                                <span>
                                    Vendors waiting for approval.
                                </span>

                            </div>

                        </div>

                        <strong className="admin-pending-count">
                            {dashboard.pendingActions.pendingVendorVerifications}
                        </strong>

                        <a href="/admin/vendors">
                            Review
                        </a>

                    </div>

                    <div className="admin-pending-action-row">

                        <div>

                            <div className="admin-pending-action-icon">
                                📋
                            </div>

                            <div>

                                <strong>
                                    Pending Service Moderation
                                </strong>

                                <span>
                                    Services waiting for approval.
                                </span>

                            </div>

                        </div>

                        <strong className="admin-pending-count">
                            {dashboard.pendingActions.pendingServiceModerations}
                        </strong>

                        <a href="/admin/vendors">
                            Review
                        </a>

                    </div>

                    <div className="admin-pending-action-row">

                        <div>

                            <div className="admin-pending-action-icon">
                                📅
                            </div>

                            <div>

                                <strong>
                                    Pending Bookings
                                </strong>

                                <span>
                                    Bookings awaiting action.
                                </span>

                            </div>

                        </div>

                        <strong className="admin-pending-count">
                            {dashboard.pendingActions.pendingBookings}
                        </strong>

                        <a href="/admin/bookings">
                            View
                        </a>

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