export interface VendorServiceForm {

    /* =====================================
       Common Information
    ===================================== */

    category: string;

    serviceName: string;

    location: string;

    price: string;

    capacity: string;

    description: string;

    /* =====================================
       Contact Information
    ===================================== */

    contactPerson: string;

    mobile: string;

    email: string;

    /* =====================================
       Availability
    ===================================== */

    availableFrom: string;

    availableTo: string;

    /* =====================================
       Booking Settings
    ===================================== */

    maxSimultaneousBookings: string;

    bundleOfferEnabled: boolean;

    /* =====================================
       Hall
    ===================================== */

    hallCapacity?: string;

    diningCapacity?: string;

    parkingCapacity?: string;

    rooms?: string;

    parking?: boolean;

    acHall?: boolean;

    generator?: boolean;

    diningHall?: boolean;

    outdoorVenue?: boolean;

    bridalRoom?: boolean;

    /* =====================================
       Catering
    ===================================== */

    cuisine?: string;

    foodType?: string;

    minimumGuests?: string;

    maximumGuests?: string;

    buffetService?: boolean;

    plateService?: boolean;

    liveCounters?: boolean;

    outsideCatering?: boolean;

    /* =====================================
       Photography
    ===================================== */

    teamSize?: string;

    deliveryTime?: string;

    droneAvailable?: boolean;

    cinematicVideo?: boolean;

    albumIncluded?: boolean;

    rawFilesIncluded?: boolean;

    /* =====================================
       Decoration
    ===================================== */

    floralDecoration?: boolean;

    balloonDecoration?: boolean;

    stageDecoration?: boolean;

    lighting?: boolean;

    mandapDecoration?: boolean;

    themeDecoration?: boolean;

    /* =====================================
       Makeup
    ===================================== */

    brandsUsed?: string;

    homeService?: boolean;

    trialAvailable?: boolean;

    bridalMakeup?: boolean;

    groomMakeup?: boolean;

}