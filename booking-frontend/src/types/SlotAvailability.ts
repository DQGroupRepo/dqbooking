export interface SlotAvailability {
    slotId: string;

    serviceId: string;

    slotName: string;

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