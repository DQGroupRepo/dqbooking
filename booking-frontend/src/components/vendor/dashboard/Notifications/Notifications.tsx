import { useEffect, useState } from "react";

import {
    FaCalendarCheck,
    FaRupeeSign,
    FaStar,
    FaTimesCircle,
    FaBell
} from "react-icons/fa";

import {
    useNavigate
} from "react-router-dom";

import DashboardPanel
    from "../DashboardPanel/DashboardPanel";

import NotificationService
    from "../../../../services/NotificationService";

import type {
    Notification
} from "../../../../types/Notification";

import styles
    from "./Notifications.module.css";


export default function Notifications() {

    const navigate =
        useNavigate();


    const [
        notifications,
        setNotifications
    ] =
        useState<Notification[]>([]);


    const [
        loading,
        setLoading
    ] =
        useState(true);


    useEffect(() => {

        loadNotifications();

    }, []);


    async function loadNotifications() {

        try {

            setLoading(true);


            const data =
                await NotificationService
                    .getNotifications();


            setNotifications(
                data
            );

        }
        catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );

        }
        finally {

            setLoading(false);

        }

    }


    const getIcon = (
        type: Notification["type"]
    ) => {

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

    };


    const getIconBackground = (
        type: Notification["type"]
    ) => {

        switch (type) {

            case "BOOKING":
                return styles.bookingBg;

            case "PAYMENT":
                return styles.paymentBg;

            case "REVIEW":
                return styles.reviewBg;

            case "CANCELLED":
                return styles.cancelledBg;

            default:
                return styles.defaultBg;

        }

    };


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


    async function handleNotificationClick(
        notification: Notification
    ) {

        try {

            if (
                !notification.read
            ) {

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
                                item.id ===
                                notification.id

                                    ? {
                                        ...item,
                                        read: true
                                    }

                                    : item
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


        /*
         * =========================================
         * BOOKING
         * =========================================
         */

        if (
            notification.referenceId &&
            notification.type ===
                "BOOKING"
        ) {

            navigate(
                `/vendor/bookings/${notification.referenceId}`
            );

            return;

        }


        /*
         * =========================================
         * CANCELLED BOOKING
         * =========================================
         */

        if (
            notification.referenceId &&
            notification.type ===
                "CANCELLED"
        ) {

            navigate(
                `/vendor/bookings/${notification.referenceId}`
            );

            return;

        }

    }


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

        }
        catch (error) {

            console.error(
                "Failed to mark all notifications as read:",
                error
            );

        }

    }


    const unreadCount =
        notifications.filter(
            notification =>
                !notification.read
        ).length;


    return (

        <DashboardPanel
            title="Notifications"
        >

            <div
                className={
                    styles.notificationPanel
                }
            >


                {/* =================================
                    HEADER
                ================================= */}

                <div
                    className={
                        styles.header
                    }
                >

                    <div>

                        <h3>
                            Recent Notifications
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
                                className={
                                    styles.markAll
                                }
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
                    CONTENT
                ================================= */}

                {
                    loading ? (

                        <div
                            className={
                                styles.empty
                            }
                        >
                            Loading notifications...
                        </div>

                    ) : notifications.length === 0 ? (

                        <div
                            className={
                                styles.empty
                            }
                        >

                            <div
                                className={
                                    styles.emptyIcon
                                }
                            >
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

                        <div
                            className={
                                styles.list
                            }
                        >

                            {
                                notifications.map(
                                    notification => (

                                        <button

                                            type="button"

                                            key={
                                                notification.id
                                            }

                                            className={

                                                `${styles.item} ${
                                                    !notification.read
                                                        ? styles.unread
                                                        : ""
                                                }`

                                            }

                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification
                                                )
                                            }

                                        >


                                            {/* ICON */}

                                            <div
                                                className={
                                                    `${styles.icon} ${
                                                        getIconBackground(
                                                            notification.type
                                                        )
                                                    }`
                                                }
                                            >

                                                {
                                                    getIcon(
                                                        notification.type
                                                    )
                                                }

                                            </div>


                                            {/* DETAILS */}

                                            <div
                                                className={
                                                    styles.details
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.itemHeader
                                                    }
                                                >

                                                    <strong>
                                                        {
                                                            notification.title
                                                        }
                                                    </strong>


                                                    {
                                                        !notification.read && (

                                                            <span
                                                                className={
                                                                    styles.unreadDot
                                                                }
                                                            />

                                                        )
                                                    }

                                                </div>


                                                <p
                                                    className={
                                                        styles.message
                                                    }
                                                >
                                                    {
                                                        notification.message
                                                    }
                                                </p>


                                                {
                                                    notification.createdAt && (

                                                        <span
                                                            className={
                                                                styles.time
                                                            }
                                                        >

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
                            }

                        </div>

                    )
                }

            </div>

        </DashboardPanel>

    );

}