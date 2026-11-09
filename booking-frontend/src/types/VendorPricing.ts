/**
 * Shared TypeScript types for vendor pricing.
 * UI, hooks, API calls, and JSX belong in pages/vendor/pricing/VendorPricing.tsx.
 * Package names are vendor-defined; there is no fixed tier enum.
 */
import type { ServicePackage } from "./ServicePackage";

export type PricingCalculationType = "FIXED" | "PERCENTAGE";
export type DiscountType = "FIXED" | "PERCENTAGE";
export type AdvancePaymentType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface VendorPricingHead {
  code: string;
  name: string;
  calculationType: PricingCalculationType;
  value: number;
  displayOrder: number;
  active: boolean;
}

export interface VendorDiscount {
  name: string;
  discountType: DiscountType;
  value: number;
  active: boolean;
}

export interface RefundRule {
  minDaysBeforeEvent: number;
  maxDaysBeforeEvent: number | null;
  refundPercentage: number;
}

export interface PaymentConfiguration {
  advancePaymentAllowed: boolean;
  advancePaymentType: AdvancePaymentType;
  advancePaymentValue: number | null;
}

export interface CancellationPolicy {
  processingDays: number;
  refundRules: RefundRule[];
}

export interface VendorServicePricing {
  id?: string;
  vendorId?: string;
  serviceId: string;
  version?: number;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  baseAmount: number;
  pricingHeads: VendorPricingHead[];
  discounts: VendorDiscount[];
  packages?: ServicePackage[];
  paymentConfiguration: PaymentConfiguration;
  cancellationPolicy: CancellationPolicy;
  createdAt?: string | null;
  createdBy?: string | null;
  lastUpdated?: string | null;
}

export interface PricingVersionSummary {
  id: string;
  version: number;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  baseAmount: string | number;
  createdAt?: string | null;
  createdBy?: string | null;
}
