import api from "../api/axiosConfig";

import type { Booking } from "../types/Booking";

import type {
    BookingCancellationResponse
} from "../types/BookingCancellationResponse";

const CustomerBookingService = {

    async getBookings() {

        const response =
            await api.get<Booking[]>(
                "/bookings/customer"
            );

        return response.data;

    },

    async getBooking(
        bookingId: string
    ) {

        const response =
            await api.get<CustomerBookingDetailsResponse>(
                      `/bookings/${bookingId}/details`
                  );

        return response.data;

    },

    async cancelBooking(
        bookingId: string
    ) {

        const response =
            await api.patch<BookingCancellationResponse>(
                `/bookings/${bookingId}/cancel`
            );

        return response.data;

    }

};

export default CustomerBookingService;