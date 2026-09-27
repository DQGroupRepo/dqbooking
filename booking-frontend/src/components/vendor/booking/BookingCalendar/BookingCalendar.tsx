import {
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import type {
    BookingStats
} from "../../../types/BookingStats";

import styles from "./BookingCalendar.module.css";


interface Props {
    bookings: BookingStats[];
}


/*
 * =========================================
 * DATE HELPERS
 * =========================================
 */

const getDateKey = (
    date: Date
): string => {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const toDateKey = (
    value: string
): string => {

    if (!value) {
        return "";
    }

    /*
     * Handles:
     *
     * 2026-09-22
     * 2026-09-22T10:00:00
     */

    if (
        /^\d{4}-\d{2}-\d{2}/.test(value)
    ) {

        return value.substring(
            0,
            10
        );

    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }

    return getDateKey(date);
};


const formatSelectedDate = (
    date: Date
): string => {

    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};


const formatCurrency = (
    amount: number
): string => {

    return `₹${amount.toLocaleString(
        "en-IN"
    )}`;
};


/*
 * =========================================
 * COMPONENT
 * =========================================
 */

export default function BookingCalendar({
    bookings
}: Props) {

    const navigate =
        useNavigate();


    const today =
        new Date();


    const [
        currentMonth,
        setCurrentMonth
    ] = useState(
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        )
    );


    const [
        selectedDate,
        setSelectedDate
    ] = useState(
        new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        )
    );


    /*
     * =========================================
     * GROUP BOOKINGS BY DATE
     * =========================================
     */

    const bookingsByDate =
        useMemo(() => {

            const grouped:
                Record<
                    string,
                    BookingStats[]
                > = {};


            bookings.forEach(
                booking => {

                    const key =
                        toDateKey(
                            booking.eventDate
                        );


                    if (!key) {
                        return;
                    }


                    if (!grouped[key]) {
                        grouped[key] = [];
                    }


                    grouped[key].push(
                        booking
                    );

                }
            );


            return grouped;

        }, [
            bookings
        ]);


    /*
     * =========================================
     * CALENDAR DAYS
     * =========================================
     */

    const calendarDays =
        useMemo(() => {

            const year =
                currentMonth.getFullYear();

            const month =
                currentMonth.getMonth();


            const firstDay =
                new Date(
                    year,
                    month,
                    1
                );


            const lastDay =
                new Date(
                    year,
                    month + 1,
                    0
                );


            const startingDay =
                firstDay.getDay();


            const totalDays =
                lastDay.getDate();


            const previousMonthLastDay =
                new Date(
                    year,
                    month,
                    0
                ).getDate();


            const days: {
                date: Date;
                currentMonth: boolean;
            }[] = [];


            for (
                let i = startingDay - 1;
                i >= 0;
                i--
            ) {

                days.push({

                    date:
                        new Date(
                            year,
                            month - 1,
                            previousMonthLastDay - i
                        ),

                    currentMonth: false

                });

            }


            for (
                let day = 1;
                day <= totalDays;
                day++
            ) {

                days.push({

                    date:
                        new Date(
                            year,
                            month,
                            day
                        ),

                    currentMonth: true

                });

            }


            let nextDay = 1;


            while (
                days.length % 7 !== 0
            ) {

                days.push({

                    date:
                        new Date(
                            year,
                            month + 1,
                            nextDay
                        ),

                    currentMonth: false

                });


                nextDay++;

            }


            return days;

        }, [
            currentMonth
        ]);


    /*
     * =========================================
     * SELECTED DATE
     * =========================================
     */

    const selectedKey =
        getDateKey(
            selectedDate
        );


    const selectedBookings =
        bookingsByDate[
            selectedKey
        ] ?? [];


    /*
     * =========================================
     * MONTH TITLE
     * =========================================
     */

    const monthTitle =
        currentMonth.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    /*
     * =========================================
     * MONTH NAVIGATION
     * =========================================
     */

    const goPreviousMonth = () => {

        setCurrentMonth(
            current => {

                const next =
                    new Date(
                        current
                    );

                next.setMonth(
                    next.getMonth() - 1
                );

                return next;

            }
        );

    };


    const goNextMonth = () => {

        setCurrentMonth(
            current => {

                const next =
                    new Date(
                        current
                    );

                next.setMonth(
                    next.getMonth() + 1
                );

                return next;

            }
        );

    };


    const goToday = () => {

        const now =
            new Date();


        setCurrentMonth(
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            )
        );


        setSelectedDate(
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            )
        );

    };


    /*
     * =========================================
     * OPEN BOOKING
     * =========================================
     */

    const openBooking = (
        bookingId: string
    ) => {

        navigate(
            `/vendor/bookings/${bookingId}`
        );

    };


    /*
     * =========================================
     * STATUS CLASS
     * =========================================
     */

    const getStatusClass = (
        status: string
    ) => {

        return (
            styles[
                status
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        ""
                    )
            ] ?? ""
        );

    };


    /*
     * =========================================
     * RENDER
     * =========================================
     */

    return (

        <div className={styles.bookingArea}>

            {/* =====================================
                CALENDAR
            ===================================== */}

            <div className={styles.calendarCard}>

                <div className={styles.calendarHeader}>

                    <div>

                        <h2>
                            Booking Calendar
                        </h2>

                        <p>
                            Click a date to view
                            bookings for that day.
                        </p>

                    </div>


                    <div
                        className={
                            styles.calendarActions
                        }
                    >

                        <button
                            type="button"
                            onClick={goToday}
                        >
                            Today
                        </button>


                        <button
                            type="button"
                            onClick={
                                goPreviousMonth
                            }
                            aria-label="Previous month"
                        >
                            ‹
                        </button>


                        <button
                            type="button"
                            onClick={
                                goNextMonth
                            }
                            aria-label="Next month"
                        >
                            ›
                        </button>

                    </div>

                </div>


                <div className={styles.monthTitle}>

                    {monthTitle}

                </div>


                <div className={styles.weekdays}>

                    {
                        [
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat"
                        ].map(day => (

                            <div
                                key={day}
                                className={
                                    styles.weekday
                                }
                            >

                                {day}

                            </div>

                        ))
                    }

                </div>


                <div className={styles.calendarGrid}>

                    {
                        calendarDays.map(
                            ({
                                date,
                                currentMonth
                            }) => {

                                const key =
                                    getDateKey(
                                        date
                                    );


                                const dayBookings =
                                    bookingsByDate[
                                        key
                                    ] ?? [];


                                const isSelected =
                                    key ===
                                    selectedKey;


                                const isToday =
                                    key ===
                                    getDateKey(
                                        today
                                    );


                                const statuses =
                                    [
                                        ...new Set(
                                            dayBookings.map(
                                                booking =>
                                                    booking.status
                                            )
                                        )
                                    ];


                                return (

                                    <button
                                        key={key}
                                        type="button"
                                        className={`
                                            ${styles.dayCell}
                                            ${
                                                !currentMonth
                                                    ? styles.otherMonth
                                                    : ""
                                            }
                                            ${
                                                isSelected
                                                    ? styles.selected
                                                    : ""
                                            }
                                            ${
                                                isToday
                                                    ? styles.today
                                                    : ""
                                            }
                                        `}
                                        onClick={() =>
                                            setSelectedDate(
                                                date
                                            )
                                        }
                                    >

                                        <span
                                            className={
                                                styles.dayNumber
                                            }
                                        >
                                            {
                                                date.getDate()
                                            }
                                        </span>


                                        {
                                            dayBookings.length >
                                                0 && (

                                                <div
                                                    className={
                                                        styles.bookingIndicators
                                                    }
                                                >

                                                    {
                                                        statuses
                                                            .slice(
                                                                0,
                                                                3
                                                            )
                                                            .map(
                                                                status => (

                                                                    <span
                                                                        key={
                                                                            status
                                                                        }
                                                                        className={`
                                                                            ${styles.statusDot}
                                                                            ${getStatusClass(
                                                                                status
                                                                            )}
                                                                        `}
                                                                    />

                                                                )
                                                            )
                                                    }


                                                    <span
                                                        className={
                                                            styles.bookingCount
                                                        }
                                                    >
                                                        {
                                                            dayBookings.length
                                                        }
                                                    </span>

                                                </div>

                                            )
                                        }

                                    </button>

                                );

                            }
                        )
                    }

                </div>


                <div className={styles.legend}>

                    <span>
                        <i
                            className={`${styles.legendDot} ${styles.confirmed}`}
                        />
                        Confirmed
                    </span>

                    <span>
                        <i
                            className={`${styles.legendDot} ${styles.pending}`}
                        />
                        Pending
                    </span>

                    <span>
                        <i
                            className={`${styles.legendDot} ${styles.completed}`}
                        />
                        Completed
                    </span>

                    <span>
                        <i
                            className={`${styles.legendDot} ${styles.cancelled}`}
                        />
                        Cancelled
                    </span>

                </div>

            </div>


            {/* =====================================
                SELECTED DAY BOOKINGS
            ===================================== */}

            <div className={styles.dayBookingsCard}>

                <div className={styles.dayBookingsHeader}>

                    <div>

                        <h2>
                            Bookings on{" "}
                            {formatSelectedDate(
                                selectedDate
                            )}
                        </h2>

                        <p>
                            {selectedBookings.length}{" "}
                            {
                                selectedBookings.length === 1
                                    ? "booking"
                                    : "bookings"
                            }
                        </p>

                    </div>

                </div>


                {
                    selectedBookings.length === 0 ? (

                        <div
                            className={
                                styles.emptyDay
                            }
                        >

                            <div
                                className={
                                    styles.emptyIcon
                                }
                            >
                                📅
                            </div>

                            <h3>
                                No bookings
                            </h3>

                            <p>
                                There are no bookings
                                scheduled for this date.
                            </p>

                        </div>

                    ) : (

                        <div
                            className={
                                styles.dayBookingList
                            }
                        >

                            {
                                selectedBookings.map(
                                    booking => (

                                        <article
                                            key={
                                                booking.id
                                            }
                                            className={
                                                styles.bookingCard
                                            }
                                            onClick={() =>
                                                openBooking(
                                                    booking.id
                                                )
                                            }
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={
                                                event => {

                                                    if (
                                                        event.key ===
                                                            "Enter" ||
                                                        event.key ===
                                                            " "
                                                    ) {

                                                        event.preventDefault();

                                                        openBooking(
                                                            booking.id
                                                        );

                                                    }

                                                }
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.bookingCardTop
                                                }
                                            >

                                                <div>

                                                    <span
                                                        className={
                                                            styles.bookingNumber
                                                        }
                                                    >
                                                        {
                                                            booking.bookingNumber
                                                        }
                                                    </span>

                                                    <h3>
                                                        {
                                                            booking.serviceName
                                                        }
                                                    </h3>

                                                </div>


                                                <span
                                                    className={`
                                                        ${styles.statusBadge}
                                                        ${getStatusClass(
                                                            booking.status
                                                        )}
                                                    `}
                                                >
                                                    {
                                                        booking.status
                                                    }
                                                </span>

                                            </div>


                                            <div
                                                className={
                                                    styles.bookingDetails
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.detailItem
                                                    }
                                                >

                                                    <span>
                                                        Customer
                                                    </span>

                                                    <strong>
                                                        {
                                                            booking.customerName ||
                                                            "Not available"
                                                        }
                                                    </strong>

                                                </div>


                                                <div
                                                    className={
                                                        styles.detailItem
                                                    }
                                                >

                                                    <span>
                                                        Venue
                                                    </span>

                                                    <strong>
                                                        {
                                                            booking.venue ||
                                                            "Not specified"
                                                        }
                                                    </strong>

                                                </div>


                                                <div
                                                    className={
                                                        styles.detailItem
                                                    }
                                                >

                                                    <span>
                                                        Contact
                                                    </span>

                                                    <strong>
                                                        {
                                                            booking.customerPhone ||
                                                            "Not available"
                                                        }
                                                    </strong>

                                                </div>


                                                <div
                                                    className={
                                                        styles.detailItem
                                                    }
                                                >

                                                    <span>
                                                        Guests
                                                    </span>

                                                    <strong>
                                                        {
                                                            booking.guestCount ??
                                                            0
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            <div
                                                className={
                                                    styles.paymentRow
                                                }
                                            >

                                                <div>

                                                    <span>
                                                        Amount
                                                    </span>

                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                booking.amount
                                                            )
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Paid
                                                    </span>

                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                booking.paidAmount
                                                            )
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Payment
                                                    </span>

                                                    <strong
                                                        className={
                                                            styles[
                                                                booking.paymentStatus
                                                                    .toLowerCase()
                                                            ]
                                                        }
                                                    >
                                                        {
                                                            booking.paymentStatus
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            <button
                                                type="button"
                                                className={
                                                    styles.viewButton
                                                }
                                                onClick={
                                                    event => {

                                                        event.stopPropagation();

                                                        openBooking(
                                                            booking.id
                                                        );

                                                    }
                                                }
                                            >
                                                View Booking Summary
                                            </button>

                                        </article>

                                    )
                                )
                            }

                        </div>

                    )
                }

            </div>

        </div>

    );

}