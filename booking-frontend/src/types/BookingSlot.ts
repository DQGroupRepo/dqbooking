export interface BookingSlot {

    id: string;

    serviceId: string;

    slotName: string;

    startTime: string;

    endTime: string;

    maxBookings: number;

    displayOrder: number;

    active: boolean;

    createdAt?: string;

    updatedAt?: string;

}
