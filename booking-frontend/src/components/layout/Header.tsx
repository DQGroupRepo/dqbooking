import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import {
    FaBell,
    FaCalendarAlt,
    FaChevronDown,
    FaChevronRight,
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
import TagDirectoryService from "../../services/TagDirectoryService";
import type { TagSuggestion } from "../../types/ServiceTag";

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
    const [showHallSubmenu, setShowHallSubmenu] = useState(false);
    const eventHallMenuRef = useRef<HTMLDivElement>(null);

    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedCategorySuggestion, setSelectedCategorySuggestion] = useState("");
    const [categorySuggestions, setCategorySuggestions] = useState<TagSuggestion[]>([]);
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
    const [activeCategorySuggestion, setActiveCategorySuggestion] = useState(-1);
    const categorySuggestionRef = useRef<HTMLDivElement>(null);
    const [selectedSearchLocation, setSelectedSearchLocation] = useState("");
    const [searchLocations, setSearchLocations] = useState<TagSuggestion[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [showSearchLocationMenu, setShowSearchLocationMenu] = useState(false);
    const [activeSearchDistrict, setActiveSearchDistrict] = useState("");
    const searchLocationRef = useRef<HTMLDivElement>(null);

    const searchDistricts = Array.from(
        new Set(searchLocations.map(item => item.district?.trim()).filter((district): district is string => Boolean(district)))
    ).sort((a, b) => a.localeCompare(b));

    const activeDistrictLocations = searchLocations
        .filter(item => item.district?.trim() === activeSearchDistrict && item.name.trim().toLowerCase() !== activeSearchDistrict.trim().toLowerCase())
        .sort((a, b) => a.name.localeCompare(b.name));

    // Close the Event Hall dropdown when the user clicks/taps elsewhere or presses Escape.
    useEffect(() => {
        if (!showHallSubmenu) return;

        const handleOutsidePointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (target instanceof Node && !eventHallMenuRef.current?.contains(target)) {
                setShowHallSubmenu(false);
            }
        };

        const handleEscape = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowHallSubmenu(false);
            }
        };

        document.addEventListener("pointerdown", handleOutsidePointerDown);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutsidePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [showHallSubmenu]);


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
     * SEARCH DIRECTORY
     * =========================================
     */

    useEffect(() => {
        let active = true;

        async function loadSearchLocations() {
            setLocationsLoading(true);
            try {
                const items = await TagDirectoryService.locations("Kerala");
                if (active) {
                    setSearchLocations(items);
                }
            } catch (error) {
                console.error("Failed to load search locations:", error);
                if (active) {
                    setSearchLocations([]);
                }
            } finally {
                if (active) {
                    setLocationsLoading(false);
                }
            }
        }

        loadSearchLocations();

        return () => {
            active = false;
        };
    }, []);

    // Load category suggestions from the master directory while the customer types.
    // Suggestions are only for selection; actual results are still searched against
    // vendor-selected CATEGORY tags by the existing customer search API.
    useEffect(() => {
        const query = searchKeyword.trim();
        if (!query || selectedCategorySuggestion === query) {
            setCategorySuggestions([]);
            setShowCategorySuggestions(false);
            return;
        }

        let active = true;
        const timer = window.setTimeout(async () => {
            try {
                const items = await TagDirectoryService.categorySuggestions(query);
                if (active) {
                    setCategorySuggestions(items.slice(0, 8));
                    setShowCategorySuggestions(items.length > 0);
                    setActiveCategorySuggestion(-1);
                }
            } catch (error) {
                console.error("Failed to load category suggestions:", error);
                if (active) {
                    setCategorySuggestions([]);
                    setShowCategorySuggestions(false);
                }
            }
        }, 300);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [searchKeyword, selectedCategorySuggestion]);

    useEffect(() => {
        function closeCategorySuggestions(event: MouseEvent) {
            if (categorySuggestionRef.current && !categorySuggestionRef.current.contains(event.target as Node)) {
                setShowCategorySuggestions(false);
            }
            if (searchLocationRef.current && !searchLocationRef.current.contains(event.target as Node)) {
                setShowSearchLocationMenu(false);
            }
        }
        document.addEventListener("mousedown", closeCategorySuggestions);
        return () => document.removeEventListener("mousedown", closeCategorySuggestions);
    }, []);

    function chooseCategorySuggestion(item: TagSuggestion) {
        setSearchKeyword(item.name);
        setSelectedCategorySuggestion(item.name);
        setShowCategorySuggestions(false);
        setCategorySuggestions([]);
        setActiveCategorySuggestion(-1);
    }

    function handleCategoryInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown" && categorySuggestions.length > 0) {
            event.preventDefault();
            setShowCategorySuggestions(true);
            setActiveCategorySuggestion(current => (current + 1) % categorySuggestions.length);
        } else if (event.key === "ArrowUp" && categorySuggestions.length > 0) {
            event.preventDefault();
            setActiveCategorySuggestion(current => current <= 0 ? categorySuggestions.length - 1 : current - 1);
        } else if (event.key === "Escape") {
            setShowCategorySuggestions(false);
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (showCategorySuggestions && activeCategorySuggestion >= 0 && categorySuggestions[activeCategorySuggestion]) {
                chooseCategorySuggestion(categorySuggestions[activeCategorySuggestion]);
            } else {
                handleSearch();
            }
        }
    }

    function handleSearch() {
        const params = new URLSearchParams();
        const keyword = (selectedCategorySuggestion || searchKeyword).trim();

        if (keyword) {
            params.set("categoryTag", keyword);
        }

        if (selectedSearchLocation) {
            params.set("location", selectedSearchLocation);
        }

        setShowCategorySuggestions(false);
        navigate(`/categories${params.toString() ? `?${params.toString()}` : ""}`);
    }

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


    useEffect(() => {
        setShowHallSubmenu(false);
    }, [location.pathname, location.search]);

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
                            to="/help-center"
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
                        className="eventnest-brand dq-brand"
                        aria-label="DQBooking.com home"
                    >
                        <img
                            className="dq-brand-logo"
                            src="/images/dq-logo.png"
                            alt=""
                            aria-hidden="true"
                        />
                        <span className="dq-brand-name">DQBOOKING.COM</span>
                        <span className="dq-brand-tagline">PLAN | BOOK | CELEBRATE</span>
                    </Link>


                    {/* SEARCH */}

                    <div className="header-search">

                        <div className="search-field search-keyword" ref={categorySuggestionRef}>

                            <FaSearch />

                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(event) => {
                                    setSearchKeyword(event.target.value);
                                    setSelectedCategorySuggestion("");
                                    setShowCategorySuggestions(true);
                                }}
                                onFocus={() => {
                                    if (categorySuggestions.length > 0 && !selectedCategorySuggestion) {
                                        setShowCategorySuggestions(true);
                                    }
                                }}
                                onKeyDown={handleCategoryInputKeyDown}
                                placeholder="Search categories (e.g. Hall, Convention Hall)..."
                                aria-label="Search by category tag"
                                aria-autocomplete="list"
                                aria-expanded={showCategorySuggestions}
                                aria-controls="header-category-suggestions"
                            />

                            {showCategorySuggestions && categorySuggestions.length > 0 && (
                                <div className="header-category-suggestions" id="header-category-suggestions" role="listbox">
                                    <div className="header-category-suggestions-heading">Suggested categories</div>
                                    {categorySuggestions.map((item, index) => (
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={activeCategorySuggestion === index}
                                            className={`header-category-suggestion ${activeCategorySuggestion === index ? "active" : ""}`}
                                            key={item.id || `${item.parentCategory}-${item.name}`}
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => chooseCategorySuggestion(item)}
                                        >
                                            <FaSearch />
                                            <span>{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                        </div>


                        <div className="search-separator" />


                        <div
                            className={`search-field search-location ${showSearchLocationMenu ? "location-menu-open" : ""}`}
                            ref={searchLocationRef}
                        >
                            <button
                                type="button"
                                className="search-location-trigger"
                                onClick={() => {
                                    if (!showSearchLocationMenu && !activeSearchDistrict && searchDistricts.length > 0) {
                                        setActiveSearchDistrict(searchDistricts[0]);
                                    }
                                    setShowSearchLocationMenu(current => !current);
                                }}
                                aria-label="Choose search location"
                                aria-expanded={showSearchLocationMenu}
                                disabled={locationsLoading}
                            >
                                <FaMapMarkerAlt />
                                <span>{selectedSearchLocation || (locationsLoading ? "Loading..." : "All locations")}</span>
                                <FaChevronDown className="search-chevron" />
                            </button>

                            {showSearchLocationMenu && (
                                <div className="header-location-menu">
                                    <div className="header-location-menu-heading">
                                        <strong>Choose a location</strong>
                                        <span>Select a district, then a specific area</span>
                                    </div>
                                    <button
                                        type="button"
                                        className={`header-location-all ${!selectedSearchLocation ? "selected" : ""}`}
                                        onClick={() => {
                                            setSelectedSearchLocation("");
                                            setShowSearchLocationMenu(false);
                                        }}
                                    >
                                        <FaMapMarkerAlt />
                                        <span>All Kerala locations</span>
                                    </button>
                                    <div className="header-location-menu-body">
                                        <div className="header-location-districts" role="listbox" aria-label="Kerala districts">
                                            {searchDistricts.map(district => (
                                                <button
                                                    type="button"
                                                    key={district}
                                                    className={`header-location-district ${activeSearchDistrict === district ? "active" : ""}`}
                                                    onClick={() => setActiveSearchDistrict(district)}
                                                >
                                                    <span>{district}</span>
                                                    <FaChevronRight />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="header-location-areas">
                                            <div className="header-location-areas-title">
                                                {activeSearchDistrict || "Select a district"}
                                            </div>
                                            {activeDistrictLocations.length > 0 ? activeDistrictLocations.map(item => (
                                                <button
                                                    type="button"
                                                    key={item.id || item.name}
                                                    className={`header-location-area ${selectedSearchLocation === item.name ? "selected" : ""}`}
                                                    onClick={() => {
                                                        setSelectedSearchLocation(item.name);
                                                        setShowSearchLocationMenu(false);
                                                    }}
                                                >
                                                    <span>{item.name}</span>
                                                    {selectedSearchLocation === item.name && <span className="location-selected-mark">Selected</span>}
                                                </button>
                                            )) : (
                                                <div className="header-location-empty">
                                                    {activeSearchDistrict ? "No localities are available for this district yet." : "Choose a district to view its localities."}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


                        <button
                            type="button"
                            className="header-search-button"
                            onClick={handleSearch}
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
                        EVENT HALLS + CATEGORY TAG MENU
                    ================================= */}

                    <div ref={eventHallMenuRef} className={`event-hall-nav-item ${isCategoryActive("HALL") ? "active" : ""}`}>
                        <button
                            type="button"
                            className={`navigation-link event-hall-trigger ${isCategoryActive("HALL") ? "active" : ""}`}
                            aria-haspopup="true"
                            aria-expanded={showHallSubmenu}
                            onClick={() => setShowHallSubmenu(open => !open)}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") setShowHallSubmenu(false);
                            }}
                        >
                            Event Hall
                            <FaChevronDown className={`event-hall-chevron ${showHallSubmenu ? "open" : ""}`} />
                        </button>

                        {showHallSubmenu && (
                            <div className="event-hall-submenu" role="menu" aria-label="Event Hall categories">
                                {[
                                    "All Halls",
                                    "Convention Center",
                                    "Kalyana Mandapam",
                                    "Party Halls",
                                    "Corporate Meeting Halls",
                                    "Banquet Halls",
                                    "Auditoriums"
                                ].map((tag) => (
                                    <Link
                                        key={tag}
                                        role="menuitem"
                                        to={tag === "All Halls"
                                            ? "/categories?category=HALL"
                                            : `/categories?category=HALL&categoryTag=${encodeURIComponent(tag)}`}
                                        onClick={() => setShowHallSubmenu(false)}
                                        className="event-hall-submenu-link"
                                    >
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* =================================
                        STAY
                    ================================= */}

                    <Link
                        to="/categories?category=STAY"
                        className={`navigation-link ${
                            isCategoryActive("STAY") ? "active" : ""
                        }`}
                    >
                        Stay
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
                        Beauty & Makeup
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
                        Decor & Styling
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

