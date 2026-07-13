import type { ContactInfo } from "./ContactInfo";
import type { Availability } from "./Availability";
import type { BookingSettings } from "./BookingSettings";
import type { ServiceAttribute } from "./ServiceAttribute";

export interface VendorService {

    id: string;

    serviceName: string;

    category: string;

    description: string;

    price: number;

    capacity: number;

    durationHours: number;

    active: boolean;

    featured: boolean;

    contactInfo: ContactInfo;

    availability: Availability;

    bookingSettings: BookingSettings;

    imageUrls: string[];

    amenities: string[];

    attributes: ServiceAttribute[];

}