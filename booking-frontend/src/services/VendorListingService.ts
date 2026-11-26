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
                    params: {
                        ...(category ? { category } : {}),
                        ...(location ? { location } : {}),
                        ...(categoryTag ? { categoryTag } : {})
                    }
                }
            );

        return response.data;

    }

}

export default new VendorListingService();