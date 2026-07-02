import type {

    RevenueSummary,
    MonthlyRevenue,
    PaymentHistory

} from "../types/Revenue";

export const mockRevenueSummary: RevenueSummary = {

    thisMonth: 245000,

    totalRevenue: 1875000,

    pendingPayments: 38000,

    averageBookingValue: 41500

};

export const mockMonthlyRevenue: MonthlyRevenue[] = [

    {

        month: "Jan",

        revenue: 120000

    },

    {

        month: "Feb",

        revenue: 165000

    },

    {

        month: "Mar",

        revenue: 210000

    },

    {

        month: "Apr",

        revenue: 175000

    },

    {

        month: "May",

        revenue: 260000

    },

    {

        month: "Jun",

        revenue: 245000

    }

];

export const mockPaymentHistory: PaymentHistory[] = [

    {

        id: 1,

        bookingNumber: "BK1001",

        customer: "Arun Kumar",

        date: "15 Jul 2026",

        amount: 85000,

        status: "Paid"

    },

    {

        id: 2,

        bookingNumber: "BK1002",

        customer: "Priya",

        date: "17 Jul 2026",

        amount: 45000,

        status: "Pending"

    },

    {

        id: 3,

        bookingNumber: "BK1003",

        customer: "Rahul",

        date: "19 Jul 2026",

        amount: 65000,

        status: "Paid"

    },

    {

        id: 4,

        bookingNumber: "BK1004",

        customer: "Divya",

        date: "22 Jul 2026",

        amount: 38000,

        status: "Refunded"

    }

];