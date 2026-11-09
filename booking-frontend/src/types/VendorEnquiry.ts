export interface VendorEnquiry {
    id: string;
    customerName: string;
    contactNumber: string;
    serviceId: string;
    serviceName: string;
    eventDate: string;
    notes?: string | null;
    followUpDate?: string | null;
    reminderSentAt?: string | null;
    createdAt?: string | null;
}

export interface CreateVendorEnquiryRequest {
    customerName: string;
    contactNumber: string;
    serviceId: string;
    eventDate: string;
    notes?: string;
    followUpDate?: string;
}
