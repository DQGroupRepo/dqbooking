import type { BookingPricingResponse } from "./BookingPricing";

export interface CustomerBookingDetailsResponse {
  bookingId: string;
  bookingNumber: string;
  bookingStatus: string;
  eventType?: string;
  paymentStatus: string;
  bookingDate: string;
  eventDate: string;
  guestCount: number;
  serviceName: string;
  vendorName?: string;
  vendorPhone?: string;
  vendorEmail?: string;
  serviceImage?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  venue: string;
  specialRequest?: string | null;
  baseAmount: number;
  pricingHeads: BookingPricingResponse["pricingHeads"];
  subtotal: number;
  discounts: BookingPricingResponse["discounts"];
  discountAmount: number;
  totalAmount: number;
  advanceAmount?: number;
  paidAmount?: number;
  balanceAmount?: number;
  refundableAmount?: number;
  cancellationCharge?: number;
  cancelledAt?: string | null;
  refundPercentage?: number;
  cancellationPolicy?: string;
  pricing?: BookingPricingResponse;
}
