import type { Booking } from "../types/Booking";


export interface GroupedBooking {

    bookingGroupId: string;

    bookings: Booking[];

    totalAmount: number;

    originalTotal: number;

    totalDiscount: number;

}


export const groupBookingsByGroupId = (
    bookings: Booking[]
): GroupedBooking[] => {

    const groups =
        new Map<
            string,
            Booking[]
        >();


    bookings.forEach(
        booking => {

            const groupId =
                booking.bookingGroupId ||
                booking.id;


            const existing =
                groups.get(
                    groupId
                );


            if (existing) {

                existing.push(
                    booking
                );

            } else {

                groups.set(
                    groupId,
                    [booking]
                );

            }

        }
    );


    return Array.from(
        groups.entries()
    ).map(
        (
            [
                bookingGroupId,
                groupBookings
            ]
        ) => {

            const originalTotal =
                groupBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        Number(
                            booking.pricing?.subtotal ??
                            booking.totalAmount ??
                            0
                        ),
                    0
                );


            const totalAmount =
                groupBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        Number(
                            booking.totalAmount ??
                            0
                        ),
                    0
                );


            return {

                bookingGroupId,

                bookings:
                    groupBookings,

                totalAmount,

                originalTotal,

                totalDiscount:
                    originalTotal -
                    totalAmount

            };

        }
    );

};