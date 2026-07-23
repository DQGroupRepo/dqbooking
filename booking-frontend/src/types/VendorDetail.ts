import type { ContactInfo }
    from "./ContactInfo";

import type { Availability }
    from "./Availability";

import type { BookingSettings }
    from "./BookingSettings";

import type { ServicePackage }
    from "./ServicePackage";

export interface VendorDetail {

    serviceId: string;

    vendorId: string;

    businessName: string;

    serviceName: string;

    description: string;

    category: string;

    city: string;

    startingPrice: number;

    rating: number;

    reviewCount: number;

    capacity: number;

    imageUrls?: string[];

    amenities: string[];

    packages: ServicePackage[];

    contactInfo: ContactInfo;

    bookingSettings: BookingSettings;

    availability: Availability;

}