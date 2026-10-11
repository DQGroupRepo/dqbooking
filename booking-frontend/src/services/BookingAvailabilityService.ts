import api from "../api/axios";

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


    /*
     * =========================================
     * RELEASE TEMPORARY HOLD
     * =========================================
     */

    async releaseHold(
        serviceId: string,
        holdId: string,
        authToken?: string | null
    ): Promise<void> {

        await api.delete(
            `/services/${serviceId}/availability/hold/${holdId}`,
            authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined
        );
    }

}


export default new BookingAvailabilityService();