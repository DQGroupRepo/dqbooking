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
    pendingSettingsCount?: number;
    services: AdminVendorService[];
}