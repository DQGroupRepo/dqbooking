export interface BookingPricingHead {
    code: string;
    name: string;
    calculatedAmount: number;
}

export interface BookingDiscount {
    name: string;
    calculatedAmount: number;
}

export interface BookingPricingResponse {
    baseAmount: number;
    pricingHeads: BookingPricingHead[];
    subtotal: number;
    discounts: BookingDiscount[];
    discountAmount: number;
    totalAmount: number;
    advanceAmount: number;
    balanceAmount: number;
}
