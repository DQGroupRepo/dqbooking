import api from "../api/axiosConfig";
import type { Booking } from "../types/Booking";
import type { CancellationPreview } from "../types/CancellationPreview";
import type { BookingGroup } from "../types/BookingGroup";

export interface CreateBookingRequest {
  serviceId: string;
  eventDate: string;
  guestCount: number;
  specialRequest?: string;
  eventType: string;
}

export interface PricingHeadSnapshot {
  code: string;
  name: string;
  calculationType: string;
  value: number;
  calculatedAmount: number;
  displayOrder?: number;
}

export interface DiscountSnapshot {
  name: string;
  discountType: string;
  value: number;
  calculatedAmount: number;
}

export interface PricingCalculationResult {
  pricingId: string;

  pricingVersion: number;

  baseAmount: number;

  pricingHeads: PricingHeadSnapshot[];

  subtotal: number;

  discounts: DiscountSnapshot[];

  discountAmount: number;

  totalAmount: number;

  advanceAmount: number;

  balanceAmount: number;
}

/*
 * =========================================
 * CREATE BOOKING
 * =========================================
 */

export const createBooking = async (
  booking: CreateBookingRequest,
): Promise<Booking> => {
  const response = await api.post<Booking>("/bookings", booking);

  return response.data;
};

/*
 * =========================================
 * GET BOOKING GROUP
 * =========================================
 */

export const getBookingGroupById = async (
  bookingGroupId: string,
): Promise<BookingGroup> => {
  const response = await api.get<BookingGroup>(`/bookings/${bookingGroupId}`);

  return response.data;
};

/*
 * =========================================
 * CUSTOMER BOOKINGS
 * =========================================
 */

export const getCustomerBookings = async (): Promise<Booking[]> => {
  const response = await api.get<Booking[]>("/bookings/customer");

  return response.data;
};

/*
 * =========================================
 * VENDOR BOOKINGS
 * =========================================
 */

export const getVendorBookings = async (): Promise<Booking[]> => {
  const response = await api.get<Booking[]>("/bookings/vendor");

  return response.data;
};

/*
 * =========================================
 * PRICING PREVIEW
 * =========================================
 */

export const getPricingPreview = async (
  serviceId: string,

  eventDate: string,
): Promise<PricingCalculationResult> => {
  const response = await api.get<PricingCalculationResult>(
    `/pricing/services/${serviceId}/calculate`,
    {
      params: {
        eventDate,
      },
    },
  );

  return response.data;
};

/*
 * =========================================
 * CANCELLATION PREVIEW
 * =========================================
 */

export const getCancellationPreview = async (
  bookingId: string,
): Promise<CancellationPreview> => {
  const response = await api.get<CancellationPreview>(
    `/bookings/${bookingId}/cancellation-preview`,
  );

  return response.data;
};

/*
 * =========================================
 * CANCEL BOOKING
 * =========================================
 */

export const cancelBooking = async (bookingId: string) => {
  const response = await api.patch(`/bookings/${bookingId}/cancel`);

  return response.data;
};
