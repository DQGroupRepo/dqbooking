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

        }
        catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );

        }

    }


    const getIcon = (
        type: Notification["type"]
    ) => {

        switch (type) {

            case "BOOKING":
                return (
                    <FaCalendarCheck
                        className={
                            styles.booking
                        }
                    />
                );

            case "PAYMENT":
                return (
                    <FaRupeeSign
                        className={
                            styles.payment
                        }
                    />
                );

            case "REVIEW":
                return (
                    <FaStar
                        className={
                            styles.review
                        }
                    />
                );

            case "CANCELLED":
                return (
                    <FaTimesCircle
                        className={
                            styles.cancelled
                        }
                    />
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
                return "";

        }

    };


    async function handleNotificationClick(
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


    return (

        <DashboardPanel
            title="Notifications"
        >

            <div className={styles.list}>

                {
                    notifications.length ===
                    0 ? (

                        <div
                            className={
                                styles.empty
                            }
                        >
                            No notifications.
                        </div>

                    ) : (

                        notifications.map(
                            notification => (

                                <button
                                    type="button"

                                    key={
                                        notification.id
                                    }

                                    className={`${
                                        styles.item
                                    } ${
                                        !notification.read
                                            ? styles.unread
                                            : ""
                                    }`}

                                    onClick={() =>
                                        handleNotificationClick(
                                            notification
                                        )
                                    }
                                >

                                    <div
                                        className={`${
                                            styles.icon
                                        } ${
                                            getIconBackground(
                                                notification.type
                                            )
                                        }`}
                                    >
                                        {
                                            getIcon(
                                                notification.type
                                            )
                                        }
                                    </div>


                                    <div
                                        className={
                                            styles.details
                                        }
                                    >

                                        <div
                                            className={
                                                styles.title
                                            }
                                        >
                                            {
                                                notification.title
                                            }
                                        </div>


                                        <div
                                            className={
                                                styles.message
                                            }
                                        >
                                            {
                                                notification.message
                                            }
                                        </div>


                                        {
                                            notification.createdAt && (

                                                <span
                                                    className={
                                                        styles.time
                                                    }
                                                >
                                                    {
                                                        new Date(
                                                            notification.createdAt
                                                        ).toLocaleString()
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

        </DashboardPanel>

    );

}