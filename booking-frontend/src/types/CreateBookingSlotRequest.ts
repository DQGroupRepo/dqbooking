export interface CreateBookingSlotRequest {

    slotName: string;

    resourceTypeId?: string;
    bookingPattern?: "DAILY_RECURRING" | "CONTINUOUS";

    startTime: string;

    endTime: string;

    maxBookings: number;

    displayOrder: number;

}