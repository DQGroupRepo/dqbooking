export interface BookingHoldRequest {
    serviceId: string;

    slotId: string;

    eventDate: string;

    quantity: number;
}

export interface BookingHoldResponse {
    holdId: string;

    serviceId: string;

    slotId: string;

    eventDate: string;

    quantity: number;

    expiresAt: string;
}