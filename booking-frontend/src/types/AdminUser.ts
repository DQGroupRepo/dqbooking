export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role:
        | "CUSTOMER"
        | "VENDOR_ADMIN"
        | "VENDOR_USER"
        | "ADMIN";
    status: "ACTIVE" | "INACTIVE";
    lastLogin?: string;
    createdAt?: string;
    active: boolean;
    deleted: boolean;
}