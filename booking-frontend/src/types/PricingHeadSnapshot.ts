export interface PricingHeadSnapshot {
  code: string;
  name: string;
  calculationType: string;
  value: number;
  calculatedAmount: number;
  displayOrder?: number;
}