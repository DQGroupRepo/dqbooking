import { useEffect, useRef, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import {
    FaBell,
    FaCalendarAlt,
    FaChevronDown,
    FaCheckCircle,
    FaClock,
    FaMapMarkerAlt,
    FaQuestionCircle,
    FaRupeeSign,
    FaSearch,
    FaShoppingCart,
    FaStar,
    FaTimesCircle,
    FaUser,
    FaStore,
    FaSignOutAlt
} from "react-icons/fa";

import {
    useAuth
} from "../../context/AuthContext";

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

    const navigate = useNavigate();
    const location = useLocation();


    /*
     * =========================================
     * NOTIFICATIONS
     * =========================================
     */

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


    const notificationRef =
        useRef<HTMLDivElement>(null);


    /*
     * =========================================
     * CART
     * =========================================
     */

    const [
        cartCount,
        setCartCount
    ] = useState(
        CartService.getItemCount()
    );


    /*
     * =========================================
     * PROFILE
     * =========================================
     */

    const [
        showProfile,
        setShowProfile
    ] = useState(false);


    const profileRef =
        useRef<HTMLDivElement>(null);


    /*
     * =========================================
     * LOAD NOTIFICATIONS
     * =========================================
     */

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


            /*
             * Keep only the latest five
             * inside the header dropdown.
             */

            setNotifications(
                data.slice(0, 5)
            );


            /*
             * Calculate unread count
             * from the complete response.
             */

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


    /*
     * =========================================
     * NOTIFICATION CLICK
     * =========================================
     */

    async function handleNotificationClick(
        notification: Notification
    ) {

        try {

            if (!notification.read) {

                await NotificationService
                    .markAsRead(
                        notification.id
                    );


                /*
                 * Update local state immediately.
                 */

                setNotifications(
                    current =>
                        current.map(
                            item =>
                                item.id === notification.id
                                    ? {
                                        ...item,
                                        read: true
                                    }
                                    : item
                        )
                );


                setUnreadCount(
                    current =>
                        Math.max(
                            0,
                            current - 1
                        )
                );

            }

        }
        catch (error) {

            console.error(
                "Failed to mark notification as read:",
                error
            );

        }


        setShowNotifications(false);


        /*
         * =====================================
         * BOOKING / CANCELLATION
         * =====================================
         */

        if (
            notification.referenceId &&
            (
                notification.type === "BOOKING" ||
                notification.type === "CANCELLED"
            )
        ) {

            if (
              user?.role === "VENDOR_ADMIN" ||
              user?.role === "VENDOR_USER"
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
     * MARK ALL AS READ
     * =========================================
     */

    async function handleMarkAllAsRead() {

        if (unreadCount === 0) {

            return;

        }


        try {

            await NotificationService
                .markAllAsRead();


            setNotifications(
                current =>
                    current.map(
                        notification => ({
                            ...notification,
                            read: true
                        })
                    )
            );


            setUnreadCount(0);

        }
        catch (error) {

            console.error(
                "Failed to mark all notifications as read:",
                error
            );

        }

    }


    /*
     * =========================================
     * CART CHANGES
     * =========================================
     */

    useEffect(() => {

        const updateCartCount = () => {

            setCartCount(
                CartService.getItemCount()
            );

        };

        /*
            * Update immediately when
            * Header is mounted.
            */

        updateCartCount();

        window.addEventListener(
            "cartUpdated",
            updateCartCount
        );


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


    /*
     * =========================================
     * CLICK OUTSIDE
     * =========================================
     */

    useEffect(() => {

        function handleOutsideClick(
            event: MouseEvent
        ) {

            const target =
                event.target as Node;


            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    target
                )
            ) {

                setShowNotifications(false);

            }


            if (
                profileRef.current &&
                !profileRef.current.contains(
                    target
                )
            ) {

                setShowProfile(false);

            }

        }


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);


    /*
     * =========================================
     * NOTIFICATION TIME
     * =========================================
     */

    function formatNotificationTime(
        createdAt?: string
    ): string {

        if (!createdAt) {

            return "";

        }


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


    /*
     * =========================================
     * NOTIFICATION ICON
     * =========================================
     */

    function getNotificationIcon(
        type: Notification["type"]
    ) {

        switch (type) {

            case "BOOKING":

                return (
                    <FaCalendarAlt />
                );


            case "PAYMENT":

                return (
                    <FaRupeeSign />
                );


            case "REVIEW":

                return (
                    <FaStar />
                );


            case "CANCELLED":

                return (
                    <FaTimesCircle />
                );


            case "SYSTEM":

                return (
                    <FaCheckCircle />
                );


            default:

                return (
                    <FaBell />
                );

        }

    }


    /*
     * =========================================
     * NOTIFICATION STYLE
     * =========================================
     */

    function getNotificationTypeClass(
        type: Notification["type"]
    ) {

        switch (type) {

            case "BOOKING":
                return "notification-type-booking";

            case "PAYMENT":
                return "notification-type-payment";

            case "REVIEW":
                return "notification-type-review";

            case "CANCELLED":
                return "notification-type-cancelled";

            case "SYSTEM":
                return "notification-type-system";

            default:
                return "";

        }

    }


    /*
     * =========================================
     * AVATAR
     * =========================================
     */

    const userName =
        user?.name || "User";


    const avatar =
        userName
            .split(" ")
            .filter(Boolean)
            .map(
                word =>
                    word[0]
            )
            .join("")
            .substring(0, 2)
            .toUpperCase();


    /*
     * =========================================
     * LOGOUT
     * =========================================
     */

    function handleLogout() {

        setShowProfile(false);

        logout();

        navigate("/");

    }

    /*
     * =========================================
     * ACTIVE NAVIGATION
     * =========================================
     */

    const currentCategory =
        new URLSearchParams(
            location.search
        )
            .get("category")
            ?.toUpperCase();


    const isHomeActive =
        location.pathname === "/" &&
        !currentCategory;


    const isCategoryActive = (
        category: string
    ) =>
        location.pathname === "/categories" &&
        currentCategory === category;


    return (

        <header className="eventnest-header">


            {/* =====================================================
                TOP UTILITY BAR
            ===================================================== */}

            <div className="header-utility">

                <div className="header-container utility-container">


                    {/* LOCATION / CURRENCY */}

                    <div className="utility-left">

                        <button
                            type="button"
                            className="utility-selector"
                        >

                            <FaMapMarkerAlt />

                            <span>
                                India
                            </span>

                            <FaChevronDown />

                        </button>


                        <span className="utility-divider" />


                        <button
                            type="button"
                            className="utility-selector"
                        >

                            <FaRupeeSign />

                            <span>
                                INR
                            </span>

                            <FaChevronDown />

                        </button>

                    </div>


                    {/* CENTER TAGLINE */}

                    <div className="utility-tagline">

                        <span />

                        <em>
                            Celebrate Life's Special Moments
                        </em>

                        <span />

                    </div>


                    {/* RIGHT */}

                    <div className="utility-right">

                        <Link
                            to="/help"
                            className="utility-link"
                        >

                            <FaQuestionCircle />

                            Help

                        </Link>


                        {isAuthenticated && user ? (

                            <>

                                <span className="utility-divider" />


                                {(
                                  user.role === "VENDOR_ADMIN" ||
                                  user.role === "VENDOR_USER"
                                ) && (

                                  <Link
                                    to="/vendor/create-listing"
                                    className="utility-link"
                                  >

                                    <FaStore />

                                    List Your Service

                                  </Link>

                                )}


                                {(
                                  user.role !== "VENDOR_ADMIN" &&
                                  user.role !== "VENDOR_USER"
                                ) && (

                                  <Link
                                    to="/register"
                                    className="utility-link"
                                  >

                                    <FaStore />

                                    List Your Service

                                  </Link>

                                )}


                            </>

                        ) : (

                            <>

                                <span className="utility-divider" />


                                <Link
                                    to="/register"
                                    className="utility-link"
                                >

                                    <FaStore />

                                    List Your Service

                                </Link>

                            </>

                        )}

                    </div>

                </div>

            </div>


            {/* =====================================================
                MAIN HEADER
            ===================================================== */}

            <div className="header-main">

                <div className="header-container main-header-container">


                    {/* BRAND */}

                    <Link
                        to="/"
                        className="eventnest-brand"
                    >

                        <div className="brand-icon">
                            🎉
                        </div>

                        <div className="brand-content">

                            <span className="brand-name">
                                EventNest
                            </span>

                            <span className="brand-tagline">
                                Plan&nbsp; | &nbsp;Book&nbsp; | &nbsp;Celebrate
                            </span>

                        </div>

                    </Link>


                    {/* SEARCH */}

                    <div className="header-search">

                        <div className="search-field search-keyword">

                            <FaSearch />

                            <input
                                type="text"
                                placeholder="Search venues, photographers, makeup artists..."
                            />

                        </div>


                        <div className="search-separator" />


                        <div className="search-field search-location">

                            <FaMapMarkerAlt />

                            <span>
                                Trivandrum
                            </span>

                            <FaChevronDown
                                className="search-chevron"
                            />

                        </div>


                        <div className="search-separator" />


                        <div className="search-field search-date">

                            <FaCalendarAlt />

                            <span>
                                Event Date
                            </span>

                            <FaChevronDown
                                className="search-chevron"
                            />

                        </div>


                        <button
                            type="button"
                            className="header-search-button"
                        >

                            Search

                        </button>

                    </div>


                    {/* ACTIONS */}

                    <div className="header-main-actions">


                        {/* CART */}

                        {isAuthenticated && user && (

                            <button
                                type="button"
                                className="header-action-button cart-action"
                                onClick={() =>
                                    navigate("/cart")
                                }
                                title="Cart"
                            >

                                <FaShoppingCart />

                                {
                                    cartCount > 0 && (

                                        <span className="action-badge cart-badge">

                                            {
                                                cartCount > 99
                                                    ? "99+"
                                                    : cartCount
                                            }

                                        </span>

                                    )
                                }

                            </button>

                        )}


                        {/* NOTIFICATIONS */}

                        {isAuthenticated && user && (

                            <div
                                className="notification-wrapper"
                                ref={notificationRef}
                            >

                                <button
                                    type="button"
                                    className={`header-action-button notification-action ${showNotifications
                                            ? "action-active"
                                            : ""
                                        }`}
                                    onClick={() =>
                                        setShowNotifications(
                                            current =>
                                                !current
                                        )
                                    }
                                    title="Notifications"
                                >

                                    <FaBell />


                                    {
                                        unreadCount > 0 && (

                                            <span className="action-badge notification-badge">

                                                {
                                                    unreadCount > 9
                                                        ? "9+"
                                                        : unreadCount
                                                }

                                            </span>

                                        )
                                    }

                                </button>


                                {/* =================================
                                    NOTIFICATION POPUP
                                ================================= */}

                                {
                                    showNotifications && (

                                        <div className="notification-dropdown">


                                            {/* HEADER */}

                                            <div className="notification-dropdown-header">

                                                <div>

                                                    <h3>
                                                        Notifications
                                                    </h3>

                                                    <span>
                                                        {
                                                            unreadCount > 0
                                                                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                                                                : "You're all caught up"
                                                        }
                                                    </span>

                                                </div>


                                                {
                                                    unreadCount > 0 && (

                                                        <button
                                                            type="button"
                                                            className="mark-all-button"
                                                            onClick={
                                                                handleMarkAllAsRead
                                                            }
                                                        >

                                                            Mark all as read

                                                        </button>

                                                    )
                                                }

                                            </div>


                                            {/* LIST */}

                                            <div className="notification-list">

                                                {
                                                    notifications.length === 0 ? (

                                                        <div className="notification-empty">

                                                            <div className="empty-notification-icon">

                                                                <FaBell />

                                                            </div>

                                                            <strong>
                                                                You're all caught up
                                                            </strong>

                                                            <span>
                                                                No notifications to show right now.
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

                                                                    className={`notification-item ${!notification.read
                                                                            ? "notification-unread"
                                                                            : ""
                                                                        }`}

                                                                    onClick={() =>
                                                                        handleNotificationClick(
                                                                            notification
                                                                        )
                                                                    }
                                                                >


                                                                    <div
                                                                        className={`notification-icon ${getNotificationTypeClass(
                                                                            notification.type
                                                                        )
                                                                            }`}
                                                                    >

                                                                        {
                                                                            getNotificationIcon(
                                                                                notification.type
                                                                            )
                                                                        }

                                                                    </div>


                                                                    <div className="notification-content">

                                                                        <div className="notification-title-row">

                                                                            <strong>
                                                                                {
                                                                                    notification.title
                                                                                }
                                                                            </strong>


                                                                            {
                                                                                !notification.read && (

                                                                                    <span className="unread-dot" />

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

                                                                                <span className="notification-time">

                                                                                    <FaClock />

                                                                                    {
                                                                                        formatNotificationTime(
                                                                                            notification.createdAt
                                                                                        )
                                                                                    }

                                                                                </span>

                                                                            )
                                                                        }

                                                                    </div>


                                                                    <span className="notification-arrow">
                                                                        →
                                                                    </span>

                                                                </button>

                                                            )
                                                        )

                                                    )
                                                }

                                            </div>


                                            {/* FOOTER */}

                                            {
                                                notifications.length > 0 && (

                                                    <div className="notification-footer">

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

                        )}


                        {/* USER */}

                        {isAuthenticated && user ? (

                            <div
                                className="profile-wrapper"
                                ref={profileRef}
                            >

                                <button
                                    type="button"
                                    className={`header-profile ${showProfile
                                            ? "profile-active"
                                            : ""
                                        }`}
                                    onClick={() =>
                                        setShowProfile(
                                            current =>
                                                !current
                                        )
                                    }
                                >

                                    <div className="profile-avatar">

                                        {
                                            avatar
                                        }

                                    </div>


                                    <div className="profile-text">

                                        <strong>
                                            {
                                                user.name ||
                                                "User"
                                            }
                                        </strong>

                                        <span>
                                            {
                                                user.role
                                            }
                                        </span>

                                    </div>


                                    <FaChevronDown
                                        className={
                                            showProfile
                                                ? "profile-chevron-open"
                                                : ""
                                        }
                                    />

                                </button>


                                {
                                    showProfile && (

                                        <div className="profile-dropdown">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowProfile(
                                                        false
                                                    )
                                                }
                                            >

                                                <FaUser />

                                                <div>

                                                    <strong>
                                                        My Profile
                                                    </strong>

                                                    <span>
                                                        View your account
                                                    </span>

                                                </div>

                                            </button>


                                            <div className="profile-divider" />


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowProfile(
                                                        false
                                                    )
                                                }
                                            >

                                                <FaUser />

                                                <div>

                                                    <strong>
                                                        Account
                                                    </strong>

                                                    <span>
                                                        Manage your account
                                                    </span>

                                                </div>

                                            </button>


                                            <div className="profile-divider" />


                                            <button
                                                type="button"
                                                className="profile-logout"
                                                onClick={
                                                    handleLogout
                                                }
                                            >

                                                <FaSignOutAlt />

                                                <div>

                                                    <strong>
                                                        Sign Out
                                                    </strong>

                                                    <span>
                                                        Logout from EventNest
                                                    </span>

                                                </div>

                                            </button>

                                        </div>

                                    )
                                }

                            </div>

                        ) : (

                            <div className="guest-actions">

                                <Link
                                    to="/login"
                                    className="header-login"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="header-register"
                                >
                                    Register
                                </Link>

                            </div>

                        )}


                        {/* DASHBOARD */}

                        {isAuthenticated &&
                          (
                            user?.role === "VENDOR_ADMIN" ||
                            user?.role === "VENDOR_USER"
                          ) && (

                            <Link
                              to="/vendor/dashboard"
                              className="header-dashboard"
                            >
                              Dashboard
                            </Link>

                          )
                        }


                        {isAuthenticated &&
                            user?.role === "ADMIN" && (

                                <Link
                                    to="/admin/dashboard"
                                    className="header-dashboard"
                                >
                                    Dashboard
                                </Link>

                            )
                        }

                    </div>

                </div>

            </div>


            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            <nav className="header-navigation">

                <div className="header-container navigation-container">


                    {/* =================================
                        HOME
                    ================================= */}

                    <Link
                        to="/"
                        className={`navigation-link ${isHomeActive
                                ? "active"
                                : ""
                            }`}
                    >
                        Home
                    </Link>


                    {/* =================================
                        VENUES
                    ================================= */}

                    <Link
                        to="/categories?category=HALL"
                        className={`navigation-link ${isCategoryActive("HALL")
                                ? "active"
                                : ""
                            }`}
                    >
                        Venues
                    </Link>


                    {/* =================================
                        PHOTOGRAPHY
                    ================================= */}

                    <Link
                        to="/categories?category=PHOTOGRAPHY"
                        className={`navigation-link ${isCategoryActive("PHOTOGRAPHY")
                                ? "active"
                                : ""
                            }`}
                    >
                        Photography
                    </Link>


                    {/* =================================
                        MAKEUP
                    ================================= */}

                    <Link
                        to="/categories?category=MAKEUP"
                        className={`navigation-link ${isCategoryActive("MAKEUP")
                                ? "active"
                                : ""
                            }`}
                    >
                        Makeup
                    </Link>


                    {/* =================================
                        CATERING
                    ================================= */}

                    <Link
                        to="/categories?category=CATERING"
                        className={`navigation-link ${isCategoryActive("CATERING")
                                ? "active"
                                : ""
                            }`}
                    >
                        Catering
                    </Link>


                    {/* =================================
                        DECOR
                    ================================= */}

                    <Link
                        to="/categories?category=DECORATION"
                        className={`navigation-link ${isCategoryActive("DECORATION")
                                ? "active"
                                : ""
                            }`}
                    >
                        Decor
                    </Link>


                    {/* =================================
                        MORE
                    ================================= */}

                    <button
                        type="button"
                        className="navigation-more"
                    >

                        More

                        <FaChevronDown />

                    </button>


                    {/* =================================
                        CUSTOMER BOOKINGS
                    ================================= */}

                    {user?.role === "CUSTOMER" && (

                        <Link
                            to="/customer/bookings"
                            className={`navigation-bookings ${location.pathname ===
                                    "/customer/bookings"
                                    ? "active"
                                    : ""
                                }`}
                        >
                            My Bookings
                        </Link>

                    )}

                </div>

            </nav>

        </header>

    );

};


export default Header;