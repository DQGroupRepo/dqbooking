import api from "../api/axiosConfig";
import type { VendorListing } from "../types/VendorListing";

class VendorListingService {

    async getListings(
        category?: string
    ): Promise<VendorListing[]> {

        const response =
            await api.get<VendorListing[]>(
                "/customer/services",
                {
                    params: category
                        ? { category }
                        : undefined
                }
            );

        return response.data;

    }

}

export default new VendorListingService();