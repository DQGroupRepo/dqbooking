export type VendorVerificationStatus =

    | "PENDING"

    | "APPROVED"

    | "REJECTED"

    | "SUSPENDED";


export interface VendorProfile {

    businessName: string;

    ownerName: string;

    email: string;

    phone: string;

    address: string;

    city: string;

    state: string;

    pincode: string;

    logo: string;

    accountHolder: string;

    bankName: string;

    accountNumber: string;

    ifsc: string;

    upiId: string;

    gstNumber: string;

    panNumber: string;

    businessLicense: string;


    /*
     * =========================================
     * VENDOR VERIFICATION
     * =========================================
     *
     * Single source of truth.
     *
     * PENDING
     * APPROVED
     * REJECTED
     * SUSPENDED
     */

    verificationStatus:
        VendorVerificationStatus;


    emailNotifications: boolean;

    smsNotifications: boolean;

    bookingAlerts: boolean;

    reviewAlerts: boolean;

    paymentAlerts: boolean;

    marketingEmails: boolean;

    description: string;

}