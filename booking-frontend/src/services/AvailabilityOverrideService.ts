import api from "../api/axiosConfig";
import type { AvailabilityOverride } from "../types/AvailabilityOverride";

class AvailabilityOverrideService {

    async getOverrides(

        serviceId: string,

        date: string

    ): Promise<AvailabilityOverride[]> {

        const response = await api.get<AvailabilityOverride[]>(

            `/vendor/services/${serviceId}/availability`,

            {

                params: {

                    date

                }

            }

        );

        return response.data;

    }

    async createOverride(

        serviceId: string,

        request: Omit<
            AvailabilityOverride,
            "id" | "serviceId"
        >

    ) {

        const response = await api.post(

            `/vendor/services/${serviceId}/availability`,

            request

        );

        return response.data;

    }

    async updateOverride(

        serviceId: string,

        overrideId: string,

        request: Partial<AvailabilityOverride>

    ) {

        const response = await api.put(

            `/vendor/services/${serviceId}/availability/${overrideId}`,

            request

        );

        return response.data;

    }

    async deleteOverride(

        serviceId: string,

        overrideId: string

    ) {

        await api.delete(

            `/vendor/services/${serviceId}/availability/${overrideId}`

        );

    }

}

export default new AvailabilityOverrideService();