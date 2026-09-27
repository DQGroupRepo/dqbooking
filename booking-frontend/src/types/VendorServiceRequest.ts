import type {
    ContactInfo
} from "./ContactInfo";

import type {
    Availability
} from "./Availability";

import type {
    BookingSettings
} from "./BookingSettings";

import type {
    ServicePackageRequest
} from "./ServicePackageRequest";

import type {
    ServiceDetailSection
} from "./ServiceDetailSection";


export interface VendorServiceRequest {

    serviceName: string;

    category: string;

    location: string;

    description: string;

    price: number;

    capacity: number;

    durationHours: number;


    /* =====================================
       COMMON DETAILS
    ===================================== */

    contactInfo: ContactInfo;

    availability: Availability;

    bookingSettings: BookingSettings;

    imageUrls: string[];

    amenities: string[];


    /* =====================================
       GENERIC CATEGORY DETAILS
    ===================================== */

    detailSections: ServiceDetailSection[];


    /* =====================================
       PACKAGES
    ===================================== */

    packages?: ServicePackageRequest[];

}