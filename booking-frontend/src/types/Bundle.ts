export interface Bundle {

    id: string;

    vendorId: string;

    name: string;

    description?: string;

    serviceIds: string[];

    discountType:
        | "PERCENTAGE"
        | "FIXED";

    discountValue: number;

    active: boolean;

}