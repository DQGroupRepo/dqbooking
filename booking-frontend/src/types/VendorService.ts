import type { ServiceTag } from "./ServiceTag";
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
    ServiceDetailSection
} from "./ServiceDetailSection";

import type {
    CateringDetailsForm
} from "./CateringDetailsForm";

import type {
    ServicePackage
} from "./ServicePackage";

export type ModerationStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export interface VendorService {

    id: string;

    serviceName: string;

    category: string;

    description: string;

    startingPrice?: number;

    capacity: number;

    durationHours: number;

    active: boolean;

    featured: boolean;

    pricingConfigured: boolean;


    /* =====================================
       COMMON DETAILS
    ===================================== */

    contactInfo: ContactInfo;

    availability: Availability;

    bookingSettings: BookingSettings;

    imageUrls?: string[];

    facilities?: string[];

    amenities: string[];

    // Pricing-version packages returned with service details.
    packages?: ServicePackage[];


    /* =====================================
       GENERIC CATEGORY DETAILS
    ===================================== */

    detailSections: ServiceDetailSection[];

    cateringDetails?: CateringDetailsForm;

    location: string;

    tags?: ServiceTag[];


    /* =====================================
       OPTIONAL DISPLAY FIELDS
    ===================================== */

    rating?: number;

    reviewCount?: number;

    moderationStatus?: ModerationStatus;

}
