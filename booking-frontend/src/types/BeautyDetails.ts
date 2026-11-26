export interface BeautyServiceItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
}
export interface BeautyDurationRule {
  minServices: number;
  maxServices: number;
  durationMinutes: number;
}
export interface BeautyBreak {
  startTime: string;
  endTime: string;
  label?: string;
}
export interface BeautyDetails {
  openingTime: string;
  closingTime: string;
  services: BeautyServiceItem[];
  durationRules: BeautyDurationRule[];
  breaks: BeautyBreak[];
}
