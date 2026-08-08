export interface ServiceSettings {

    minimumAdvanceDays: number;

    maximumAdvanceDays: number;

    minimumGuests: number;

    maximumGuests: number;

    depositPercentage: number;

    cancellationPolicy: CancellationPolicy;

    balanceDueDays: number;

    active: boolean;

    instantBooking: boolean;

}

export interface RefundRule {

    minDaysBeforeEvent: number;

    maxDaysBeforeEvent?: number | null;

    refundPercentage: number;

}

export type RefundOnType =
    | "TOTAL_AMOUNT"
    | "PAID_AMOUNT";

export interface CancellationPolicy {

    allowCancellation: boolean;

    refundOn: RefundOnType;

    processingDays: number;

    refundRules: RefundRule[];

}