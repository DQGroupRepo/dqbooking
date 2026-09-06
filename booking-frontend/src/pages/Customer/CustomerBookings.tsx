import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import CustomerBookingService
    from "../../services/CustomerBookingService";

import type {
    Booking
} from "../../types/Booking";

import BookingCard
    from "../../components/customer/CustomerBookingCard";

import "./CustomerBookings.css";


type BookingFilter =
    | "ALL"
    | "UPCOMING"
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED";


const CustomerBookings = () => {

    const navigate =
        useNavigate();


    const [
        bookings,
        setBookings
    ] =
        useState<Booking[]>(
            []
        );


    const [
        loading,
        setLoading
    ] =
        useState(
            true
        );


    const [
        activeFilter,
        setActiveFilter
    ] =
        useState<BookingFilter>(
            "ALL"
        );


    const [
        search,
        setSearch
    ] =
        useState(
            ""
        );


    const [
        category,
        setCategory
    ] =
        useState(
            "ALL"
        );


    const [
        location,
        setLocation
    ] =
        useState(
            "ALL"
        );


    const [
        sortOrder,
        setSortOrder
    ] =
        useState(
            "NEWEST"
        );


    /*
     * =========================================
     * LOAD BOOKINGS
     * =========================================
     */

    useEffect(() => {

        loadBookings();

    }, []);


    async function loadBookings() {

        try {

            setLoading(
                true
            );


            const response =
                await CustomerBookingService
                    .getBookings();


            setBookings(
                response
            );

        }

        catch (
            error
        ) {

            console.error(
                "Failed to load bookings:",
                error
            );

        }

        finally {

            setLoading(
                false
            );

        }

    }


    /*
     * =========================================
     * STATUS COUNTS
     * =========================================
     */

    const getCount = (
        filter:
            BookingFilter
    ) => {

        if (
            filter === "ALL"
        ) {

            return bookings.length;

        }


        if (
            filter === "UPCOMING"
        ) {

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            return bookings.filter(
                booking =>
                    booking.eventDate >=
                    today
            ).length;

        }


        return bookings.filter(
            booking =>
                booking.status ===
                filter
        ).length;

    };


    /*
     * =========================================
     * GROUP BOOKINGS
     * =========================================
     */

    const groupedBookings =
        useMemo(
            () => {

                const groups:
                    Record<
                        string,
                        Booking[]
                    > = {};


                bookings.forEach(
                    booking => {

                        const groupId =
                            booking.bookingGroupId ||
                            booking.id;


                        if (
                            !groups[groupId]
                        ) {

                            groups[groupId] =
                                [];

                        }


                        groups[groupId].push(
                            booking
                        );

                    }
                );


                return groups;

            },
            [
                bookings
            ]
        );


    /*
     * =========================================
     * FILTER GROUPS
     * =========================================
     */

    const filteredGroups =
        useMemo(
            () => {

                let groups =
                    Object.entries(
                        groupedBookings
                    );


                /*
                 * STATUS
                 */

                groups =
                    groups.filter(
                        (
                            [
                                ,
                                groupBookings
                            ]
                        ) => {

                            if (
                                activeFilter ===
                                "ALL"
                            ) {

                                return true;

                            }


                            if (
                                activeFilter ===
                                "UPCOMING"
                            ) {

                                const today =
                                    new Date()
                                        .toISOString()
                                        .split(
                                            "T"
                                        )[0];


                                return groupBookings.some(
                                    booking =>
                                        booking.eventDate >=
                                        today
                                );

                            }


                            return groupBookings.some(
                                booking =>
                                    booking.status ===
                                    activeFilter
                            );

                        }
                    );


                /*
                 * SEARCH
                 */

                if (
                    search.trim()
                ) {

                    const searchValue =
                        search
                            .toLowerCase()
                            .trim();


                    groups =
                        groups.filter(
                            (
                                [
                                    groupId,
                                    groupBookings
                                ]
                            ) =>
                                groupId
                                    .toLowerCase()
                                    .includes(
                                        searchValue
                                    )
                                ||
                                groupBookings.some(
                                    booking =>
                                        booking.serviceName
                                            .toLowerCase()
                                            .includes(
                                                searchValue
                                            )
                                        ||
                                        booking.bookingNumber
                                            .toLowerCase()
                                            .includes(
                                                searchValue
                                            )
                                )
                        );

                }


                /*
                 * CATEGORY
                 */

                if (
                    category !==
                    "ALL"
                ) {

                    groups =
                        groups.filter(
                            (
                                [
                                    ,
                                    groupBookings
                                ]
                            ) =>
                                groupBookings.some(
                                    booking =>
                                        booking.serviceCategory ===
                                        category
                                )
                        );

                }


                /*
                 * LOCATION
                 */

                if (
                    location !==
                    "ALL"
                ) {

                    groups =
                        groups.filter(
                            (
                                [
                                    ,
                                    groupBookings
                                ]
                            ) =>
                                groupBookings.some(
                                    booking =>
                                        booking.venue ===
                                        location
                                )
                        );

                }


                /*
                 * SORT
                 */

                groups.sort(
                    (
                        [
                            ,
                            groupA
                        ],
                        [
                            ,
                            groupB
                        ]
                    ) => {

                        const dateA =
                            new Date(
                                groupA[0]
                                    .eventDate
                            ).getTime();


                        const dateB =
                            new Date(
                                groupB[0]
                                    .eventDate
                            ).getTime();


                        return sortOrder ===
                            "NEWEST"

                            ? dateB - dateA

                            : dateA - dateB;

                    }
                );


                return groups;

            },
            [
                groupedBookings,
                activeFilter,
                search,
                category,
                location,
                sortOrder
            ]
        );


    /*
     * =========================================
     * FILTER OPTIONS
     * =========================================
     */

    const categories =
        Array.from(
            new Set(
                bookings
                    .map(
                        booking =>
                            booking.serviceCategory
                    )
                    .filter(
                        Boolean
                    )
            )
        );


    const locations =
        Array.from(
            new Set(
                bookings
                    .map(
                        booking =>
                            booking.venue
                    )
                    .filter(
                        Boolean
                    )
            )
        );


    if (
        loading
    ) {

        return (

            <div className="customer-bookings-page">

                Loading bookings...

            </div>

        );

    }


    return (

        <div className="customer-bookings-page">


            {/* =========================================
                HEADER
               ========================================= */}

            <div className="customer-bookings-header">

                <div className="customer-bookings-title">

                    <h1>

                        My Bookings

                    </h1>


                    <p>

                        Manage and track all your
                        event bookings in one place.

                    </p>

                </div>


                <button
                    type="button"
                    className="customer-new-booking-button"
                    onClick={() =>
                        navigate(
                            "/"
                        )
                    }
                >

                    + New Booking

                </button>

            </div>


            {/* =========================================
                FILTER PANEL
               ========================================= */}

            <div className="customer-bookings-filter-panel">


                {/* TABS */}

                <div className="customer-booking-tabs">

                    {
                        (
                            [
                                "ALL",
                                "UPCOMING",
                                "PENDING",
                                "CONFIRMED",
                                "COMPLETED",
                                "CANCELLED"
                            ] as BookingFilter[]
                        ).map(
                            filter => (

                                <button
                                    key={
                                        filter
                                    }
                                    type="button"
                                    className={
                                        `
                                        customer-booking-tab
                                        ${
                                            activeFilter ===
                                            filter
                                                ? "active"
                                                : ""
                                        }
                                        `
                                    }
                                    onClick={() =>
                                        setActiveFilter(
                                            filter
                                        )
                                    }
                                >

                                    {
                                        filter ===
                                        "ALL"

                                            ? `All (${getCount("ALL")})`

                                            : filter ===
                                            "UPCOMING"

                                            ? `Upcoming (${getCount("UPCOMING")})`

                                            : `${filter.charAt(0)}${filter
                                                .slice(1)
                                                .toLowerCase()} (${getCount(filter)})`
                                    }

                                </button>

                            )
                        )
                    }

                </div>


                {/* FILTERS */}

                <div className="customer-booking-filters">


                    <input
                        type="text"
                        className="customer-booking-search"
                        placeholder="Search by service, vendor or booking number..."
                        value={
                            search
                        }
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                    />


                    <select
                        className="customer-booking-select"
                        value={
                            category
                        }
                        onChange={
                            event =>
                                setCategory(
                                    event.target.value
                                )
                        }
                    >

                        <option value="ALL">

                            All Categories

                        </option>


                        {
                            categories.map(
                                item => (

                                    <option
                                        key={
                                            item
                                        }
                                        value={
                                            item
                                        }
                                    >

                                        {
                                            item
                                        }

                                    </option>

                                )
                            )
                        }

                    </select>


                    <select
                        className="customer-booking-select"
                        value={
                            location
                        }
                        onChange={
                            event =>
                                setLocation(
                                    event.target.value
                                )
                        }
                    >

                        <option value="ALL">

                            All Locations

                        </option>


                        {
                            locations.map(
                                item => (

                                    <option
                                        key={
                                            item
                                        }
                                        value={
                                            item
                                        }
                                    >

                                        {
                                            item
                                        }

                                    </option>

                                )
                            )
                        }

                    </select>


                    <select
                        className="customer-booking-select"
                        value={
                            sortOrder
                        }
                        onChange={
                            event =>
                                setSortOrder(
                                    event.target.value
                                )
                        }
                    >

                        <option value="NEWEST">

                            Newest First

                        </option>

                        <option value="OLDEST">

                            Oldest First

                        </option>

                    </select>


                </div>

            </div>


            {/* =========================================
                RESULTS
               ========================================= */}

            <div className="customer-bookings-results-info">

                <strong>

                    {
                        filteredGroups.length
                    }

                </strong>

                {" "}

                booking group
                {
                    filteredGroups.length !== 1
                        ? "s"
                        : ""
                }

                {" "}

                found

            </div>


            {
                filteredGroups.length === 0

                    ? (

                        <div className="customer-bookings-empty">

                            No bookings found.

                        </div>

                    )

                    : (

                        filteredGroups.map(
                            (
                                [
                                    groupId,
                                    groupBookings
                                ]
                            ) => (

                                <BookingCard
                                    key={
                                        groupId
                                    }

                                    bookingGroupId={
                                        groupId
                                    }

                                    bookings={
                                        groupBookings
                                    }

                                />

                            )
                        )

                    )
            }


        </div>

    );

};


export default CustomerBookings;