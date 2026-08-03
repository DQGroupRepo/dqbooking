import api from "../api/axiosConfig";
import type { Booking } from "../types/Booking";

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
  booking: CreateBookingRequest
): Promise<Booking> => {

  const response =
    await api.post<Booking>(
      "/bookings",
      booking
    );

  return response.data;
};


/*
 * =========================================
 * GET BOOKING
 * =========================================
 */

export const getBookingById = async (
  id: string
): Promise<Booking> => {

  const response =
    await api.get<Booking>(
      `/bookings/${id}`
    );

  return response.data;
};


/*
 * =========================================
 * CUSTOMER BOOKINGS
 * =========================================
 */

export const getCustomerBookings =
  async (): Promise<Booking[]> => {

    const response =
      await api.get<Booking[]>(
        "/bookings/customer"
      );

    return response.data;
  };


/*
 * =========================================
 * VENDOR BOOKINGS
 * =========================================
 */

export const getVendorBookings =
  async (): Promise<Booking[]> => {

    const response =
      await api.get<Booking[]>(
        "/bookings/vendor"
      );

    return response.data;
  };


/*
 * =========================================
 * PRICING PREVIEW
 * =========================================
 */

export const getPricingPreview = async (

  serviceId: string,

  eventDate: string

): Promise<PricingCalculationResult> => {

  const response =
    await api.get<PricingCalculationResult>(
      `/pricing/services/${serviceId}/calculate`,
      {
        params: {
          eventDate
        }
      }
    );

  return response.data;
};

