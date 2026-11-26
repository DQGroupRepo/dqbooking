import type { ServiceTag } from "./ServiceTag";
import type { ContactInfo } from "./ContactInfo";

import type { Availability } from "./Availability";

import type { BookingSettings } from "./BookingSettings";

import type { ServicePackageRequest } from "./ServicePackageRequest";

import type { ServiceDetailSection } from "./ServiceDetailSection";

import type { CateringMenuItem } from "./CateringMenuItem";
import type { BeautyDetails } from "./BeautyDetails";

export interface VendorCateringDetailsRequest {
  vegetarian: boolean;
  nonVegetarian: boolean;
  cuisines: string[];
  menuItems: CateringMenuItem[];
  providesCateringStaff: boolean;
  staffCostPerPerson: number | null;
  maximumServiceDistanceKm: number | null;
}

export interface VendorServiceRequest {
  serviceName: string;

  category: string;

  location: string;

  tags: ServiceTag[];

  description: string;

  capacity: number;

  durationHours: number;

  /* =====================================
       COMMON DETAILS
    ===================================== */

  contactInfo: ContactInfo;

  availability: Availability;

  bookingSettings: BookingSettings;

  imageUrls: string[];

  facilities: string[];

  amenities: string[];

  /* =====================================
       GENERIC CATEGORY DETAILS
    ===================================== */

  detailSections: ServiceDetailSection[];

  cateringDetails?: VendorCateringDetailsRequest;

  beautyDetails?: BeautyDetails;

  /* =====================================
       PACKAGES
    ===================================== */

  packages?: ServicePackageRequest[];
}
