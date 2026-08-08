import api from "../api/axiosConfig";
import type { AdminBooking } from "../types/AdminBooking";

class AdminBookingService {

    async getBookings(): Promise<AdminBooking[]> {

        const response =
            await api.get<AdminBooking[]>(
                "/admin/bookings"
            );

        return response.data;
    }

    async getBooking(
        bookingId: string
    ): Promise<AdminBooking> {

        const response =
            await api.get<AdminBooking>(
                `/admin/bookings/${bookingId}`
            );

        return response.data;
    }

}

export default new AdminBookingService();