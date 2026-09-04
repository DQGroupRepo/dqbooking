export interface VendorPricingHead {

    code: string;

    name: string;

    calculationType:
        | "FIXED"
        | "PERCENTAGE";

    value: number;

    displayOrder?: number;

    active?: boolean;
}


export interface VendorDiscount {

    name: string;

    discountType:
        | "FIXED"
        | "PERCENTAGE";

    value: number;

    active?: boolean;
}


export interface PaymentConfiguration {

    advancePaymentAllowed: boolean;

    advancePercentage: number;
}


export interface RefundRule {

    minDaysBeforeEvent: number;

    maxDaysBeforeEvent:
        | number
        | null;

    refundPercentage: number;
}


export interface CancellationPolicy {

    processingDays?: number;

    refundRules: RefundRule[];

}


export interface VendorServicePricing {

    id?: string;

    serviceId: string;

    version?: number;

    effectiveFrom: string;

    effectiveUntil?: string;

    baseAmount: number;

    pricingHeads: VendorPricingHead[];

    discounts: VendorDiscount[];

    paymentConfiguration: PaymentConfiguration;

    cancellationPolicy: CancellationPolicy;

}