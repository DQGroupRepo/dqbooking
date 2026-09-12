import api from "../api/axiosConfig";


/* =========================================================
   PRICING HEAD
========================================================= */

export interface VendorPricingHead {

    code: string;

    name: string;

    calculationType:
        | "FIXED"
        | "PERCENTAGE";

    value: number;

    displayOrder: number;

    active: boolean;

}


/* =========================================================
   DISCOUNT
========================================================= */

export interface VendorDiscount {

    name: string;

    discountType:
        | "FIXED"
        | "PERCENTAGE";

    value: number;

    validFrom?: string;

    validUntil?: string;

    active: boolean;

}


/* =========================================================
   PAYMENT CONFIGURATION
========================================================= */

export interface PaymentConfiguration {

    advancePaymentType:
        | "PERCENTAGE"
        | "FIXED_AMOUNT";

    advancePaymentValue:
        | number
        | null;

    payAfterConfirmation?: boolean;

    discussWithVendor?: boolean;

}


/* =========================================================
   CANCELLATION POLICY
========================================================= */

export interface CancellationPolicy {

    freeCancellationDays: number;

    cancellationChargePercentage: number;

}


/* =========================================================
   VENDOR PRICING
========================================================= */

export interface VendorPricing {

    id?: string;

    serviceId: string;

    effectiveFrom: string;

    effectiveUntil?: string;

    baseAmount: number;

    pricingHeads:
        VendorPricingHead[];

    discounts:
        VendorDiscount[];

    paymentConfiguration:
        PaymentConfiguration;

    cancellationPolicy:
        CancellationPolicy;

}


/* =========================================================
   GET PRICING
========================================================= */

export async function getPricing(
    serviceId: string
): Promise<VendorPricing> {

    const response =
        await api.get<VendorPricing>(
            `/pricing/services/${serviceId}`
        );

    return response.data;

}


/* =========================================================
   SAVE PRICING
========================================================= */

export async function savePricing(
    pricing: VendorPricing
): Promise<VendorPricing> {

    const response =
        await api.post<VendorPricing>(
            "/pricing",
            pricing
        );

    return response.data;

}