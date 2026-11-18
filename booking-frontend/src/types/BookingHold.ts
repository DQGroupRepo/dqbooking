export interface BookingHoldRequest {
    cartId: string;
    serviceId: string;
    slotId?: string;
    packageId?: string;
    resourceTypeId?: string;
    resourceRequirements?: { resourceTypeId: string; quantity: number }[];
    bookingFrom: string;
    bookingTo: string;
    bookingIntervals?: { from: string; to: string }[];
    bookingType?: "STANDARD_SLOT" | "ROOM_STAY" | "DAY_PACKAGE";
    roomQuantity?: number;
    quantity: number;
}

export interface BookingResourceAllocation {
    resourceTypeId: string;
    resourceIds: string[];
}

export interface BookingHoldResponse {
    holdId: string;
    serviceId: string;
    slotId?: string;
    packageId?: string;
    resourceTypeId?: string;
    resourceIds?: string[];
    resourceAllocations?: BookingResourceAllocation[];
    bookingFrom: string;
    bookingTo: string;
    quantity: number;
    expiresAt: string;
}
