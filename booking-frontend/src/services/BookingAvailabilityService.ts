import api from "../api/axiosConfig";

import type {
    SlotAvailability
} from "../types/SlotAvailability";

import type {
    BookingHoldRequest,
    BookingHoldResponse
} from "../types/BookingHold";


class BookingAvailabilityService {

    /*
     * =========================================
     * GET SLOT AVAILABILITY
     * =========================================
     */

    async getSlotAvailability(
        serviceId: string,
        date: string
    ): Promise<SlotAvailability[]> {

        const response =
            await api.get(
                `/services/${serviceId}/availability`,
                {
                    params: {
                        date
                    }
                }
            );

        return response.data;

    }


    /*
     * =========================================
     * HOLD SLOT
     * =========================================
     */

    async holdSlot(
        request: BookingHoldRequest
    ): Promise<BookingHoldResponse> {

        const response =
            await api.post(
                `/services/${request.serviceId}/availability/hold`,
                request
            );

        return response.data;
    }

}


export default new BookingAvailabilityService();