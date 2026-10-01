import api from "../api/axiosConfig";

import type {
    VendorServicePricing
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
    }

};


export default VendorPricingService;