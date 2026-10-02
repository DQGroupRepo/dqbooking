export type ServicePackageType = "SILVER" | "GOLD" | "PREMIUM";

export interface ServicePackage {
  id?: string;
  name: string;
  price: number;
  features: string[];
  active: boolean;
}
