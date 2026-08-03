import type { BookingPricingResponse } from "./BookingPricing";

export interface Booking {

    id: string;

    bookingNumber: string;

    serviceName: string;

    totalAmount: number;

    eventDate: string;

    guestCount: number;

    status: string;

    paymentStatus: string;

    specialRequest?: string;

    eventType: string;

    customerName: string;

    customerPhone: string;

    customerEmail: string;

    venue: string;

    paidAmount: number;

    pricing: BookingPricingResponse;

}