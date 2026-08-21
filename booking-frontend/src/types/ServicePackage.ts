export type ServicePackageType =
    | "SILVER"
    | "GOLD"
    | "PREMIUM";


export interface ServicePackage {

    id?: string;

    type: ServicePackageType;

    price: number;

    features: string[];

    active: boolean;

}