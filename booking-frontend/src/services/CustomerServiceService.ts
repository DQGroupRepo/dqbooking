import api from "../api/axiosConfig";

import type { VendorListing } from "../types/VendorListing";

class CustomerServiceService {
  async getFeaturedServices(): Promise<VendorListing[]> {
    const response = await api.get<VendorListing[]>(
      "/customer/services/featured",
    );

    return response.data;
  }
}

export default new CustomerServiceService();
