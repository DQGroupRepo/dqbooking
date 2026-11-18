import type { ServicePackage } from "./ServicePackage";

/**
 * Response from GET pricing for a service on a requested event date.
 * Java LocalDate values are serialized as ISO date strings by the API.
 */
export interface VendorPricingForDate {
    pricingId: string;
    version: number;
    effectiveFrom: string;
    effectiveUntil?: string | null;
    baseAmount: number;
    eventDate: string;
    packages: ServicePackage[];
}
