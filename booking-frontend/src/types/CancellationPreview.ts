export interface CancellationPreview {

    bookingId: string;

    bookingNumber: string;

    eventDate: string;

    totalAmount: number;

    paidAmount: number;

    daysBeforeEvent: number;

    refundPercentage: number;

    refundableAmount: number;

    cancellationCharge: number;

    processingDays: number;

    cancellationAllowed: boolean;

}