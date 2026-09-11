import type {
    VendorServiceForm
} from "../types/VendorServiceForm";


export default class VendorServiceFormFactory {


    static create(
        category: string
    ): VendorServiceForm {

        return {

            /* =====================================
               COMMON INFORMATION
            ===================================== */

            category,

            serviceName: "",

            location: "",

            price: "",

            capacity: "",

            durationHours: "8",

            description: "",


            /* =====================================
               CONTACT
            ===================================== */

            contactPerson: "",

            mobile: "",

            email: "",


            /* =====================================
               AVAILABILITY
            ===================================== */

            availableFrom: "",

            availableTo: "",


            /* =====================================
               BOOKING SETTINGS
            ===================================== */

            maxSimultaneousBookings: "1",

            bundleOfferEnabled: false,


            /* =====================================
               COMMON COLLECTIONS
            ===================================== */

            amenities: [],

            imageUrls: [],


            /* =====================================
               CATEGORY-SPECIFIC DETAILS
            ===================================== */

            detailSections: []

        };

    }

}