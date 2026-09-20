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

            category:
                service.category,

            serviceName:
                service.serviceName,

            location:
                service.location,

            capacity:
                service.capacity?.toString() ?? "",

            durationHours:
                service.durationHours?.toString() ?? "",

            description:
                service.description ?? "",


            /* CONTACT */

            contactPerson:
                service.contactInfo
                    ?.contactPerson ?? "",

            mobile:
                service.contactInfo
                    ?.mobile ?? "",

            email:
                service.contactInfo
                    ?.email ?? "",

            address:
                service.contactInfo
                        ?.address ?? "",
            /* AVAILABILITY */

            availableFrom:
                service.availability
                    ?.availableFrom ?? "",

            availableTo:
                service.availability
                    ?.availableTo ?? "",


            /* BOOKING SETTINGS */

            maxSimultaneousBookings:

                service.bookingSettings
                    ?.maxSimultaneousBookings
                    ?.toString() ?? "",

            bundleOfferEnabled:

                service.bookingSettings
                    ?.bundleOfferEnabled ?? false,


            /* MEDIA */

            imageUrls:
                service.imageUrls ?? [],


            /* AMENITIES */

            amenities:
                service.amenities ?? [],


            /* DETAILS */

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

            capacity:
                Number(
                    form.capacity
                ),

            durationHours:
                Number(
                    form.durationHours
                ),


            /* CONTACT */

            contactInfo: {

                contactPerson:
                    form.contactPerson,

                mobile:
                    form.mobile,

                email:
                    form.email,
                address:
                    form.address,


            },


            /* AVAILABILITY */

            availability: {

                availableFrom:
                    form.availableFrom,

                availableTo:
                    form.availableTo

            },


            /* BOOKING SETTINGS */

            bookingSettings: {

                maxSimultaneousBookings:

                    Number(
                        form.maxSimultaneousBookings
                    ),

                bundleOfferEnabled:
                    form.bundleOfferEnabled

            },


            /* MEDIA */

            imageUrls:
                form.imageUrls,


            /* AMENITIES */

            amenities:
                form.amenities,


            /* DETAIL SECTIONS */

            detailSections:
                form.detailSections

        };

    }

}