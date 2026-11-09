import type { ServiceTag } from "./ServiceTag";
import type {
    ServiceDetailSection
} from "./ServiceDetailSection";

import type {
    CateringDetailsForm
} from "./CateringDetailsForm";

export interface VendorServiceForm {

    /* =====================================
       COMMON INFORMATION
    ===================================== */

    category: string;

    serviceName: string;

    location: string;

    categoryTags: string[];

    locationTags: string[];

    address: string;

    capacity: string;

    description: string;

    durationHours: string;


    /* =====================================
       CONTACT INFORMATION
    ===================================== */

    contactPerson: string;

    mobile: string;

    email: string;


    /* =====================================
       AVAILABILITY
    ===================================== */

    availableFrom: string;

    availableTo: string;


    /* =====================================
       BOOKING SETTINGS
    ===================================== */

    maxSimultaneousBookings: string;

    bundleOfferEnabled: boolean;


    /* =====================================
       COMMON COLLECTIONS
    ===================================== */

    facilities: string[];

    amenities: string[];

    imageUrls: string[];


    /* =====================================
       CATEGORY-SPECIFIC DETAILS
    ===================================== */

    detailSections: ServiceDetailSection[];

    cateringDetails?: CateringDetailsForm;

}