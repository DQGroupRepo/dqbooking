export interface CreateBookingSlotRequest {

    slotName: string;

    startTime: string;

    endTime: string;

    maxBookings: number;

    displayOrder: number;

}