import api from "../api/axiosConfig";

import type {
    VendorServicePricing
} from "../types/VendorPricing";

const VendorPricingService = {

    async getPricing(serviceId: string) {

        const response =
            await api.get<VendorServicePricing>(
                `/pricing/services/${serviceId}`
            );

        return response.data;
    },

    async savePricing(
        pricing: VendorServicePricing
    ) {

        const response =
            await api.post<VendorServicePricing>(
                "/pricing",
                pricing
            );

        return response.data;
    }

};

export default VendorPricingService;