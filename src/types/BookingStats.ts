export interface BookingStats {

    id: number;

    bookingNumber: string;

    customerName: string;

    customerPhone: string;

    customerEmail: string;

    serviceName: string;

    venue: string;

    eventDate: string;

    guestCount: number;

    amount: number;

    paidAmount: number;

    notes: string;

    status:
        | "Pending"
        | "Upcoming"
        | "Confirmed"
        | "Completed"
        | "Cancelled";
}