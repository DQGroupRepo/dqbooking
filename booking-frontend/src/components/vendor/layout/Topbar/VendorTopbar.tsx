import {
    FaBell,
    FaSearch,
    FaChevronDown,
    FaUser,
    FaCog,
    FaSignOutAlt,
    FaCalendarCheck,
    FaRupeeSign,
    FaStar,
    FaTimesCircle
} from "react-icons/fa";

import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../../../../context/AuthContext";

import NotificationService
    from "../../../../services/NotificationService";

import type {
    Notification
} from "../../../../types/Notification";

import "./VendorTopbar.css";


export default function VendorTopbar() {

    const {
        user,
        logout
    } = useAuth();

    const navigate = useNavigate();


    const profileRef =
        useRef<HTMLDivElement>(null);


    const notificationRef =
        useRef<HTMLDivElement>(null);


    const [
        profileMenuOpen,
        setProfileMenuOpen
    ] = useState(false);


    const [
        notificationMenuOpen,
        setNotificationMenuOpen
    ] = useState(false);


    const [
        notifications,
        setNotifications
    ] = useState<Notification[]>([]);


    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);


    /*
     * =========================================
     * CURRENT DATE
     * =========================================
     */

    const today =
        new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    /*
     * =========================================
     * VENDOR NAME
     * =========================================
     */

    const vendorName =
        user?.name || "Vendor";


    /*
     * =========================================
     * AVATAR
     * =========================================
     */

    const avatar =
        vendorName
            .split(" ")
            .filter(Boolean)
            .map(
                word =>
                    word[0]
            )
            .join("")
            .substring(
                0,
                2
            )
            .toUpperCase();


    /*
     * =========================================
     * LOAD NOTIFICATIONS
     * =========================================
     */

    useEffect(() => {

        loadNotifications();

    }, []);


    async function loadNotifications() {

        try {

            const data =
                await NotificationService
                    .getNotifications();


            setNotifications(
                data
            );


            setUnreadCount(
                data.filter(
                    notification =>
                        !notification.read
                ).length
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
     * CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
     * =========================================
     */

    useEffect(() => {

        function handleOutsideClick(
            event: MouseEvent
        ) {

            const target =
                event.target as Node;


            if (
                profileRef.current &&
                !profileRef.current.contains(
                    target
                )
            ) {

                setProfileMenuOpen(
                    false
                );

            }


            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    target
                )
            ) {

                setNotificationMenuOpen(
                    false
                );

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
     * SIGN OUT
     * =========================================
     */

    const handleLogout = () => {

        setProfileMenuOpen(
            false
        );

        setNotificationMenuOpen(
            false
        );

        logout();

        navigate(
            "/"
        );

    };


    /*
     * =========================================
     * PROFILE DROPDOWN
     * =========================================
     */

    const toggleProfileMenu = () => {

        setProfileMenuOpen(
            previous =>
                !previous
        );

        setNotificationMenuOpen(
            false
        );

    };


    /*
     * =========================================
     * NOTIFICATION DROPDOWN
     * =========================================
     */

    const toggleNotificationMenu = () => {

        setNotificationMenuOpen(
            previous =>
                !previous
        );

        setProfileMenuOpen(
            false
        );

    };


    /*
     * =========================================
     * FORMAT TIME
     * =========================================
     */

    function formatNotificationTime(
        createdAt?: string
    ): string {

        if (!createdAt) {

            return "";

        }


        const date =
            new Date(
                createdAt
            );


        const now =
            new Date();


        const difference =
            now.getTime() -
            date.getTime();


        const minutes =
            Math.floor(
                difference / 60000
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
                    <FaCalendarCheck />
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


            default:

                return (
                    <FaBell />
                );

        }

    }


    /*
     * =========================================
     * MARK AS READ
     * =========================================
     */

    async function markNotificationAsRead(
        notificationId: string
    ) {

        try {

            await NotificationService
                .markAsRead(
                    notificationId
                );


            setNotifications(
                current =>
                    current.map(
                        notification =>
                            notification.id ===
                            notificationId

                                ? {
                                    ...notification,
                                    read: true
                                }

                                : notification
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
        catch (error) {

            console.error(
                "Failed to mark notification as read:",
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

        if (
            !notification.read
        ) {

            await markNotificationAsRead(
                notification.id
            );

        }


        setNotificationMenuOpen(
            false
        );


        /*
         * Booking related notification.
         */

        if (
            notification.referenceId &&
            (
                notification.type === "BOOKING" ||
                notification.type === "CANCELLED"
            )
        ) {

            navigate(
                `/vendor/bookings/${notification.referenceId}`
            );

        }

    }


    /*
     * =========================================
     * MARK ALL AS READ
     * =========================================
     */

    async function handleMarkAllAsRead() {

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


            setUnreadCount(
                0
            );

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
     * RECENT NOTIFICATIONS
     * =========================================
     *
     * Show only the latest five in the
     * topbar dropdown.
     */

    const recentNotifications =
        notifications.slice(
            0,
            5
        );


    return (

        <header className="vendor-topbar">


            {/* =================================
                LEFT
            ================================= */}

            <div className="topbar-left">

                <h2>
                    Dashboard
                </h2>

                <span>
                    {today}
                </span>

            </div>


            {/* =================================
                CENTER
            ================================= */}

            <div className="topbar-center">

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search bookings, customers..."
                    />

                </div>

            </div>


            {/* =================================
                RIGHT
            ================================= */}

            <div className="topbar-right">


                {/* =================================
                    NOTIFICATIONS
                ================================= */}

                <div
                    className="vendor-notification-wrapper"
                    ref={notificationRef}
                >

                    <button
                        type="button"
                        className={
                            `notification-btn ${
                                notificationMenuOpen
                                    ? "notification-btn-active"
                                    : ""
                            }`
                        }
                        onClick={
                            toggleNotificationMenu
                        }
                        aria-label="Notifications"
                    >

                        <FaBell />


                        {
                            unreadCount > 0 && (

                                <span
                                    className="badge"
                                >
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
                        notificationMenuOpen && (

                            <div className="vendor-notification-dropdown">


                                {/* =================================
                                    HEADER
                                ================================= */}

                                <div className="vendor-notification-header">

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
                                                className="vendor-mark-all"
                                                onClick={
                                                    handleMarkAllAsRead
                                                }
                                            >
                                                Mark all as read
                                            </button>

                                        )
                                    }

                                </div>


                                {/* =================================
                                    LIST
                                ================================= */}

                                <div className="vendor-notification-list">

                                    {
                                        recentNotifications.length ===
                                        0 ? (

                                            <div className="vendor-notification-empty">

                                                <div className="vendor-notification-empty-icon">

                                                    <FaBell />

                                                </div>

                                                <strong>
                                                    You're all caught up
                                                </strong>

                                                <span>
                                                    No notifications to show.
                                                </span>

                                            </div>

                                        ) : (

                                            recentNotifications.map(
                                                notification => (

                                                    <button

                                                        type="button"

                                                        key={
                                                            notification.id
                                                        }

                                                        className={
                                                            `vendor-notification-item ${
                                                                !notification.read
                                                                    ? "unread"
                                                                    : ""
                                                            }`
                                                        }

                                                        onClick={() =>
                                                            handleNotificationClick(
                                                                notification
                                                            )
                                                        }

                                                    >

                                                        <div className="vendor-notification-icon">

                                                            {
                                                                getNotificationIcon(
                                                                    notification.type
                                                                )
                                                            }

                                                        </div>


                                                        <div className="vendor-notification-content">

                                                            <div className="vendor-notification-item-header">

                                                                <strong>

                                                                    {
                                                                        notification.title ||
                                                                        "Notification"
                                                                    }

                                                                </strong>


                                                                {
                                                                    !notification.read && (

                                                                        <span className="vendor-notification-dot" />

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

                                                                    <span className="vendor-notification-time">

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


                                {/* =================================
                                    FOOTER
                                ================================= */}

                                {
                                    notifications.length > 5 && (

                                        <div className="vendor-notification-footer">

                                            <button
                                                type="button"
                                                onClick={() => {

                                                    setNotificationMenuOpen(
                                                        false
                                                    );

                                                    /*
                                                     * Can be connected to
                                                     * a full notification
                                                     * page later.
                                                     */

                                                }}
                                            >
                                                Showing latest 5
                                            </button>

                                        </div>

                                    )
                                }

                            </div>

                        )
                    }

                </div>


                {/* =================================
                    PROFILE
                ================================= */}

                <div
                    className="profile-wrapper"
                    ref={profileRef}
                >

                    <button
                        type="button"
                        className={
                            `profile-box ${
                                profileMenuOpen
                                    ? "profile-box-active"
                                    : ""
                            }`
                        }
                        onClick={
                            toggleProfileMenu
                        }
                    >

                        <div className="avatar">
                            {avatar}
                        </div>

                        <div className="profile-details">

                            <h4>
                                {vendorName}
                            </h4>

                            <span>
                                Vendor
                            </span>

                        </div>

                        <FaChevronDown
                            className={
                                profileMenuOpen
                                    ? "chevron-open"
                                    : ""
                            }
                        />

                    </button>


                    {
                        profileMenuOpen && (

                            <div className="profile-dropdown">


                                {/* Profile */}

                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {

                                        setProfileMenuOpen(
                                            false
                                        );

                                    }}
                                >

                                    <div className="dropdown-icon">
                                        <FaUser />
                                    </div>

                                    <div className="dropdown-content">

                                        <strong>
                                            My Profile
                                        </strong>

                                        <span>
                                            View and edit your profile
                                        </span>

                                    </div>

                                </button>


                                <div className="dropdown-divider" />


                                {/* Settings */}

                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {

                                        setProfileMenuOpen(
                                            false
                                        );

                                    }}
                                >

                                    <div className="dropdown-icon">
                                        <FaCog />
                                    </div>

                                    <div className="dropdown-content">

                                        <strong>
                                            Account Settings
                                        </strong>

                                        <span>
                                            Manage your preferences
                                        </span>

                                    </div>

                                </button>


                                <div className="dropdown-divider" />


                                {/* Sign Out */}

                                <button
                                    type="button"
                                    className="dropdown-item logout-item"
                                    onClick={
                                        handleLogout
                                    }
                                >

                                    <div className="dropdown-icon logout-icon">

                                        <FaSignOutAlt />

                                    </div>

                                    <div className="dropdown-content">

                                        <strong>
                                            Sign Out
                                        </strong>

                                        <span>
                                            Logout from your account
                                        </span>

                                    </div>

                                </button>

                            </div>

                        )

                    }

                </div>

            </div>

        </header>

    );

}