import type {
    VendorService
} from "../types/VendorService";

import type {
    VendorServiceForm
} from "../types/VendorServiceForm";

import type {
    VendorServiceRequest
} from "../types/VendorServiceRequest";


export default class VendorServiceMapper {


    /*
     * =====================================
     * RESPONSE → FORM
     * =====================================
     */

    static responseToForm(
        service: VendorService
    ): VendorServiceForm {

        return {

            /* =============================
               BASIC INFORMATION
            ============================= */

            category:
                service.category,

            serviceName:
                service.serviceName,

            location:
                service.location,

            price:
                service.price?.toString() ?? "",

            capacity:
                service.capacity?.toString() ?? "",

            durationHours:
                service.durationHours?.toString() ?? "",

            description:
                service.description ?? "",


            /* =============================
               CONTACT
            ============================= */

            contactPerson:
                service.contactInfo
                    ?.contactPerson ?? "",

            mobile:
                service.contactInfo
                    ?.mobile ?? "",

            email:
                service.contactInfo
                    ?.email ?? "",


            /* =============================
               AVAILABILITY
            ============================= */

            availableFrom:
                service.availability
                    ?.availableFrom ?? "",

            availableTo:
                service.availability
                    ?.availableTo ?? "",


            /* =============================
               BOOKING SETTINGS
            ============================= */

            maxSimultaneousBookings:

                service.bookingSettings
                    ?.maxSimultaneousBookings
                    ?.toString() ?? "",

            bundleOfferEnabled:

                service.bookingSettings
                    ?.bundleOfferEnabled ?? false,


            /* =============================
               MEDIA
            ============================= */

            imageUrls:
                service.imageUrls ?? [],


            /* =============================
               AMENITIES
            ============================= */

            amenities:
                service.amenities ?? [],


            /* =============================
               GENERIC DETAIL SECTIONS
            ============================= */

            detailSections:
                service.detailSections ?? []

        };

    }


    /*
     * =====================================
     * FORM → REQUEST
     * =====================================
     */

    static formToRequest(
        form: VendorServiceForm
    ): VendorServiceRequest {

        return {

            serviceName:
                form.serviceName,

            category:
                form.category
                    .toUpperCase(),

            location:
                form.location,

            description:
                form.description,

            price:
                Number(
                    form.price
                ),

            capacity:
                Number(
                    form.capacity
                ),

            durationHours:
                Number(
                    form.durationHours
                ),


            /* =============================
               CONTACT
            ============================= */

            contactInfo: {

                contactPerson:
                    form.contactPerson,

                mobile:
                    form.mobile,

                email:
                    form.email

            },


            /* =============================
               AVAILABILITY
            ============================= */

            availability: {

                availableFrom:
                    form.availableFrom,

                availableTo:
                    form.availableTo

            },


            /* =============================
               BOOKING SETTINGS
            ============================= */

            bookingSettings: {

                maxSimultaneousBookings:

                    Number(
                        form.maxSimultaneousBookings
                    ),

                bundleOfferEnabled:
                    form.bundleOfferEnabled

            },


            /* =============================
               MEDIA
            ============================= */

            imageUrls:
                form.imageUrls,


            /* =============================
               AMENITIES
            ============================= */

            amenities:
                form.amenities,


            /* =============================
               GENERIC DETAIL SECTIONS
            ============================= */

            detailSections:
                form.detailSections

        };

    }

}