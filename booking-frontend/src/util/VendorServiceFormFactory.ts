import type { VendorServiceForm } from "../types/VendorServiceForm";

export default class VendorServiceFormFactory {

    static create(category: string): VendorServiceForm {

        return {

            category,

            serviceName: "",

            location: "",

            price: "",

            capacity: "",

            durationHours: "8",

            description: "",

            contactPerson: "",

            mobile: "",

            email: "",

            availableFrom: "",

            availableTo: "",

            maxSimultaneousBookings: "1",

            bundleOfferEnabled: false,

            amenities: [],

            imageUrls: [],

            attributes: [],

            hallCapacity: "",

            diningCapacity: "",

            parkingCapacity: "",

            rooms: "",

            parking: false,

            acHall: false,

            generator: false,

            diningHall: false,

            outdoorVenue: false,

            bridalRoom: false

        };

    }

}