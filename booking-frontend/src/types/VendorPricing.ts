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

export interface RefundRule {
  minDaysBeforeEvent: number;
  maxDaysBeforeEvent?: number | null;
  refundPercentage: number;
}

export interface VendorServicePricing {
  id?: string;
  serviceId: string;
  effectiveFrom: string;
  effectiveUntil: string;
  baseAmount: number;
  pricingHeads: VendorPricingHead[];
  discounts: VendorDiscount[];
  paymentConfiguration: {
    advancePaymentType: "PERCENTAGE" | "FIXED_AMOUNT";
    advancePaymentValue: number | null;
    payAfterConfirmation: boolean;
    discussWithVendor: boolean;
  };
  cancellationPolicy: {
    processingDays: number;
    refundRules: RefundRule[];
  };
}
