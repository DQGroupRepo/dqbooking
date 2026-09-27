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

    bookingNumber: string;

    customerName: string;

    serviceName: string;

    totalAmount: number;

    paidAmount: number;

    paymentStatus: string;

    eventDate: string;

}
