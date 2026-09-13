import type { ContactInfo } from "./ContactInfo";
import type { Availability } from "./Availability";
import type { BookingSettings } from "./BookingSettings";
import type { ServiceAttribute } from "./ServiceAttribute";
import type { ServicePackage } from "./ServicePackage";

export interface VendorService {
  id: string;

  serviceId?: string;

  serviceName: string;

  category: string;

  description: string;

  price: number;

  capacity: number;

  durationHours: number;

  active: boolean;

  featured: boolean;

  pricingConfigured: boolean;

  contactInfo: ContactInfo;

  availability: Availability;

  bookingSettings: BookingSettings;

  imageUrls?: string[];

  amenities: string[];

  attributes: ServiceAttribute[];

  location: string;

  rating?: number;

  reviewCount?: number;

  packages?: ServicePackage[];
}
