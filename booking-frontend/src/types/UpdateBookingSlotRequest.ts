export interface UpdateBookingSlotRequest {

    slotName: string;

    resourceTypeId?: string;

    startTime: string;

    endTime: string;

    maxBookings: number;

    displayOrder: number;

}