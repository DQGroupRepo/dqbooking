import type {
    VendorServiceForm
} from "../types/VendorServiceForm";

import type {
    CateringDetailsForm
} from "../types/CateringDetailsForm";

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

            categoryTags: [],

            locationTags: [],

            address: "",

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

            detailSections: [],

            cateringDetails:
                category.toLowerCase().trim() === "catering"

                    ? {

                        vegetarian: false,

                        nonVegetarian: false,

                        cuisines: [],

                        menuItems: [],

                        providesCateringStaff: false,

                        staffCostPerPerson: "",

                        maximumServiceDistanceKm: ""

                    }

                    : undefined,

        };

    }

}