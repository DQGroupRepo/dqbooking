import type { VendorService } from "../types/VendorService";
import type { VendorServiceForm } from "../types/VendorServiceForm";
import type { VendorServiceRequest } from "../types/VendorServiceRequest";

export default class VendorServiceMapper {

    static responseToForm(
        service: VendorService
    ): VendorServiceForm {

        const attributeMap = new Map(
            service.attributes.map(attribute => [
                attribute.key,
                attribute.value
            ])
        );

        return {

            category: service.category,

            serviceName: service.serviceName,

            location: service.location,

            price: service.price.toString(),

            capacity: service.capacity.toString(),

            durationHours: service.durationHours.toString(),

            description: service.description,

            contactPerson: service.contactInfo.contactPerson,

            mobile: service.contactInfo.mobile,

            email: service.contactInfo.email,

            availableFrom: service.availability.availableFrom,

            availableTo: service.availability.availableTo,

            maxSimultaneousBookings:
                service.bookingSettings.maxSimultaneousBookings.toString(),

            bundleOfferEnabled:
                service.bookingSettings.bundleOfferEnabled,

            amenities: service.amenities,

            imageUrls: service.imageUrls,

            attributes: service.attributes,

            hallCapacity:
                attributeMap.get("hallCapacity") ?? "",

            diningCapacity:
                attributeMap.get("diningCapacity") ?? "",

            parkingCapacity:
                attributeMap.get("parkingCapacity") ?? "",

            rooms:
                attributeMap.get("rooms") ?? "",

            parking:
                attributeMap.get("parking") === "true",

            acHall:
                attributeMap.get("acHall") === "true",

            generator:
                attributeMap.get("generator") === "true",

            diningHall:
                attributeMap.get("diningHall") === "true",

            outdoorVenue:
                attributeMap.get("outdoorVenue") === "true",

            bridalRoom:
                attributeMap.get("bridalRoom") === "true"

        };

    }

    static formToRequest(
        form: VendorServiceForm
    ): VendorServiceRequest {

        return {

            serviceName: form.serviceName,

            category: form.category.toUpperCase(),

            location: form.location,

            description: form.description,

            price: Number(form.price),

            capacity: Number(form.capacity),

            durationHours: Number(form.durationHours),

            contactInfo: {

                contactPerson: form.contactPerson,

                mobile: form.mobile,

                email: form.email

            },

            availability: {

                availableFrom: form.availableFrom,

                availableTo: form.availableTo

            },

            bookingSettings: {

                maxSimultaneousBookings:
                    Number(form.maxSimultaneousBookings),

                bundleOfferEnabled:
                    form.bundleOfferEnabled

            },

            imageUrls: form.imageUrls,

            amenities: form.amenities,

            attributes:
                this.buildAttributes(form)

        };

    }

    static buildAttributes(
        form: VendorServiceForm
    ) {

        const attributes:
            VendorServiceRequest["attributes"] = [];

        if (form.category.toLowerCase() === "hall") {

            this.add(attributes, "hallCapacity", form.hallCapacity);

            this.add(attributes, "diningCapacity", form.diningCapacity);

            this.add(attributes, "parkingCapacity", form.parkingCapacity);

            this.add(attributes, "rooms", form.rooms);

            this.add(attributes, "parking", form.parking);

            this.add(attributes, "acHall", form.acHall);

            this.add(attributes, "generator", form.generator);

            this.add(attributes, "diningHall", form.diningHall);

            this.add(attributes, "outdoorVenue", form.outdoorVenue);

            this.add(attributes, "bridalRoom", form.bridalRoom);

        }

        return attributes;

    }

    private static add(

        attributes:
            VendorServiceRequest["attributes"],

        key: string,

        value: unknown

    ) {

        if (value === undefined || value === "")
            return;

        attributes.push({

            key,

            value: String(value)

        });

    }

}