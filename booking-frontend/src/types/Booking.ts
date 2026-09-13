import type { BookingPricingResponse } from "./BookingPricing";

export interface Booking {
  id: string;

  bookingId?: string;

  bookingGroupId?: string;

  bookingNumber: string;

  serviceId?: string;

  serviceName: string;

  serviceImage?: string | null;

  serviceCategory?: string | null;

  totalAmount: number;

  eventDate: string;

  guestCount: number;

  status: string;

  bookingStatus?: string;

  paymentStatus: string;

  specialRequest?: string;

  eventType: string;

  customerName: string;

  customerPhone: string;

  customerEmail: string;

  venue: string;

  paidAmount: number;

  pricing: BookingPricingResponse;

  packageId?: string;

  packageType?: "SILVER" | "GOLD" | "PREMIUM";

  cancellable?: boolean;

  cancelledAt?: string | null;

  refundPercentage?: number | null;

  cancellationCharge?: number | null;

  refundableAmount?: number | null;
}
