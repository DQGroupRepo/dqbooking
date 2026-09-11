import api from "../api/axiosConfig";

import type {
    BookingStats
} from "../types/BookingStats";


/*
 * =========================================
 * BOOKING LIST RESPONSE
 * =========================================
 */

interface BookingResponse {

    id: string;

    bookingNumber: string;

    customerName: string;

    customerPhone: string;

    customerEmail: string;

    serviceName: string;

    venue: string;

    eventDate: string;

    guestCount: number;

    totalAmount: number;

    paidAmount: number;

    paymentStatus: string;

    specialRequest: string;

    status: string;

}


/*
 * =========================================
 * BOOKING DETAILS RESPONSE
 * =========================================
 *
 * Returned from:
 *
 * GET /bookings/{bookingId}/details
 */

interface BookingDetailsResponse {

    bookingId: string;

    bookingNumber: string;

    serviceId: string;

    serviceName: string;

    vendorId: string;

    vendorName: string;

    vendorPhone: string;

    vendorEmail: string;

    bookingDate: string;

    eventDate: string;

    guestCount: number;

    eventType: string;

    specialRequest: string;

    bookingStatus: string;

    paymentStatus: string;

    baseAmount: number;

    subtotal: number;

    discountAmount: number;

    totalAmount: number;

    advanceAmount: number;

    balanceAmount: number;

    paidAmount: number;

}


class BookingStatsService {


    /*
     * =========================================
     * GET VENDOR BOOKINGS
     * =========================================
     */

    async getBookings(): Promise<
        BookingStats[]
    > {

        const response =
            await api.get<
                BookingResponse[]
            >(
                "/bookings/vendor"
            );


        return response.data.map(
            booking =>
                this.mapBooking(
                    booking
                )
        );

    }


    /*
     * =========================================
     * GET BOOKINGS BY SERVICE
     * =========================================
     */

    async getBookingsByService(
        serviceId: string
    ): Promise<
        BookingStats[]
    > {

        const response =
            await api.get<
                BookingResponse[]
            >(
                `/vendor/services/${serviceId}/bookings`
            );


        return response.data.map(
            booking =>
                this.mapBooking(
                    booking
                )
        );

    }


    /*
     * =========================================
     * GET SINGLE BOOKING DETAILS
     * =========================================
     */

    async getBookingById(
        id: string
    ): Promise<
        BookingStats
    > {

        const response =
            await api.get<
                BookingDetailsResponse
            >(
                `/bookings/${id}/details`
            );


        return this.mapBookingDetails(
            response.data
        );

    }


    /*
     * =========================================
     * MAP BOOKING LIST RESPONSE
     * =========================================
     */

    private mapBooking(
        booking: BookingResponse
    ): BookingStats {

        return {

            id:
                booking.id,

            bookingNumber:
                booking.bookingNumber,

            customerName:
                booking.customerName,

            customerPhone:
                booking.customerPhone,

            customerEmail:
                booking.customerEmail,

            serviceName:
                booking.serviceName,

            venue:
                booking.venue,

            eventDate:
                booking.eventDate,

            guestCount:
                booking.guestCount,

            amount:
                booking.totalAmount,

            paidAmount:
                booking.paidAmount,

            paymentStatus:
                this.formatStatus(
                    booking.paymentStatus
                ) as BookingStats["paymentStatus"],

            notes:
                booking.specialRequest,

            status:
                this.formatStatus(
                    booking.status
                ) as BookingStats["status"]

        };

    }


    /*
     * =========================================
     * MAP BOOKING DETAILS RESPONSE
     * =========================================
     */

    private mapBookingDetails(
        booking: BookingDetailsResponse
    ): BookingStats {

        return {

            id:
                booking.bookingId,

            bookingNumber:
                booking.bookingNumber,


            /*
             * Customer information is not
             * currently included in the
             * details response.
             */

            customerName:
                "",

            customerPhone:
                "",

            customerEmail:
                "",


            serviceName:
                booking.serviceName,


            /*
             * Venue is not currently available
             * in CustomerBookingDetailsResponse.
             */

            venue:
                "",


            eventDate:
                booking.eventDate,

            guestCount:
                booking.guestCount,

            amount:
                booking.totalAmount,

            paidAmount:
                booking.paidAmount,

            paymentStatus:
                this.formatStatus(
                    booking.paymentStatus
                ) as BookingStats["paymentStatus"],

            notes:
                booking.specialRequest,


            /*
             * IMPORTANT
             *
             * Details API returns:
             *
             * bookingStatus
             *
             * Not:
             *
             * status
             */

            status:
                this.formatStatus(
                    booking.bookingStatus
                ) as BookingStats["status"]

        };

    }


    /*
     * =========================================
     * FORMAT ENUM STATUS
     * =========================================
     *
     * PENDING
     *      -> Pending
     *
     * CONFIRMED
     *      -> Confirmed
     */

    private formatStatus(
        value?: string
    ): string {

        if (
            !value
        ) {

            return "";

        }


        return (

            value.charAt(0) +

            value
                .substring(1)
                .toLowerCase()

        );

    }

}


export default new BookingStatsService();