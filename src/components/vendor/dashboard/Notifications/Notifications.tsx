import { useEffect, useState } from "react";

import {
    FaCalendarCheck,
    FaRupeeSign,
    FaStar,
    FaTimesCircle
} from "react-icons/fa";

import DashboardPanel from "../DashboardPanel/DashboardPanel";

import VendorNotificationService from "../../../../services/VendorNotificationService";

import type { VendorNotification } from "../../../../types/VendorNotification";

import styles from "./Notifications.module.css";

export default function Notifications() {

    const [notifications, setNotifications] = useState<VendorNotification[]>([]);

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {

        const data =
            await VendorNotificationService.getNotifications();

        setNotifications(data);

    }

    const getIcon = (type: string) => {

        switch (type) {

            case "booking":
                return <FaCalendarCheck className={styles.booking} />;

            case "payment":
                return <FaRupeeSign className={styles.payment} />;

            case "review":
                return <FaStar className={styles.review} />;

            case "cancelled":
                return <FaTimesCircle className={styles.cancelled} />;

            default:
                return null;

        }

    };

    const getIconBackground = (type: string) => {

        switch (type) {

            case "booking":
                return styles.bookingBg;

            case "payment":
                return styles.paymentBg;

            case "review":
                return styles.reviewBg;

            case "cancelled":
                return styles.cancelledBg;

            default:
                return "";
        }

    };

    return (

        <DashboardPanel title="Notifications">

            <div className={styles.list}>

                {notifications.map(notification => (

                    <div
                        key={notification.id}
                        className={styles.item}
                    >

                        <div className={`${styles.icon} ${getIconBackground(notification.type)}`}>
                            {getIcon(notification.type)}
                        </div>

                        <div className={styles.details}>

                            <div className={styles.message}>
                                {notification.message}
                            </div>

                            <span className={styles.time}>
                                {notification.time}
                            </span>

                        </div>

                    </div>

                ))}

            </div>

        </DashboardPanel>

    );

}