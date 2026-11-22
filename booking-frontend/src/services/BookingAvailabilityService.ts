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
        date: string,
        resourceTypeId?: string | null
    ): Promise<SlotAvailability[]> {

        const response =
            await api.get(
                `/services/${serviceId}/availability`,
                {
                    params: {
                        date,
                        ...(resourceTypeId ? { resourceTypeId } : {})
                    }
                }
            );

        return response.data;

    }


    async getBeautyAppointmentOptions(serviceId: string, date: string, durationMinutes: number): Promise<{ startTime: string; endTime: string; durationMinutes: number; available: boolean; remainingCapacity: number }[]> {
        const response = await api.get(`/services/${serviceId}/availability/beauty`, { params: { date, durationMinutes } });
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
        holdId: string
    ): Promise<void> {

        await api.delete(
            `/services/${serviceId}/availability/hold/${holdId}`
        );
    }

}


export default new BookingAvailabilityService();