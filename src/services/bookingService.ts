import api from "../api/axiosConfig";
import { Booking } from "../types/Booking";

export const createBooking = async (
  booking: Partial<Booking>
): Promise<Booking> => {
  const response = await api.post<Booking>(
    "/bookings",
    booking
  );

  return response.data;
};

export const getBookingById = async (
  id: number
): Promise<Booking> => {
  const response = await api.get<Booking>(
    `/bookings/${id}`
  );

  return response.data;
};

export const getUserBookings = async (): Promise<
  Booking[]
> => {
  const response = await api.get<Booking[]>(
    "/bookings/user"
  );

  return response.data;
};