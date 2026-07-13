import { mockBookingStats } from "../mocks/mockBookingStats";

import type { BookingStats } from "../types/BookingStats";

class BookingStatsService {

    async getBookings(): Promise<BookingStats[]> {

        return Promise.resolve(mockBookingStats);

    }

    async getBookingById(
        id: number
    ): Promise<BookingStats | undefined> {

        const booking = mockBookingStats.find(
            booking => booking.id === id
        );

        return Promise.resolve(booking);

    }

}

export default new BookingStatsService();