import api from "../api/axiosConfig";

import type {
    VendorServicePricing, PricingVersionSummary
} from "../types/VendorPricing";

import type {
    ServicePackage
} from "../types/ServicePackage";


const VendorPricingService = {

    async getPricing(
        serviceId: string
    ) {

        const response =
            await api.get<VendorServicePricing>(
                `/pricing/services/${serviceId}`
            );

        return response.data;
    },


    async savePricing(
        serviceId: string,
        pricing: VendorServicePricing,
        packages: ServicePackage[]
    ) {

        const request = {

            ...pricing,

            serviceId,

            packages

        };

        const response =
            await api.post<VendorServicePricing>(
                "/pricing",
                request
            );

        return response.data;
    },

    async getPricingVersions(
        serviceId: string
    ): Promise<PricingVersionSummary[]> {

        const response =
            await api.get(
                `/pricing/services/${serviceId}/versions`
            );

        return response.data;
    },


    async getPricingById(
        pricingId: string
    ): Promise<VendorServicePricing> {

        const response =
            await api.get<VendorServicePricing>(
                `/pricing/${pricingId}`
            );

        return response.data;
    },

};


export default VendorPricingService;