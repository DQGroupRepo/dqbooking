import api from "../api/axiosConfig";
import type { BookingStats } from "../types/BookingStats";

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

class BookingStatsService {

    async getBookings(): Promise<BookingStats[]> {

        const response =
            await api.get<BookingResponse[]>(
                "/bookings/vendor"
            );

        return response.data.map(this.mapBooking);

    }

    async getBookingsByService(
        serviceId: string
    ): Promise<BookingStats[]> {

        const response =
            await api.get<BookingResponse[]>(
                `/vendor/services/${serviceId}/bookings`
            );

        return response.data.map(this.mapBooking);

    }

    async getBookingById(
        id: string
    ): Promise<BookingStats> {

        const response =
            await api.get<BookingResponse>(
                `/bookings/${id}`
            );

        return this.mapBooking(response.data);

    }

    private mapBooking(
        booking: BookingResponse
    ): BookingStats {

        return {

            id: booking.id,

            bookingNumber: booking.bookingNumber,

            customerName: booking.customerName,

            customerPhone: booking.customerPhone,

            customerEmail: booking.customerEmail,

            serviceName: booking.serviceName,

            venue: booking.venue,

            eventDate: booking.eventDate,

            guestCount: booking.guestCount,

            amount: booking.totalAmount,

            paidAmount: booking.paidAmount,

            paymentStatus:
                booking.paymentStatus.charAt(0) +
                booking.paymentStatus
                    .substring(1)
                    .toLowerCase() as BookingStats["paymentStatus"],

            notes: booking.specialRequest,

            status:
                booking.status.charAt(0) +
                booking.status
                    .substring(1)
                    .toLowerCase() as BookingStats["status"]

        };

    }

}

export default new BookingStatsService();