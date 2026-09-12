import type { ContactInfo }
    from "./ContactInfo";

import type { Availability }
    from "./Availability";

import type { BookingSettings }
    from "./BookingSettings";

import type { ServicePackage }
    from "./ServicePackage";

export interface DetailAttribute {

    key: string;

    value: string;

}


export interface DetailSection {

    key: string;

    title: string;

    attributes:
        DetailAttribute[];

}


export interface Availability {

    availableFrom?: string;

    availableTo?: string;

}


export interface ContactInfo {

    contactPerson?: string;

    mobile?: string;

    email?: string;

}


export interface BookingSettings {

    maxSimultaneousBookings?: number;

    bundleOfferEnabled?: boolean;

}


export interface VendorDetail {

    serviceId: string;

    vendorId: string;

    businessName: string;

    serviceName: string;

    description: string;

    category: string;

    city: string;

    location?: string;

    startingPrice: number;

    rating?: number;

    reviewCount?: number;

    capacity?: number;

    imageUrls?: string[];

    amenities?: string[];

    detailSections?: DetailSection[];

    contactInfo?: ContactInfo;

    bookingSettings?: BookingSettings;

    availability?: Availability;

    packages?: ServicePackage[];

}