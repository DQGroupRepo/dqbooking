import type { CateringPackageMenu } from "./CateringPackageMenu";

export type ServicePackageType = "SILVER" | "GOLD" | "PREMIUM" | "STANDARD" | "DAY_PACKAGE" | "FIXED_DURATION";

export interface ServicePackage {
  /** Persisted embedded-package identifier returned by the backend. */
  id?: string;
  name: string;
  resourceTypeId?: string | null;
  pricingBasis?: "PER_DAY" | "PER_NIGHT" | "FIXED";
  minimumDuration?: number;
  maximumDuration?: number;
  /** Exact duration included in a fixed-duration package (STAY = nights). */
  includedDuration?: number;
  price: number;
  features: string[];
  active: boolean;
  capacity?: number | null;
  packageType?: ServicePackageType | string;
  slotIds?: string[];
  /** Maximum guests allowed in each room for STAY packages. */
  maxGuestsPerRoom?: number | null;
  requiresSlot?: boolean;
  cateringPackageMenu?: CateringPackageMenu | null;
  cateringMenu?: CateringPackageMenu | null;
}
