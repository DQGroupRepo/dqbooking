import type { CateringPackageMenu } from "./CateringPackageMenu";

export type ServicePackageType = "SILVER" | "GOLD" | "PREMIUM" | "STANDARD" | "DAY_PACKAGE";

export interface ServicePackage {
  /** Persisted embedded-package identifier returned by the backend. */
  id?: string;
  name: string;
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
