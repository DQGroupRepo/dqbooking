export interface Bundle {
    id: string;
    vendorId: string;
    name: string;
    description?: string;
    serviceIds: string[];
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    active: boolean;
}

export interface CreateBundleRequest {
    name: string;
    description?: string;
    serviceIds: string[];
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
}
