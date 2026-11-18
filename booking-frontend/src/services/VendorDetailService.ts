import api from "../api/axios";

import type { VendorDetail } from "../types/VendorDetail";
import type { VendorPricingForDate } from "../types/VendorPricingForDate";

const VendorDetailService = {

    async getById(
        serviceId: string
    ): Promise<VendorDetail> {

        const response =
            await api.get<VendorDetail>(
                `/customer/services/${serviceId}`
            );

        return response.data;
    },

    async getPricingForDate(
        serviceId: string,
        eventDate: string
    ): Promise<VendorPricingForDate> {

        const response =
            await api.get<VendorPricingForDate>(
                `/customer/services/${serviceId}/pricing`,
                {
                    params: {
                        eventDate
                    }
                }
            );

        return response.data;
    }

};

export default VendorDetailService;