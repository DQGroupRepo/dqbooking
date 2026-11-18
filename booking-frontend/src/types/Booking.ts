import type { BookingPricingResponse } from "./BookingPricing";

export interface Booking {
  id: string;

  bookingGroupId?: string;

  bookingNumber: string;

  serviceId?: string;

  serviceName: string;

  serviceImage?: string | null;

  serviceCategory?: string | null;

  totalAmount: number;

  bookingFrom: string;
  bookingTo: string;
  eventDate?: string;
  bookingType?: "STANDARD_SLOT" | "ROOM_STAY" | "DAY_PACKAGE";
  roomQuantity?: number;
  slotId?: string;
  slotName?: string;
  slotStartTime?: string;
  slotEndTime?: string;
  resourceTypeName?: string;
  resourceIds?: string[];
  resourceNames?: string[];

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

  packageId?: string;

  packageType?: "SILVER" | "GOLD" | "PREMIUM";

  cancellable?: boolean;

  cancelledAt?: string | null;

  refundPercentage?: number | null;

  cancellationCharge?: number | null;

  refundableAmount?: number | null;
}

export type BookingResponse = Pick<
  Booking,
  "customerName" | "customerPhone" | "customerEmail"
>;
