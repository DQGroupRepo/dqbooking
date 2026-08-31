import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import CartService from "../../services/CartService";

import NotificationService from "../../services/NotificationService";

import type { Notification } from "../../types/Notification";

import "./Header.css";


const Header = () => {

    const {
        user,
        isAuthenticated,
        logout
    } = useAuth();

    const [
        notifications,
        setNotifications
    ] = useState<Notification[]>([]);


    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);


    const [
        showNotifications,
        setShowNotifications
    ] = useState(false);

    const navigate = useNavigate();

    /*
     * =========================================
     * CART COUNT
     * =========================================
     */

    const [
        cartCount,
        setCartCount
    ] = useState(
        CartService.getItemCount()
    );

    useEffect(() => {

        if (!isAuthenticated) {

            setNotifications([]);

            setUnreadCount(0);

            return;

        }


        loadHeaderNotifications();

    }, [isAuthenticated]);

    async function loadHeaderNotifications() {

        try {

            const data =
                await NotificationService
                    .getNotifications();

            setNotifications(
                data.slice(0, 5)
            );


            const count =
                data.filter(
                    notification =>
                        !notification.read
                ).length;

            setUnreadCount(
                count
            );

        }
        catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );

        }

    }

    async function handleHeaderNotificationClick(
        notification: Notification
    ) {

        try {

            if (!notification.read) {

                await NotificationService
                    .markAsRead(
                        notification.id
                    );

            }

        }
        catch (error) {

            console.error(
                "Failed to mark notification as read:",
                error
            );

        }


        setShowNotifications(
            false
        );


        if (
            notification.referenceId &&
            (
                notification.type === "BOOKING" ||
                notification.type === "CANCELLED"
            )
        ) {

            if (
                user?.role === "VENDOR"
            ) {

                navigate(
                    `/vendor/bookings/${notification.referenceId}`
                );

                return;

            }


            if (
                user?.role === "CUSTOMER"
            ) {

                navigate(
                    `/customer/bookings/${notification.referenceId}`
                );

                return;

            }

        }

    }


    /*
     * =========================================
     * LISTEN FOR CART CHANGES
     * =========================================
     */

    useEffect(() => {

        const updateCartCount = () => {

            setCartCount(
                CartService.getItemCount()
            );

        };


        /*
         * Update immediately when another
         * component changes the cart.
         */

        window.addEventListener(
            "cartUpdated",
            updateCartCount
        );


        /*
         * Also refresh when user returns
         * to the browser/tab.
         */

        window.addEventListener(
            "storage",
            updateCartCount
        );


        return () => {

            window.removeEventListener(
                "cartUpdated",
                updateCartCount
            );

            window.removeEventListener(
                "storage",
                updateCartCount
            );

        };

    }, []);

    function formatNotificationTime(
        createdAt: string
    ): string {

        const date =
            new Date(createdAt);

        const now =
            new Date();

        const diff =
            now.getTime() -
            date.getTime();

        const minutes =
            Math.floor(
                diff / 60000
            );

        if (minutes < 1) {

            return "Just now";

        }

        if (minutes < 60) {

            return `${minutes} min ago`;

        }

        const hours =
            Math.floor(
                minutes / 60
            );

        if (hours < 24) {

            return `${hours} hr ago`;

        }

        const days =
            Math.floor(
                hours / 24
            );

        if (days === 1) {

            return "Yesterday";

        }

        if (days < 7) {

            return `${days} days ago`;

        }

        return date.toLocaleDateString(
            "en-IN"
        );

    }


    return (

        <>

            <div className="top-bar">

                <div className="container top-container">


                    <div className="top-location">

                        🇮🇳 India ▼

                        &nbsp;&nbsp;

                        ₹ INR ▼

                    </div>


                    <div className="header-actions">


                        <Link to="/help">
                            Help
                        </Link>


                        {isAuthenticated && user ? (

                            <>

                                {/* =================================
                                    CART
                                ================================= */}

                                <button
                                    type="button"
                                    className="header-cart-button"
                                    onClick={() =>
                                        navigate("/cart")
                                    }
                                    title="View Cart"
                                >

                                    <span className="header-cart-icon">
                                        🛒
                                    </span>

                                    <span>
                                        Cart
                                    </span>

                                    <span className="header-cart-badge">
                                        {cartCount}
                                    </span>

                                </button>


                                {/* =================================
                                    NOTIFICATIONS
                                ================================= */}

                                <div className="notification-wrapper">

                                    <button
                                        type="button"
                                        className="notification-btn"
                                        title="Notifications"
                                        onClick={() =>
                                            setShowNotifications(
                                                current => !current
                                            )
                                        }
                                    >

                                        <span className="notification-icon">
                                            🔔
                                        </span>

                                        {
                                            unreadCount > 0 && (

                                                <span className="notification-badge">
                                                    {
                                                        unreadCount > 9
                                                            ? "9+"
                                                            : unreadCount
                                                    }
                                                </span>

                                            )
                                        }

                                    </button>


                                    {
                                        showNotifications && (

                                            <div
                                                className="notification-dropdown"
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }
                                            >

                                                {/* =========================
                                                    HEADER
                                                ========================= */}

                                                <div className="notification-dropdown-header">

                                                    <div>

                                                        <h3>
                                                            Notifications
                                                        </h3>

                                                        <span>
                                                            {
                                                                unreadCount
                                                            } unread
                                                        </span>

                                                    </div>


                                                    {
                                                        unreadCount > 0 && (

                                                            <button
                                                                type="button"
                                                                className="notification-mark-all"
                                                                onClick={async () => {

                                                                    await NotificationService
                                                                        .markAllAsRead();

                                                                    await loadHeaderNotifications();

                                                                }}
                                                            >
                                                                Mark all as read
                                                            </button>

                                                        )
                                                    }

                                                </div>


                                                {/* =========================
                                                    NOTIFICATION LIST
                                                ========================= */}

                                                <div className="notification-list">

                                                    {
                                                        notifications.length === 0 ? (

                                                            <div className="notification-empty">

                                                                <div className="notification-empty-icon">
                                                                    🔔
                                                                </div>

                                                                <strong>
                                                                    You're all caught up
                                                                </strong>

                                                                <span>
                                                                    No new notifications.
                                                                </span>

                                                            </div>

                                                        ) : (

                                                            notifications.map(
                                                                notification => (

                                                                    <button
                                                                        type="button"

                                                                        key={
                                                                            notification.id
                                                                        }

                                                                        className={
                                                                            `notification-item ${
                                                                                !notification.read
                                                                                    ? "unread"
                                                                                    : ""
                                                                            }`
                                                                        }

                                                                        onClick={() =>
                                                                            handleHeaderNotificationClick(
                                                                                notification
                                                                            )
                                                                        }
                                                                    >

                                                                        <div className="notification-item-icon">

                                                                            {
                                                                                notification.type ===
                                                                                    "BOOKING"
                                                                                    ? "📅"
                                                                                    : notification.type ===
                                                                                        "PAYMENT"
                                                                                        ? "₹"
                                                                                        : notification.type ===
                                                                                            "REVIEW"
                                                                                            ? "⭐"
                                                                                            : notification.type ===
                                                                                                "CANCELLED"
                                                                                                ? "⚠️"
                                                                                                : "🔔"
                                                                            }

                                                                        </div>


                                                                        <div className="notification-item-content">

                                                                            <div className="notification-item-top">

                                                                                <strong>
                                                                                    {
                                                                                        notification.title
                                                                                    }
                                                                                </strong>

                                                                                {
                                                                                    !notification.read && (

                                                                                        <span className="notification-unread-dot" />

                                                                                    )
                                                                                }

                                                                            </div>


                                                                            <p>
                                                                                {
                                                                                    notification.message
                                                                                }
                                                                            </p>


                                                                            {
                                                                                notification.createdAt && (

                                                                                    <span className="notification-item-time">

                                                                                        {
                                                                                            formatNotificationTime(
                                                                                                notification.createdAt
                                                                                            )
                                                                                        }

                                                                                    </span>

                                                                                )
                                                                            }

                                                                        </div>

                                                                    </button>

                                                                )
                                                            )

                                                        )
                                                    }

                                                </div>


                                                {/* =========================
                                                    FOOTER
                                                ========================= */}

                                                {
                                                    notifications.length > 0 && (

                                                        <div className="notification-dropdown-footer">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowNotifications(
                                                                        false
                                                                    )
                                                                }
                                                            >
                                                                Close
                                                            </button>

                                                        </div>

                                                    )
                                                }

                                            </div>

                                        )
                                    }

                                </div>


                                {/* =================================
                                    USER PROFILE
                                ================================= */}

                                <div className="user-profile">

                                    <span className="user-avatar">
                                        👤
                                    </span>


                                    <div className="user-details">

                                        <span className="user-name">
                                            {user.name || "User"}
                                        </span>


                                        <span className="user-role">
                                            {user.role}
                                        </span>

                                    </div>

                                </div>


                                {/* =================================
                                    VENDOR DASHBOARD
                                ================================= */}

                                {user.role === "VENDOR" && (

                                    <Link
                                        to="/vendor/dashboard"
                                        className="header-dashboard-link"
                                    >
                                        Dashboard
                                    </Link>

                                )}


                                {/* =================================
                                    ADMIN DASHBOARD
                                ================================= */}

                                {user.role === "ADMIN" && (

                                    <Link
                                        to="/admin/dashboard"
                                        className="header-dashboard-link"
                                    >
                                        Dashboard
                                    </Link>

                                )}


                                {/* =================================
                                    LOGOUT
                                ================================= */}

                                <button
                                    className="logout-btn"
                                    onClick={() => {
                                        logout();
                                        navigate("/");
                                    }}
                                >
                                    Logout
                                </button>

                            </>

                        ) : (

                            <>

                                <Link to="/login">

                                    <button
                                        className="login-btn"
                                    >
                                        Login
                                    </button>

                                </Link>


                                <Link to="/register">

                                    <button
                                        className="register-btn"
                                    >
                                        Register
                                    </button>

                                </Link>

                            </>

                        )}

                    </div>

                </div>

            </div>


            {/* =========================================
                MAIN HEADER
            ========================================= */}

            <header className="main-header">

                <div className="container header-container">


                    <Link
                        to="/"
                        className="logo"
                    >

                        🎉 EventNest

                    </Link>


                    <nav className="desktop-menu">


                        <Link to="/">
                            Home
                        </Link>


                        <Link to="/categories?category=HALL">
                            Halls
                        </Link>


                        <Link to="/categories?category=PHOTOGRAPHY">
                            Photography
                        </Link>


                        <Link to="/categories?category=MAKEUP">
                            Makeup
                        </Link>


                        {user?.role === "CUSTOMER" && (

                            <Link to="/customer/bookings">
                                My Bookings
                            </Link>

                        )}

                    </nav>


                </div>

            </header>

        </>

    );

};


export default Header;