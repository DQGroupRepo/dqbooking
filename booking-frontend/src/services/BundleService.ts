import api from "../api/axiosConfig";

import type { Bundle } from "../types/Bundle";

export interface CreateBundleRequest {
    name: string;
    description?: string;
    serviceIds: string[];
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
}


const BundleService = {

    /*
     * =========================================
     * GET VENDOR BUNDLES
     * =========================================
     */

    getVendorBundles: async (): Promise<Bundle[]> => {

        const response =
            await api.get<Bundle[]>(
                "/bundles/vendor"
            );

        return response.data;
    },


    /*
     * =========================================
     * GET BUNDLES FOR SERVICE
     * =========================================
     *
     * Customer-facing.
     *
     * Returns all active bundles which contain
     * the selected service.
     */

    getBundlesForService: async (
        serviceId: string
    ): Promise<Bundle[]> => {

        const response =
            await api.get<Bundle[]>(
                `/bundles/service/${serviceId}`
            );

        return response.data;
    },


    /*
     * =========================================
     * CREATE
     * =========================================
     */

    createBundle: async (
        request: CreateBundleRequest
    ): Promise<Bundle> => {

        const response =
            await api.post<Bundle>(
                "/bundles",
                request
            );

        return response.data;
    },


    /*
     * =========================================
     * UPDATE
     * =========================================
     */

    updateBundle: async (
        bundleId: string,
        request: CreateBundleRequest
    ): Promise<Bundle> => {

        const response =
            await api.put<Bundle>(
                `/bundles/${bundleId}`,
                request
            );

        return response.data;
    },


    /*
     * =========================================
     * ACTIVATE
     * =========================================
     */

    activateBundle: async (
        bundleId: string
    ): Promise<Bundle> => {

        const response =
            await api.patch<Bundle>(
                `/bundles/${bundleId}/activate`
            );

        return response.data;
    },


    /*
     * =========================================
     * DEACTIVATE
     * =========================================
     */

    deactivateBundle: async (
        bundleId: string
    ): Promise<Bundle> => {

        const response =
            await api.patch<Bundle>(
                `/bundles/${bundleId}/deactivate`
            );

        return response.data;
    }

};


export default BundleService;