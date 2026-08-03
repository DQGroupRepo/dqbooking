import api from "../api/axiosConfig";

export interface VendorPricingHead {

    code: string;

    name: string;

    calculationType: "FIXED" | "PERCENTAGE";

    value: number;

    displayOrder: number;

    active: boolean;

}

export interface VendorDiscount {

    name: string;

    discountType: "FIXED" | "PERCENTAGE";

    value: number;

    validFrom?: string;

    validUntil?: string;

    active: boolean;

}

export interface PaymentConfiguration {

    advancePaymentAllowed: boolean;

    advancePercentage: number;

}

export interface CancellationPolicy {

    freeCancellationDays: number;

    cancellationChargePercentage: number;

}

export interface VendorPricing {

    id?: string;

    serviceId: string;

    effectiveFrom: string;

    effectiveUntil?: string;

    baseAmount: number;

    pricingHeads: VendorPricingHead[];

    discounts: VendorDiscount[];

    paymentConfiguration: PaymentConfiguration;

    cancellationPolicy: CancellationPolicy;

}

export async function getPricing(serviceId: string) {

    const response = await api.get(
        `/pricing/services/${serviceId}`
    );

    return response.data;
}

export async function savePricing(
    pricing: VendorPricing
): Promise<VendorPricing> {

    const response = await api.post(
        "/pricing",
        pricing
    );

    return response.data;
}