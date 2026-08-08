export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: "CUSTOMER" | "VENDOR" | "ADMIN";
    status: "ACTIVE" | "INACTIVE";
    lastLogin?: string;
    createdAt?: string;
    active: boolean;
    deleted: boolean;
}