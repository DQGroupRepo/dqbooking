import api
    from "../api/axiosConfig";

import type {
    VendorListing
} from "../types/VendorListing";


class CustomerService {


    /*
     * =========================================
     * ALL SERVICES
     * =========================================
     */

    async getServices(
        category?: string
    ): Promise<VendorListing[]> {

        const response =
            await api.get<VendorListing[]>(
                "/customer/services",
                {
                    params: {
                        category
                    }
                }
            );

        return response.data;

    }


    /*
     * =========================================
     * FEATURED
     * =========================================
     */

    async getFeaturedServices():
        Promise<VendorListing[]> {

        const response =
            await api.get<VendorListing[]>(
                "/customer/services/featured"
            );

        return response.data;

    }


    /*
     * =========================================
     * POPULAR HALLS
     * =========================================
     */

    async getPopularHalls():
        Promise<VendorListing[]> {

        const response =
            await api.get<VendorListing[]>(
                "/customer/services/popular-halls"
            );

        return response.data;

    }


    /*
     * =========================================
     * TOP BRIDAL MAKEUP
     * =========================================
     */

    async getTopBridalMakeup():
        Promise<VendorListing[]> {

        const response =
            await api.get<VendorListing[]>(
                "/customer/services/top-bridal-makeup"
            );

        return response.data;

    }


    /*
     * =========================================
     * PROFESSIONAL PHOTOGRAPHY
     * =========================================
     */

    async getProfessionalPhotography():
        Promise<VendorListing[]> {

        const response =
            await api.get<VendorListing[]>(
                "/customer/services/professional-photography"
            );

        return response.data;

    }


    /*
     * =========================================
     * WEDDING VIDEOGRAPHY
     * =========================================
     */

    async getWeddingVideography():
        Promise<VendorListing[]> {

        const response =
            await api.get<VendorListing[]>(
                "/customer/services/wedding-videography"
            );

        return response.data;

    }


}


export default new CustomerService();