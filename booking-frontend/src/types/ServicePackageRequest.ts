import type { ServicePackageType } from "./ServicePackage";

export interface ServicePackageRequest {

    type: ServicePackageType;

    price: number;

    features: string[];

}