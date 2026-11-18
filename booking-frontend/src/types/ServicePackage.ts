import type { CateringPackageMenu } from "./CateringPackageMenu";

export type ServicePackageType = "SILVER" | "GOLD" | "PREMIUM" | "STANDARD" | "DAY_PACKAGE" | "FIXED_DURATION";

export interface ServicePackageResourceRequirement {
  resourceTypeId: string;
  /** Number of rooms of this type in one complete package. */
  quantity: number;
}

export interface ServicePackage {
  /** Persisted embedded-package identifier returned by the backend. */
  id?: string;
  name: string;
  /** Legacy single-type field; retained for existing saved packages. */
  resourceTypeId?: string | null;
  /** Combined room composition for STAY packages. */
  resourceRequirements?: ServicePackageResourceRequirement[];
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
