import {
    useEffect,
    useMemo,
    useState
} from "react";
import type { FormEvent } from "react";

import {
    useNavigate
} from "react-router-dom";

import type {
    BookingStats
} from "../../../../types/BookingStats";

import VendorServiceService from "../../../../services/VendorServiceService";
import VendorEnquiryService from "../../../../services/VendorEnquiryService";
import type { VendorService } from "../../../../types/VendorService";
import type {
    CreateVendorEnquiryRequest,
    VendorEnquiry
} from "../../../../types/VendorEnquiry";

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

    const [showEnquiryForm, setShowEnquiryForm] = useState(false);
    const [showBookServiceModal, setShowBookServiceModal] = useState(false);
    const [selectedBookServiceId, setSelectedBookServiceId] = useState("");
    const [bookServiceError, setBookServiceError] = useState("");
    const [indiaClockNow, setIndiaClockNow] = useState(() => new Date());
    const [vendorServices, setVendorServices] = useState<VendorService[]>([]);
    const [enquiries, setEnquiries] = useState<VendorEnquiry[]>([]);
    const [enquiriesLoading, setEnquiriesLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [enquirySaving, setEnquirySaving] = useState(false);
    const [enquiryError, setEnquiryError] = useState("");
    const [enquiryForm, setEnquiryForm] = useState({
        customerName: "",
        contactNumber: "",
        serviceId: "",
        notes: "",
        followUpDate: ""
    });

    useEffect(() => {
        const timer = window.setInterval(() => setIndiaClockNow(new Date()), 30_000);
        return () => window.clearInterval(timer);
    }, []);

    const getEarliestFollowUpDate = () => {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            hourCycle: "h23"
        }).formatToParts(indiaClockNow);

        const value = (type: string) =>
            Number(parts.find(part => part.type === type)?.value ?? 0);

        const year = value("year");
        const month = value("month");
        const day = value("day") + (value("hour") >= 13 ? 1 : 0);
        const earliest = new Date(Date.UTC(year, month - 1, day));

        return [
            earliest.getUTCFullYear(),
            String(earliest.getUTCMonth() + 1).padStart(2, "0"),
            String(earliest.getUTCDate()).padStart(2, "0")
        ].join("-");
    };

    useEffect(() => {
        let cancelled = false;
        setEnquiriesLoading(true);

        VendorEnquiryService.getByEventDate(getDateKey(selectedDate))
            .then(data => {
                if (!cancelled) setEnquiries(data);
            })
            .catch(error => {
                console.error("Failed to load vendor enquiries:", error);
                if (!cancelled) setEnquiries([]);
            })
            .finally(() => {
                if (!cancelled) setEnquiriesLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedDate]);

    useEffect(() => {
        if (!showEnquiryForm && !showBookServiceModal) return;

        let cancelled = false;
        setServicesLoading(true);
        setEnquiryError("");

        VendorServiceService.getServices()
            .then(data => {
                if (cancelled) return;
                const available = data.filter(service => service.active);
                setVendorServices(available);
                setEnquiryForm(current => ({
                    ...current,
                    serviceId: current.serviceId || available[0]?.id || ""
                }));
                setSelectedBookServiceId(current => current || available[0]?.id || "");
            })
            .catch(error => {
                console.error("Failed to load vendor services:", error);
                if (!cancelled) {
                    setVendorServices([]);
                    setEnquiryError("Unable to load your services. Please try again.");
                    setBookServiceError("Unable to load your services. Please try again.");
                }
            })
            .finally(() => {
                if (!cancelled) setServicesLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [showEnquiryForm, showBookServiceModal]);

    const openBookServiceModal = () => {
        setBookServiceError("");
        setSelectedBookServiceId(vendorServices[0]?.id || "");
        setShowBookServiceModal(true);
    };

    const continueToServiceBooking = () => {
        if (!selectedBookServiceId) {
            setBookServiceError("Please select one of your services.");
            return;
        }

        setShowBookServiceModal(false);
        navigate(`/vendor/${selectedBookServiceId}`, {
            state: {
                vendorCalendarEventDate: getDateKey(selectedDate),
                fromVendorCalendar: true
            }
        });
    };

    const openEnquiryForm = () => {
        setEnquiryError("");
        setEnquiryForm({
            customerName: "",
            contactNumber: "",
            serviceId: "",
            notes: "",
            followUpDate: ""
        });
        setShowEnquiryForm(true);
    };

    const handleCreateEnquiry = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setEnquiryError("");

        if (!enquiryForm.serviceId) {
            setEnquiryError("Please select one of your services.");
            return;
        }

        const payload: CreateVendorEnquiryRequest = {
            customerName: enquiryForm.customerName.trim(),
            contactNumber: enquiryForm.contactNumber.trim(),
            serviceId: enquiryForm.serviceId,
            eventDate: getDateKey(selectedDate),
            notes: enquiryForm.notes.trim(),
            ...(enquiryForm.followUpDate
                ? { followUpDate: enquiryForm.followUpDate }
                : {})
        };

        setEnquirySaving(true);
        try {
            await VendorEnquiryService.create(payload);
            const updated = await VendorEnquiryService.getByEventDate(getDateKey(selectedDate));
            setEnquiries(updated);
            setShowEnquiryForm(false);
        } catch (error: unknown) {
            console.error("Failed to create vendor enquiry:", error);
            const responseMessage =
                typeof error === "object" && error !== null && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            setEnquiryError(responseMessage || "Unable to save the enquiry. Please check the details and try again.");
        } finally {
            setEnquirySaving(false);
        }
    };


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


            bookings.forEach(booking => {
                const isStay =
                    String(booking.serviceCategory ?? "").toUpperCase() === "STAY" ||
                    String(booking.serviceCategory ?? "").toUpperCase() === "STAYS" ||
                    String(booking.bookingType ?? "").toUpperCase() === "ROOM_STAY";

                const fromKey = toDateKey(booking.bookingFrom ?? "");
                const toKey = toDateKey(booking.bookingTo ?? "");

                // STAY occupies calendar display dates inclusively, including
                // checkout. Inventory validation separately excludes checkout.
                if (isStay && fromKey && toKey) {
                    const [fy, fm, fd] = fromKey.split("-").map(Number);
                    const [ty, tm, td] = toKey.split("-").map(Number);
                    const cursor = new Date(fy, fm - 1, fd);
                    const last = new Date(ty, tm - 1, td);
                    while (cursor <= last) {
                        const key = getDateKey(cursor);
                        (grouped[key] ??= []).push(booking);
                        cursor.setDate(cursor.getDate() + 1);
                    }
                    return;
                }

                // Preserve the existing eventDate grouping for all other
                // categories; bookingFrom is only a compatibility fallback.
                const key = toDateKey(booking.eventDate || booking.bookingFrom || "");
                if (key) (grouped[key] ??= []).push(booking);
            });


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
                            onClick={openEnquiryForm}
                        >
                            + Add Enquiry
                        </button>

                        <button
                            type="button"
                            onClick={openBookServiceModal}
                            className={styles.bookServiceButton}
                        >
                            + Book
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

                <section className={styles.enquirySection}>
                    <div className={styles.enquirySectionHeader}>
                        <div>
                            <h3>Enquiries on this date</h3>
                            <p>
                                {enquiriesLoading
                                    ? "Loading enquiries..."
                                    : `${enquiries.length} ${enquiries.length === 1 ? "enquiry" : "enquiries"}`}
                            </p>
                        </div>
                        <button type="button" onClick={openEnquiryForm}>
                            + Add
                        </button>
                    </div>

                    {!enquiriesLoading && enquiries.length === 0 ? (
                        <p className={styles.noEnquiries}>
                            No enquiries recorded for this event date.
                        </p>
                    ) : (
                        <div className={styles.enquiryList}>
                            {enquiries.map(enquiry => (
                                <article key={enquiry.id} className={styles.enquiryCard}>
                                    <div className={styles.enquiryCardTop}>
                                        <strong>{enquiry.customerName}</strong>
                                        <span>{enquiry.serviceName}</span>
                                    </div>
                                    <div className={styles.enquiryContact}>
                                        {enquiry.contactNumber}
                                    </div>
                                    {enquiry.notes && (
                                        <p className={styles.enquiryNotes}>{enquiry.notes}</p>
                                    )}
                                    {enquiry.followUpDate && (
                                        <div className={styles.followUpLabel}>
                                            Follow-up: {new Date(`${enquiry.followUpDate}T00:00:00`).toLocaleDateString("en-IN")}
                                            {enquiry.reminderSentAt ? " · Reminder sent" : " · Reminder pending"}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

            </div>

            {showBookServiceModal && (
                <div
                    className={styles.enquiryModalBackdrop}
                    role="presentation"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget) {
                            setShowBookServiceModal(false);
                        }
                    }}
                >
                    <section
                        className={styles.enquiryModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="book-service-modal-title"
                    >
                        <div className={styles.enquiryModalHeader}>
                            <div>
                                <h2 id="book-service-modal-title">Create a Booking</h2>
                                <p>Select one of your services for {formatSelectedDate(selectedDate)}.</p>
                            </div>
                            <button
                                type="button"
                                className={styles.enquiryClose}
                                onClick={() => setShowBookServiceModal(false)}
                                aria-label="Close service selection"
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.enquiryFormGrid}>
                            <label className={styles.fullWidth}>
                                Your services
                                <select
                                    value={selectedBookServiceId}
                                    onChange={event => {
                                        setSelectedBookServiceId(event.target.value);
                                        setBookServiceError("");
                                    }}
                                    disabled={servicesLoading || vendorServices.length === 0}
                                >
                                    <option value="">
                                        {servicesLoading ? "Loading your services..." : "Select a service"}
                                    </option>
                                    {vendorServices.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.serviceName}
                                        </option>
                                    ))}
                                </select>
                                {!servicesLoading && vendorServices.length === 0 && (
                                    <small>No active services are available in your vendor account.</small>
                                )}
                            </label>
                        </div>

                        {bookServiceError && (
                            <div className={styles.enquiryError} role="alert">{bookServiceError}</div>
                        )}

                        <div className={styles.enquiryModalActions}>
                            <button
                                type="button"
                                className={styles.enquiryCancelButton}
                                onClick={() => setShowBookServiceModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.enquirySaveButton}
                                onClick={continueToServiceBooking}
                                disabled={servicesLoading || vendorServices.length === 0}
                            >
                                Continue to Booking
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {showEnquiryForm && (
                <div
                    className={styles.enquiryModalBackdrop}
                    role="presentation"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget) {
                            setShowEnquiryForm(false);
                        }
                    }}
                >
                    <section
                        className={styles.enquiryModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="enquiry-modal-title"
                    >
                        <div className={styles.enquiryModalHeader}>
                            <div>
                                <h2 id="enquiry-modal-title">Add Customer Enquiry</h2>
                                <p>Record an enquiry for {formatSelectedDate(selectedDate)}.</p>
                            </div>
                            <button
                                type="button"
                                className={styles.enquiryClose}
                                onClick={() => setShowEnquiryForm(false)}
                                aria-label="Close enquiry form"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateEnquiry}>
                            <div className={styles.enquiryFormGrid}>
                                <label>
                                    Customer name
                                    <input
                                        required
                                        maxLength={120}
                                        value={enquiryForm.customerName}
                                        onChange={event => setEnquiryForm(current => ({
                                            ...current,
                                            customerName: event.target.value
                                        }))}
                                        placeholder="Enter customer name"
                                    />
                                </label>

                                <label>
                                    Contact number
                                    <input
                                        required
                                        minLength={7}
                                        maxLength={20}
                                        value={enquiryForm.contactNumber}
                                        onChange={event => setEnquiryForm(current => ({
                                            ...current,
                                            contactNumber: event.target.value
                                        }))}
                                        placeholder="Enter contact number"
                                    />
                                </label>

                                <label className={styles.fullWidth}>
                                    Service
                                    <select
                                        required
                                        value={enquiryForm.serviceId}
                                        onChange={event => setEnquiryForm(current => ({
                                            ...current,
                                            serviceId: event.target.value
                                        }))}
                                        disabled={servicesLoading || vendorServices.length === 0}
                                    >
                                        <option value="">
                                            {servicesLoading ? "Loading your services..." : "Select a service"}
                                        </option>
                                        {vendorServices.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.serviceName}
                                            </option>
                                        ))}
                                    </select>
                                    {!servicesLoading && vendorServices.length === 0 && (
                                        <small>No active services are available in your vendor account.</small>
                                    )}
                                </label>

                                <label>
                                    Event date
                                    <input
                                        type="date"
                                        value={getDateKey(selectedDate)}
                                        readOnly
                                    />
                                </label>

                                <label>
                                    Follow-up date <span>(optional)</span>
                                    <input
                                        type="date"
                                        min={getEarliestFollowUpDate()}
                                        value={enquiryForm.followUpDate}
                                        onChange={event => setEnquiryForm(current => ({
                                            ...current,
                                            followUpDate: event.target.value
                                        }))}
                                    />
                                    <small>
                                        Reminders are sent at 5:00 AM or 1:00 PM, whichever is the next scheduled run.
                                    </small>
                                </label>

                                <label className={styles.fullWidth}>
                                    Notes <span>(optional)</span>
                                    <textarea
                                        rows={4}
                                        maxLength={2000}
                                        value={enquiryForm.notes}
                                        onChange={event => setEnquiryForm(current => ({
                                            ...current,
                                            notes: event.target.value
                                        }))}
                                        placeholder="Add enquiry details or discussion notes..."
                                    />
                                </label>
                            </div>

                            {enquiryError && (
                                <div className={styles.enquiryError} role="alert">
                                    {enquiryError}
                                </div>
                            )}

                            <div className={styles.enquiryModalActions}>
                                <button
                                    type="button"
                                    className={styles.enquiryCancelButton}
                                    onClick={() => setShowEnquiryForm(false)}
                                    disabled={enquirySaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.enquirySaveButton}
                                    disabled={enquirySaving || servicesLoading || vendorServices.length === 0}
                                >
                                    {enquirySaving ? "Saving..." : "Save Enquiry"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

        </div>

    );

}