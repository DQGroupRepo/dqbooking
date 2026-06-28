import type { VendorNotification } from "../types/VendorNotification";

export const mockVendorNotifications: VendorNotification[] = [

    {
        id: 1,
        message: "New booking received from Rahul Sharma",
        type: "booking",
        time: "10 mins ago",
    },

    {
        id: 2,
        message: "Payment of ₹15,000 received",
        type: "payment",
        time: "30 mins ago",
    },

    {
        id: 3,
        message: "A customer left a 5★ review",
        type: "review",
        time: "1 hour ago",
    },

    {
        id: 4,
        message: "One booking has been cancelled",
        type: "cancelled",
        time: "Today",
    },

];