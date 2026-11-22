import type { VendorService } from "../types/VendorService";

import type { VendorServiceForm } from "../types/VendorServiceForm";

import type { VendorServiceRequest } from "../types/VendorServiceRequest";

export default class VendorServiceMapper {
  /*
   * =====================================
   * RESPONSE → FORM
   * =====================================
   */

  static responseToForm(service: VendorService): VendorServiceForm {
    return {
      category: service.category,

      serviceName: service.serviceName,

      location: service.location,

      categoryTags: (service.tags ?? []).filter(t => t.type === "CATEGORY").map(t => t.value),

      locationTags: (service.tags ?? []).filter(t => t.type === "LOCATION").map(t => t.value),

      capacity: service.capacity?.toString() ?? "",

      durationHours: service.durationHours?.toString() ?? "",

      description: service.description ?? "",

      /* CONTACT */

      contactPerson: service.contactInfo?.contactPerson ?? "",

      mobile: service.contactInfo?.mobile ?? "",

      email: service.contactInfo?.email ?? "",

      address: service.contactInfo?.address ?? "",

      /* AVAILABILITY */

      availableFrom: service.availability?.availableFrom ?? "",

      availableTo: service.availability?.availableTo ?? "",

      /* BOOKING SETTINGS */

      maxSimultaneousBookings:
        service.bookingSettings?.maxSimultaneousBookings?.toString() ?? "",

      bundleOfferEnabled: service.bookingSettings?.bundleOfferEnabled ?? false,

      /* MEDIA */

      imageUrls: service.imageUrls ?? [],

      /* FACILITIES AND AMENITIES */

      facilities: service.facilities ?? [],

      amenities: service.amenities ?? [],

      /* DETAILS */

      detailSections: service.detailSections ?? [],

      beautyDetails: service.category?.toUpperCase() === "MAKEUP" ? (service.beautyDetails ?? {
        openingTime: "09:00", closingTime: "18:00",
        services: [], durationRules: [], breaks: [],
      }) : undefined,

      /* CATERING DETAILS */

      cateringDetails:
        service.category?.toLowerCase().trim() === "catering"
          ? {
              vegetarian: service.cateringDetails?.vegetarian ?? false,

              nonVegetarian: service.cateringDetails?.nonVegetarian ?? false,

              cuisines: service.cateringDetails?.cuisines ?? [],

              /*
               * Catering menu is stored separately
               * through VendorCateringMenuService.
               *
               * It is intentionally initialized empty
               * here and loaded separately when required.
               */
              menuItems: [],

              providesCateringStaff:
                service.cateringDetails?.providesCateringStaff ?? false,

              staffCostPerPerson:
                service.cateringDetails?.staffCostPerPerson?.toString() ?? "",

              maximumServiceDistanceKm:
                service.cateringDetails?.maximumServiceDistanceKm?.toString() ??
                "",
            }
          : undefined,
    };
  }

  /*
   * =====================================
   * FORM → REQUEST
   * =====================================
   */

  static formToRequest(form: VendorServiceForm): VendorServiceRequest {
    return {
      serviceName: form.serviceName,

      category: form.category.toUpperCase(),

      location: form.location,

      tags: [
        ...form.categoryTags.map(value => ({ type: "CATEGORY" as const, value, normalizedName: value.trim().toLowerCase(), aliases: [] })),
        ...form.locationTags.map(value => ({ type: "LOCATION" as const, value, normalizedName: value.trim().toLowerCase(), aliases: [] })),
      ],

      description: form.description,

      capacity: Number(form.capacity),

      durationHours: Number(form.durationHours),

      /* CONTACT */

      contactInfo: {
        contactPerson: form.contactPerson,

        mobile: form.mobile,

        email: form.email,

        address: form.address,
      },

      /* AVAILABILITY */

      availability: {
        availableFrom: form.availableFrom,

        availableTo: form.availableTo,
      },

      /* BOOKING SETTINGS */

      bookingSettings: {
        maxSimultaneousBookings: Number(form.maxSimultaneousBookings),

        bundleOfferEnabled: form.bundleOfferEnabled,
      },

      /* MEDIA */

      imageUrls: form.imageUrls,

      /* FACILITIES AND AMENITIES */

      facilities: form.facilities,

      amenities: form.amenities,

      /* DETAIL SECTIONS */

      detailSections: form.detailSections,

      beautyDetails: form.category.toUpperCase() === "MAKEUP" ? form.beautyDetails : undefined,

      /* CATERING DETAILS */

      cateringDetails: form.cateringDetails
        ? {
            vegetarian: form.cateringDetails.vegetarian,

            nonVegetarian: form.cateringDetails.nonVegetarian,

            cuisines: form.cateringDetails.cuisines,

            menuItems: form.cateringDetails.menuItems,

            providesCateringStaff: form.cateringDetails.providesCateringStaff,

            staffCostPerPerson:
              form.cateringDetails.staffCostPerPerson === ""
                ? null
                : Number(form.cateringDetails.staffCostPerPerson),

            maximumServiceDistanceKm:
              form.cateringDetails.maximumServiceDistanceKm === ""
                ? null
                : Number(form.cateringDetails.maximumServiceDistanceKm),
          }
        : undefined,
    };
  }
}
