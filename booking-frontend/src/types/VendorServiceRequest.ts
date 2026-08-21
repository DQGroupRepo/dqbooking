import type { ContactInfo } from "./ContactInfo";
import type { Availability } from "./Availability";
import type { BookingSettings } from "./BookingSettings";
import type { ServiceAttribute } from "./ServiceAttribute";
import type { ServicePackageRequest } from "./ServicePackageRequest";

export interface VendorServiceRequest {

    serviceName: string;

    category: string;

    location: string;

    description: string;

    price: number;

    capacity: number;

    durationHours: number;

    contactInfo: ContactInfo;

    availability: Availability;

    bookingSettings: BookingSettings;

    imageUrls: string[];

    amenities: string[];

    attributes: ServiceAttribute[];

    packages?: ServicePackageRequest[];

}