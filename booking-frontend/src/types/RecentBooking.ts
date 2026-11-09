export interface RecentBooking {

    bookingId: string;

    customerName: string;

    serviceName: string;

    eventDate: string;

    status:
        | "PENDING"
        | "CONFIRMED"
        | "COMPLETED"
        | "CANCELLED";

    amount: number;

}
