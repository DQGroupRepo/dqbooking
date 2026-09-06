import type { Booking } from "./Booking";

export interface BookingGroup {

    bookingGroupId: string;

    customerId: string;

    eventType?: string | null;

    specialRequest?: string | null;

    originalTotal: number;

    totalDiscount: number;

    finalTotal: number;

    bundleApplied: boolean;

    qualifyingServiceCount: number;

    bookings: Booking[];

}