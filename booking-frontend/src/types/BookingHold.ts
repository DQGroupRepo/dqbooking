export interface BookingHoldRequest {
    cartId: string;
    serviceId: string;
    slotId?: string;
    packageId?: string;
    resourceTypeId?: string;
    bookingFrom: string;
    bookingTo: string;
    bookingIntervals?: { from: string; to: string }[];
    bookingType?: "STANDARD_SLOT" | "ROOM_STAY" | "DAY_PACKAGE";
    roomQuantity?: number;
    quantity: number;
}

export interface BookingHoldResponse {
    holdId: string;
    serviceId: string;
    slotId?: string;
    packageId?: string;
    resourceTypeId?: string;
    resourceIds?: string[];
    bookingFrom: string;
    bookingTo: string;
    quantity: number;
    expiresAt: string;
}
