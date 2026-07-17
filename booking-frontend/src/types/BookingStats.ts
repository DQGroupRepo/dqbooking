export interface BookingStats {

    id: string;

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

     paymentStatus:
            | "Pending"
            | "Paid"
            | "Refunded";


    notes: string;

    status:
        | "Pending"
        | "Upcoming"
        | "Confirmed"
        | "Completed"
        | "Cancelled";
}