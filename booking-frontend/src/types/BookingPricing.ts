export interface PricingHeadSnapshot {
  code: string;
  name: string;
  calculatedAmount: number;
}

export interface DiscountSnapshot {
  name: string;
  calculatedAmount: number;
}

export interface BookingPricingResponse {
  baseAmount: number;
  pricingHeads: PricingHeadSnapshot[];
  subtotal: number;
  discounts: DiscountSnapshot[];
  discountAmount: number;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
}
