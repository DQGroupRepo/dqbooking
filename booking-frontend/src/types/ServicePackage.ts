import type { CateringPackageMenu } from "./CateringPackageMenu";

// Re-export the canonical catering menu types for any existing imports that
// still consume them through ServicePackage.ts. There must be only one source
// of truth for these interfaces.
export type { CateringPackageDish, CateringPackageMenu } from "./CateringPackageMenu";

// Package names are vendor-defined; do not constrain them to fixed tiers.
export type ServicePackageType = string;

export interface ServicePackage {
    id?: string;
    // Retained for compatibility with older API payloads.
    type?: string;
    name: string;
    price: number;
    features: string[];
    active: boolean;
    cateringPackageMenu?: CateringPackageMenu | null;
    cateringMenu?: CateringPackageMenu | null;
}
