export interface SlotAvailability {
    slotId: string;

    serviceId: string;

    slotName: string;

    resourceTypeId?: string | null;
    bookingPattern?: "DAILY_RECURRING" | "CONTINUOUS";

    startTime: string;

    endTime: string;

    date: string;

    baseCapacity: number;

    effectiveCapacity: number;

    bookedCount: number;

    remainingCapacity: number;

    available: boolean;

    vendorBlocked: boolean;
}