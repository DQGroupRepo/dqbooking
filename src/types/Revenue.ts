export interface RevenueSummary {

    thisMonth: number;

    totalRevenue: number;

    pendingPayments: number;

    averageBookingValue: number;

}

export interface MonthlyRevenue {

    month: string;

    revenue: number;

}

export interface PaymentHistory {

    id: number;

    bookingNumber: string;

    customer: string;

    date: string;

    amount: number;

    status: "Paid" | "Pending" | "Refunded";

}