import type {
    ServiceDetailSection
} from "./ServiceDetailSection";


export interface VendorServiceForm {

    /* =====================================
       COMMON INFORMATION
    ===================================== */

    category: string;

    serviceName: string;

    location: string;

    price: string;

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

    amenities: string[];

    imageUrls: string[];


    /* =====================================
       CATEGORY-SPECIFIC DETAILS

       Generic structure.

       Examples:

       Hall:
       - Hall Information
       - Venue Facilities

       Photography:
       - Photography Information
       - Photography Services

       Decoration:
       - Decoration Information
       - Decoration Services
    ===================================== */

    detailSections: ServiceDetailSection[];

}