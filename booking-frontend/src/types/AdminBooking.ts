export interface AdminBooking {
    id: string;
    bookingNumber: string;

    customerId: string;
    customerName: string;
    customerEmail: string;

    vendorId: string;

    serviceId: string;
    serviceName: string;

    eventDate: string;
    guestCount: number;
    eventType: string;

    status:
        | "PENDING"
        | "CONFIRMED"
        | "COMPLETED"
        | "CANCELLED"
        | "REJECTED";

    paymentStatus:
        | "PENDING"
        | "PAID"
        | "PARTIALLY_PAID"
        | "REFUNDED"
        | "FAILED";

    totalAmount: number;
    paidAmount: number;

    createdAt: string;
}