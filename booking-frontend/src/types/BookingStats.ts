export interface BookingStats {

    id: string;

    bookingNumber: string;

    customerName: string;

    customerPhone: string;

    customerEmail: string;

    serviceName: string;

    venue: string;

    eventDate: string;

    /** Actual interval; used for STAY calendar ranges. */
    bookingFrom?: string;
    bookingTo?: string;
    serviceCategory?: string;
    bookingType?: string;
    roomQuantity?: number;
    slotId?: string;
    slotName?: string;
    slotStartTime?: string;
    slotEndTime?: string;
    resourceTypeName?: string;
    resourceIds?: string[];
    resourceNames?: string[];
    vendorCanCancel?: boolean;

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