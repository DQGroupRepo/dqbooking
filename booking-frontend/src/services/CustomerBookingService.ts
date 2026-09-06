import api from "../api/axiosConfig";

import type { Booking } from "../types/Booking";
import type { BookingGroup } from "../types/BookingGroup";
import type { CancellationPreview } from "../types/CancellationPreview";
import type { BookingCancellationResponse } from "../types/BookingCancellationResponse";
import type { CustomerBookingDetailsResponse } from "../types/CustomerBookingDetailsResponse";


const CustomerBookingService = {

    async getBookings(): Promise<Booking[]> {

        const response =
            await api.get<Booking[]>(
                "/bookings/customer"
            );

        return response.data;

    },


    /*
     * =========================================
     * GET BOOKING GROUP
     * =========================================
     */

    async getBookingGroup(
        bookingGroupId: string
    ): Promise<BookingGroup> {

        const response =
            await api.get<BookingGroup>(
                `/bookings/${bookingGroupId}`
            );

        return response.data;

    },


    /*
     * =========================================
     * GET INDIVIDUAL BOOKING DETAILS
     * =========================================
     */

    async getBooking(
        bookingId: string
    ): Promise<CustomerBookingDetailsResponse> {

        const response =
            await api.get<CustomerBookingDetailsResponse>(
                `/bookings/${bookingId}/details`
            );

        return response.data;

    },


    /*
     * =========================================
     * CANCEL BOOKING
     * =========================================
     */

    async cancelBooking(
        bookingId: string
    ): Promise<BookingCancellationResponse> {

        const response =
            await api.patch<BookingCancellationResponse>(
                `/bookings/${bookingId}/cancel`
            );

        return response.data;

    },


    /*
     * =========================================
     * CANCELLATION PREVIEW
     * =========================================
     */

    async getCancellationPreview(
        bookingId: string
    ): Promise<CancellationPreview> {

        const response =
            await api.get<CancellationPreview>(
                `/bookings/${bookingId}/cancellation-preview`
            );

        return response.data;

    }

};


export default CustomerBookingService;