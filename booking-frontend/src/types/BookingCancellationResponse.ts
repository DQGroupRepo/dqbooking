export interface BookingCancellationResponse {

    bookingId: string;

    bookingNumber: string;

    cancellationCharge: number;

    refundableAmount: number;

    bookingStatus: string;

    paymentStatus: string;

    message: string;

}