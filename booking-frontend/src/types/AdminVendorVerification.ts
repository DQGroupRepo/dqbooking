export type VendorVerificationStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "SUSPENDED";

export type ServiceModerationStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "SUSPENDED";

/* const discoveryOptions = [
    {
        key: "FEATURED",
        label: "Featured"
    },
    {
        key: "TRENDING_NOW",
        label: "Trending Now"
    },
    {
        key: "MOST_BOOKED",
        label: "Most Booked"
    }
]; */

export interface AdminVendorService {
    serviceId: string;
    serviceName: string;
    category?: string;
    moderationStatus: ServiceModerationStatus;
    active: boolean;
    deleted: boolean;
    discoveryTags?: string[];
}

export interface AdminVendorVerification {
    vendorId: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone?: string;
    city?: string;
    address?: string;
    verificationStatus: VendorVerificationStatus;
    verified: boolean;
    services: AdminVendorService[];
}