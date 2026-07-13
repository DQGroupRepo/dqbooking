import type { VendorServiceForm } from "../types/VendorServiceForm";

export default function calculateListingProgress(

    formData: VendorServiceForm,

    amenities: string[],

    images: File[]

) {

    let completed = 0;

    const total = 7;

    // Basic Information

    if (

        formData.serviceName &&
        formData.location &&
        formData.price &&
        formData.description

    ) {

        completed++;

    }

    // Category Details

    switch (formData.category) {

        case "hall":

            if (
                formData.hallCapacity ||
                formData.diningCapacity ||
                formData.rooms
            ) {

                completed++;

            }

            break;

        case "photography":

            completed++;

            break;

        case "makeup":

            completed++;

            break;

        case "decoration":

            completed++;

            break;

        case "catering":

            completed++;

            break;

    }

    // Amenities

    if (amenities.length > 0) {

        completed++;

    }

    // Gallery

    if (images.length > 0) {

        completed++;

    }

    // Contact

    if (

        formData.contactPerson &&
        formData.mobile &&
        formData.email

    ) {

        completed++;

    }

    // Availability

    if (

        formData.availableFrom &&
        formData.availableTo

    ) {

        completed++;

    }

    // Booking Settings

    if (formData.maxSimultaneousBookings) {

        completed++;

    }

    return Math.round((completed / total) * 100);

}