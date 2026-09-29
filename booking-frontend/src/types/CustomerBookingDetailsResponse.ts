import type { BookingPricingResponse } from "./BookingPricing";

export interface CustomerBookingDetailsResponse extends BookingPricingResponse {
  bookingId: string;
  bookingNumber: string;
  bookingStatus: string;
  paymentStatus: string;
  bookingDate: string;
  eventDate: string;
  guestCount: number;
  eventType: string;
  paidAmount: number;
  serviceId?: string;
  serviceName: string;
  serviceImage?: string | null;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  vendorId?: string;
  vendorName: string;
  vendorPhone: string;
  vendorEmail: string;
  venue?: string;
  specialRequest?: string;
  cancellable?: boolean;
  cancelledAt?: string | null;
  refundPercentage: number;
  cancellationCharge: number;
  refundableAmount: number;
}
