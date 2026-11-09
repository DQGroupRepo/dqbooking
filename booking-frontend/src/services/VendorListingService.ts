import api from "../api/axiosConfig";
import type { VendorListing } from "../types/VendorListing";

class VendorListingService {

    async getListings(
        category?: string,
        location?: string,
        categoryTag?: string
    ): Promise<VendorListing[]> {

        const response =
            await api.get<VendorListing[]>(
                "/customer/services",
                {
                    params: (location || categoryTag)
                        ? { location, categoryTag }
                        : category ? { category } : undefined
                }
            );

        return response.data;

    }

}

export default new VendorListingService();