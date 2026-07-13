import type { BookingStats } from "../types/BookingStats";

export const mockBookingStats: BookingStats[] = [

    {
        id: 1,
        bookingNumber: "BK-1001",

        customerName: "Rahul Sharma",
        customerPhone: "+91 9876543210",
        customerEmail: "rahul@gmail.com",

        serviceName: "Royal Palace Hall",
        venue: "Royal Palace Convention Centre, Chennai",

        eventDate: "15 Jul 2026",

        guestCount: 350,

        amount: 85000,
        paidAmount: 25000,

        notes:
            "Customer requested flower decoration near the stage and additional parking space.",

        status: "Pending"
    },

    {
        id: 2,
        bookingNumber: "BK-1002",

        customerName: "Priya Nair",
        customerPhone: "+91 9123456780",
        customerEmail: "priya@gmail.com",

        serviceName: "Elite Photography",
        venue: "Green Meadows Resort",

        eventDate: "20 Jul 2026",

        guestCount: 180,

        amount: 35000,
        paidAmount: 35000,

        notes:
            "Need candid photography and drone coverage.",

        status: "Confirmed"
    },

    {
        id: 3,
        bookingNumber: "BK-1003",

        customerName: "Arjun Kumar",
        customerPhone: "+91 9988776655",
        customerEmail: "arjun@gmail.com",

        serviceName: "Classic Catering",
        venue: "VGP Golden Beach",

        eventDate: "25 Jul 2026",

        guestCount: 500,

        amount: 65000,
        paidAmount: 65000,

        notes:
            "Pure vegetarian menu with live dosa counter.",

        status: "Completed"
    },

    {
        id: 4,
        bookingNumber: "BK-1004",

        customerName: "Sneha Joseph",
        customerPhone: "+91 9345678901",
        customerEmail: "sneha@gmail.com",

        serviceName: "Luxury Decoration",
        venue: "Leela Palace",

        eventDate: "30 Jul 2026",

        guestCount: 250,

        amount: 42000,
        paidAmount: 10000,

        notes:
            "Customer cancelled due to venue change.",

        status: "Cancelled"
    },

    {
        id: 5,
        bookingNumber: "BK-1005",

        customerName: "Ajay Menon",
        customerPhone: "+91 9786543210",
        customerEmail: "ajay@gmail.com",

        serviceName: "Grand Wedding Hall",
        venue: "MRC Nagar",

        eventDate: "12 Aug 2026",

        guestCount: 700,

        amount: 150000,
        paidAmount: 50000,

        notes:
            "Need separate dining arrangement for VIP guests.",

        status: "Upcoming"
    }

];