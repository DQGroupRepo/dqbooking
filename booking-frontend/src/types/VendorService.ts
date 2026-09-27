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

export type ModerationStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export interface ServicePackage {

    id: string;

    type: string;

    price: number;

    features: string[];

    active: boolean;

}



export interface VendorService {
  id: string;

  serviceId?: string;

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

  amenities: string[];


    /* =====================================
       GENERIC CATEGORY DETAILS
    ===================================== */

    detailSections: ServiceDetailSection[];

    cateringDetails?: CateringDetailsForm;


    /* =====================================
       SERVICE PACKAGES
    ===================================== */

    packages?: ServicePackage[];


  location: string;


    /* =====================================
       OPTIONAL DISPLAY FIELDS
    ===================================== */

    rating?: number;

    reviewCount?: number;

    moderationStatus?: ModerationStatus;

}

